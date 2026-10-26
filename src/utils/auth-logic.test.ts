import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  AUTH_MESSAGES,
  authenticateUser,
  evaluateRouteAccess,
  validateLoginInput,
  verifyActiveSession,
} from './auth-logic';
import { INITIAL_EMPLOYEES, INITIAL_RESPONSABLES } from '../data/mock-admin';

describe('EmployeeCare Authentication & RBAC Route Protection (8 Mandatory Scenarios)', () => {
  it('Test 1 — Accès non connecté : redirects unauthenticated access on /, /employe, /responsable, /admin to /login', () => {
    const rootEval = evaluateRouteAccess('/', null);
    assert.equal(rootEval.workspace, 'LOGIN');
    assert.equal(rootEval.redirectPath, '/login');

    for (const protectedPath of ['/employe', '/employe/mes-signalements', '/responsable', '/admin', '/admin/employes']) {
      const res = evaluateRouteAccess(protectedPath, null);
      assert.equal(res.allowed, false);
      assert.equal(res.reason, 'UNAUTHENTICATED');
      assert.equal(res.redirectPath, '/login');
    }
  });

  it('Test 2 — Connexion Employé : paul.martin@entreprise.com redirects to /employe and blocks /admin and /responsable', () => {
    const login = authenticateUser(
      'paul.martin@entreprise.com',
      'Employe2026!',
      INITIAL_EMPLOYEES,
      INITIAL_RESPONSABLES
    );
    assert.equal(login.success, true);
    assert.equal(login.redirectPath, '/employe');
    assert.deepEqual(login.session?.roles, ['EMPLOYE']);

    const empAccess = evaluateRouteAccess('/employe', login.session!);
    assert.equal(empAccess.allowed, true);
    assert.equal(empAccess.workspace, 'EMPLOYE');

    const adminAccess = evaluateRouteAccess('/admin', login.session!);
    assert.equal(adminAccess.allowed, false);
    assert.equal(adminAccess.reason, 'FORBIDDEN');

    const respAccess = evaluateRouteAccess('/responsable', login.session!);
    assert.equal(respAccess.allowed, false);
    assert.equal(respAccess.reason, 'FORBIDDEN');
  });

  it('Test 3 — Connexion Responsable : sophie.dubois@entreprise.com redirects to /responsable, allows /employe, blocks /admin', () => {
    const login = authenticateUser(
      'sophie.dubois@entreprise.com',
      'Resp2026!',
      INITIAL_EMPLOYEES,
      INITIAL_RESPONSABLES
    );
    assert.equal(login.success, true);
    assert.equal(login.redirectPath, '/responsable');
    assert.equal(login.session?.roles.includes('RESPONSABLE'), true);
    assert.equal(login.session?.roles.includes('EMPLOYE'), true);

    const respAccess = evaluateRouteAccess('/responsable', login.session!);
    assert.equal(respAccess.allowed, true);

    const empAccess = evaluateRouteAccess('/employe', login.session!);
    assert.equal(empAccess.allowed, true);

    const adminAccess = evaluateRouteAccess('/admin', login.session!);
    assert.equal(adminAccess.allowed, false);
    assert.equal(adminAccess.reason, 'FORBIDDEN');
  });

  it('Test 4 — Connexion Administrateur : admin@entreprise.com redirects to /admin and accesses all admin sub-routes', () => {
    const login = authenticateUser(
      'admin@entreprise.com',
      'Admin2026!',
      INITIAL_EMPLOYEES,
      INITIAL_RESPONSABLES
    );
    assert.equal(login.success, true);
    assert.equal(login.redirectPath, '/admin');
    assert.deepEqual(login.session?.roles, ['ADMINISTRATEUR']);

    for (const path of ['/admin', '/admin/employes', '/admin/responsables', '/admin/departements']) {
      const access = evaluateRouteAccess(path, login.session!);
      assert.equal(access.allowed, true);
      assert.equal(access.workspace, 'ADMIN');
    }
  });

  it('Test 5 — Mauvais identifiants & validation : returns exact French error messages', () => {
    const emptyCheck = validateLoginInput('', '');
    assert.equal(emptyCheck.valid, false);
    assert.equal(emptyCheck.errorMessage, AUTH_MESSAGES.EMPTY_FIELDS);

    const invalidEmailCheck = validateLoginInput('adresse-invalide', 'secret');
    assert.equal(invalidEmailCheck.valid, false);
    assert.equal(invalidEmailCheck.errorMessage, AUTH_MESSAGES.INVALID_EMAIL);

    const wrongPass = authenticateUser(
      'paul.martin@entreprise.com',
      'MauvaisMotDePasse',
      INITIAL_EMPLOYEES,
      INITIAL_RESPONSABLES
    );
    assert.equal(wrongPass.success, false);
    assert.equal(wrongPass.errorCode, 'INVALID_CREDENTIALS');
    assert.equal(wrongPass.errorMessage, AUTH_MESSAGES.INVALID_CREDENTIALS);
  });

  it('Test 7 & 8 — Persistance de session, expiration et Compte désactivé (helene.garnier@entreprise.com)', () => {
    // Deactivated account cannot log in
    const deactivatedLogin = authenticateUser(
      'helene.garnier@entreprise.com',
      'Employe2026!',
      INITIAL_EMPLOYEES,
      INITIAL_RESPONSABLES
    );
    assert.equal(deactivatedLogin.success, false);
    assert.equal(deactivatedLogin.errorCode, 'ACCOUNT_DEACTIVATED');
    assert.equal(deactivatedLogin.errorMessage, AUTH_MESSAGES.ACCOUNT_DEACTIVATED);

    // Active session remains valid on refresh, then fails if account is subsequently deactivated or expired
    const now = 1_700_000_000_000;
    const activeLogin = authenticateUser(
      'paul.martin@entreprise.com',
      'Employe2026!',
      INITIAL_EMPLOYEES,
      INITIAL_RESPONSABLES,
      now
    );
    assert.equal(activeLogin.success, true);

    const checkValid = verifyActiveSession(
      activeLogin.session!,
      INITIAL_EMPLOYEES,
      INITIAL_RESPONSABLES,
      now + 60_000
    );
    assert.equal(checkValid.valid, true);

    // Expired session
    const checkExpired = verifyActiveSession(
      activeLogin.session!,
      INITIAL_EMPLOYEES,
      INITIAL_RESPONSABLES,
      activeLogin.session!.expiresAt + 1
    );
    assert.equal(checkExpired.valid, false);
    assert.equal(checkExpired.errorCode, 'SESSION_EXPIRED');

    // Account deactivated while session existed
    const employeesWithPaulDeactivated = INITIAL_EMPLOYEES.map((e) =>
      e.email === 'paul.martin@entreprise.com' ? { ...e, status: 'DESACTIVE' as const } : e
    );
    const checkDeactivated = verifyActiveSession(
      activeLogin.session!,
      employeesWithPaulDeactivated,
      INITIAL_RESPONSABLES,
      now + 60_000
    );
    assert.equal(checkDeactivated.valid, false);
    assert.equal(checkDeactivated.errorCode, 'ACCOUNT_DEACTIVATED');
  });
});
