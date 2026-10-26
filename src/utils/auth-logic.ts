import { EmployeeAccount, ResponsableAccount, SessionProfile, UserRole } from '../types/admin';

export type AppWorkspace = 'LOGIN' | 'EMPLOYE' | 'RESPONSABLE' | 'ADMIN';

export interface AuthSession {
  userId: string;
  employeeId?: string;
  responsableId?: string;
  fullName: string;
  email: string;
  roles: UserRole[];
  roleLabel: string;
  departmentName?: string;
  issuedAt: number;
  expiresAt: number;
}

export interface AuthValidationResult {
  valid: boolean;
  errorMessage?: string;
}

export interface LoginResult {
  success: boolean;
  session?: AuthSession;
  redirectPath?: string;
  errorMessage?: string;
  errorCode?:
    | 'EMPTY_FIELDS'
    | 'INVALID_EMAIL'
    | 'INVALID_CREDENTIALS'
    | 'ACCOUNT_DEACTIVATED'
    | 'SESSION_EXPIRED'
    | 'SERVER_ERROR';
}

export interface RouteAccessEvaluation {
  workspace: AppWorkspace;
  subView?: string;
  allowed: boolean;
  reason?: 'UNAUTHENTICATED' | 'FORBIDDEN';
  redirectPath?: string;
}

export const AUTH_MESSAGES = {
  EMPTY_FIELDS: 'Veuillez renseigner votre adresse email et votre mot de passe.',
  INVALID_EMAIL: 'Veuillez saisir une adresse email valide.',
  INVALID_CREDENTIALS: 'Adresse email ou mot de passe incorrect.',
  ACCOUNT_DEACTIVATED:
    "Ce compte a été désactivé. Veuillez contacter l'administrateur de votre entreprise.",
  SESSION_EXPIRED: 'Votre session a expiré. Veuillez vous reconnecter.',
  SERVER_ERROR: 'Impossible de se connecter pour le moment. Veuillez réessayer.',
} as const;

export const SESSION_STORAGE_KEY = 'employeecare_auth_session_v1';
export const DEFAULT_SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates login form inputs prior to authentication request.
 */
export function validateLoginInput(email: string, password: string): AuthValidationResult {
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    return {
      valid: false,
      errorMessage: AUTH_MESSAGES.EMPTY_FIELDS,
    };
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return {
      valid: false,
      errorMessage: AUTH_MESSAGES.INVALID_EMAIL,
    };
  }

  return { valid: true };
}

/**
 * Returns the default home path for a given set of verified user roles.
 * Priority: ADMINISTRATEUR -> /admin, RESPONSABLE -> /responsable, EMPLOYE -> /employe
 */
export function getDefaultPathForRoles(roles: UserRole[]): string {
  if (roles.includes('ADMINISTRATEUR')) {
    return '/admin';
  }
  if (roles.includes('RESPONSABLE')) {
    return '/responsable';
  }
  return '/employe';
}

/**
 * Converts an AuthSession into a SessionProfile compatible with existing headers/sidebars.
 */
export function sessionToProfile(session: AuthSession): SessionProfile {
  return {
    id: session.userId,
    fullName: session.fullName,
    email: session.email,
    roleLabel: session.roleLabel,
    roles: session.roles,
    departmentName: session.departmentName,
  };
}

/**
 * Development / Demo directory of known accounts and their passwords.
 * Clearly isolated from UI components; in production, this is replaced by POST /api/auth/login (Spring Boot + Spring Security).
 */
interface DemoCredentialRecord {
  email: string;
  acceptedPasswords: string[];
  defaultProfile: {
    userId: string;
    employeeId?: string;
    responsableId?: string;
    fullName: string;
    roles: UserRole[];
    roleLabel: string;
    departmentName?: string;
  };
}

const DEMO_CREDENTIALS_DIRECTORY: DemoCredentialRecord[] = [
  {
    email: 'admin@entreprise.com',
    acceptedPasswords: ['Admin2026!', 'EmployeeCare2026!', 'admin123', 'password'],
    defaultProfile: {
      userId: 'usr-admin-01',
      fullName: 'Henri Rochefort',
      roles: ['ADMINISTRATEUR'],
      roleLabel: 'Administrateur Principal',
      departmentName: 'Direction Générale & Gouvernance',
    },
  },
  {
    email: 'henri.rochefort@entreprise.com',
    acceptedPasswords: ['Admin2026!', 'EmployeeCare2026!', 'admin123', 'password'],
    defaultProfile: {
      userId: 'usr-admin-01',
      fullName: 'Henri Rochefort',
      roles: ['ADMINISTRATEUR'],
      roleLabel: 'Administrateur Principal',
      departmentName: 'Direction Générale & Gouvernance',
    },
  },
  {
    email: 'sophie.dubois@entreprise.com',
    acceptedPasswords: ['Resp2026!', 'EmployeeCare2026!', 'sophie123', 'password'],
    defaultProfile: {
      userId: 'usr-resp-01',
      employeeId: 'emp-002',
      responsableId: 'resp-sophie',
      fullName: 'Sophie Dubois',
      roles: ['RESPONSABLE', 'EMPLOYE'],
      roleLabel: 'Responsable Informatique',
      departmentName: 'Pôle Informatique et Infrastructure',
    },
  },
  {
    email: 'marie.laurent@entreprise.com',
    acceptedPasswords: ['Resp2026!', 'EmployeeCare2026!', 'marie123', 'password'],
    defaultProfile: {
      userId: 'usr-resp-02',
      employeeId: 'emp-003',
      responsableId: 'resp-marie',
      fullName: 'Marie Laurent',
      roles: ['RESPONSABLE', 'EMPLOYE'],
      roleLabel: 'Directrice Adjointe RH',
      departmentName: 'Direction des Ressources Humaines',
    },
  },
  {
    email: 'jean.bernard@entreprise.com',
    acceptedPasswords: ['Resp2026!', 'EmployeeCare2026!', 'jean123', 'password'],
    defaultProfile: {
      userId: 'usr-resp-03',
      employeeId: 'emp-004',
      responsableId: 'resp-jean',
      fullName: 'Jean Bernard',
      roles: ['RESPONSABLE', 'EMPLOYE'],
      roleLabel: 'Responsable Services Généraux',
      departmentName: 'Pôle Services Généraux et Maintenance',
    },
  },
  {
    email: 'paul.martin@entreprise.com',
    acceptedPasswords: ['Employe2026!', 'EmployeeCare2026!', 'paul123', 'password'],
    defaultProfile: {
      userId: 'usr-emp-01',
      employeeId: 'emp-001',
      fullName: 'Paul Martin',
      roles: ['EMPLOYE'],
      roleLabel: 'Comptable Général',
      departmentName: 'Comptabilité et Finances',
    },
  },
];

/**
 * Authenticates a user against the live application state (employees & responsables)
 * and the isolated development credentials provider.
 * Never derives roles from email patterns or URL query params.
 */
export function authenticateUser(
  email: string,
  password: string,
  employees: EmployeeAccount[],
  responsables: ResponsableAccount[],
  nowMs: number = Date.now()
): LoginResult {
  const validation = validateLoginInput(email, password);
  if (!validation.valid) {
    const isEmpty = !email.trim() || !password.trim();
    return {
      success: false,
      errorMessage: validation.errorMessage,
      errorCode: isEmpty ? 'EMPTY_FIELDS' : 'INVALID_EMAIL',
    };
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check if the user exists in the live EmployeeAccount list (reflecting Admin changes in real time)
  const employeeRecord = employees.find(
    (emp) => emp.email.trim().toLowerCase() === normalizedEmail
  );

  // Check if the user is in the static demo directory (e.g., Henri Rochefort admin@entreprise.com)
  const demoEntry = DEMO_CREDENTIALS_DIRECTORY.find(
    (entry) => entry.email.toLowerCase() === normalizedEmail
  );

  if (!employeeRecord && !demoEntry) {
    return {
      success: false,
      errorMessage: AUTH_MESSAGES.INVALID_CREDENTIALS,
      errorCode: 'INVALID_CREDENTIALS',
    };
  }

  // Verify password against demo entry or standard demo password for newly created employees by Admin
  const validPasswords = demoEntry
    ? demoEntry.acceptedPasswords
    : ['Employe2026!', 'EmployeeCare2026!', 'password'];

  if (!validPasswords.includes(password)) {
    return {
      success: false,
      errorMessage: AUTH_MESSAGES.INVALID_CREDENTIALS,
      errorCode: 'INVALID_CREDENTIALS',
    };
  }

  // Check account activation status from live EmployeeAccount state (Test 8: Compte désactivé)
  if (employeeRecord && employeeRecord.status === 'DESACTIVE') {
    return {
      success: false,
      errorMessage: AUTH_MESSAGES.ACCOUNT_DEACTIVATED,
      errorCode: 'ACCOUNT_DEACTIVATED',
    };
  }

  // Determine roles from the authoritative employee/responsable records (or admin record)
  let verifiedRoles: UserRole[] = [];
  let fullName = '';
  let roleLabel = '';
  let departmentName: string | undefined;
  let userId = '';
  let employeeId: string | undefined;
  let responsableId: string | undefined;

  if (employeeRecord) {
    employeeId = employeeRecord.id;
    userId = demoEntry?.defaultProfile.userId || `usr-${employeeRecord.id}`;
    fullName = employeeRecord.fullName;
    departmentName = employeeRecord.departmentName;

    // Synchronize roles with live ResponsableAccount state
    const activeResp = responsables.find(
      (r) =>
        (r.employeeId === employeeRecord.id ||
          r.email.trim().toLowerCase() === normalizedEmail) &&
        r.roleActive &&
        r.status !== 'DESACTIVE'
    );

    const roleSet = new Set<UserRole>(employeeRecord.roles);
    if (activeResp) {
      roleSet.add('RESPONSABLE');
      roleSet.add('EMPLOYE');
      responsableId = activeResp.id;
    } else {
      roleSet.delete('RESPONSABLE');
    }

    if (roleSet.size === 0) {
      roleSet.add('EMPLOYE');
    }

    verifiedRoles = Array.from(roleSet);
    if (verifiedRoles.includes('ADMINISTRATEUR')) {
      roleLabel = 'Administrateur';
    } else if (verifiedRoles.includes('RESPONSABLE')) {
      roleLabel = employeeRecord.position || 'Responsable';
    } else {
      roleLabel = employeeRecord.position || 'Employé';
    }
  } else if (demoEntry) {
    userId = demoEntry.defaultProfile.userId;
    employeeId = demoEntry.defaultProfile.employeeId;
    responsableId = demoEntry.defaultProfile.responsableId;
    fullName = demoEntry.defaultProfile.fullName;
    verifiedRoles = [...demoEntry.defaultProfile.roles];
    roleLabel = demoEntry.defaultProfile.roleLabel;
    departmentName = demoEntry.defaultProfile.departmentName;
  }

  const session: AuthSession = {
    userId,
    employeeId,
    responsableId,
    fullName,
    email: normalizedEmail,
    roles: verifiedRoles,
    roleLabel,
    departmentName,
    issuedAt: nowMs,
    expiresAt: nowMs + DEFAULT_SESSION_DURATION_MS,
  };

  return {
    success: true,
    session,
    redirectPath: getDefaultPathForRoles(verifiedRoles),
  };
}

/**
 * Checks whether an existing session is still valid (not expired and account not deactivated).
 */
export function verifyActiveSession(
  session: AuthSession | null,
  employees: EmployeeAccount[],
  responsables: ResponsableAccount[],
  nowMs: number = Date.now()
): { valid: boolean; updatedSession?: AuthSession; errorCode?: 'SESSION_EXPIRED' | 'ACCOUNT_DEACTIVATED' } {
  if (!session) {
    return { valid: false };
  }

  if (nowMs >= session.expiresAt) {
    return { valid: false, errorCode: 'SESSION_EXPIRED' };
  }

  const normalizedEmail = session.email.trim().toLowerCase();
  const employeeRecord = employees.find(
    (emp) =>
      emp.id === session.employeeId ||
      emp.email.trim().toLowerCase() === normalizedEmail
  );

  if (employeeRecord) {
    if (employeeRecord.status === 'DESACTIVE') {
      return { valid: false, errorCode: 'ACCOUNT_DEACTIVATED' };
    }

    const activeResp = responsables.find(
      (r) =>
        (r.employeeId === employeeRecord.id ||
          r.email.trim().toLowerCase() === normalizedEmail) &&
        r.roleActive &&
        r.status !== 'DESACTIVE'
    );

    const roleSet = new Set<UserRole>(employeeRecord.roles);
    if (activeResp) {
      roleSet.add('RESPONSABLE');
      roleSet.add('EMPLOYE');
    } else {
      roleSet.delete('RESPONSABLE');
    }
    if (roleSet.size === 0) {
      roleSet.add('EMPLOYE');
    }

    const updatedRoles = Array.from(roleSet);
    return {
      valid: true,
      updatedSession: {
        ...session,
        fullName: employeeRecord.fullName,
        departmentName: employeeRecord.departmentName,
        roles: updatedRoles,
        responsableId: activeResp?.id,
      },
    };
  }

  return { valid: true, updatedSession: session };
}

/**
 * Evaluates a URL pathname against the current authenticated session.
 * Enforces strict route protection and role-based access control.
 */
export function evaluateRouteAccess(
  pathname: string,
  session: AuthSession | null
): RouteAccessEvaluation {
  const cleanPath = (pathname || '/').split('?')[0].replace(/\/+$/, '') || '/';

  // Root or /login
  if (cleanPath === '/' || cleanPath === '/login') {
    if (session) {
      const target = getDefaultPathForRoles(session.roles);
      return {
        workspace: target === '/admin' ? 'ADMIN' : target === '/responsable' ? 'RESPONSABLE' : 'EMPLOYE',
        allowed: true,
        redirectPath: target,
      };
    }
    return {
      workspace: 'LOGIN',
      allowed: true,
      redirectPath: '/login',
    };
  }

  // Protected routes require authentication
  if (!session) {
    return {
      workspace: 'LOGIN',
      allowed: false,
      reason: 'UNAUTHENTICATED',
      redirectPath: '/login',
    };
  }

  // /admin* routes
  if (cleanPath === '/admin' || cleanPath.startsWith('/admin/')) {
    const subSegment = cleanPath.slice('/admin'.length).replace(/^\/+/, '');
    const adminViewMap: Record<string, string> = {
      '': 'dashboard',
      employes: 'employees',
      responsables: 'responsables',
      departements: 'departments',
      categories: 'categories',
      signalements: 'signalements',
      rapports: 'reports',
      parametres: 'settings',
    };
    const subView = adminViewMap[subSegment] || 'dashboard';

    if (!session.roles.includes('ADMINISTRATEUR')) {
      return {
        workspace: 'ADMIN',
        subView,
        allowed: false,
        reason: 'FORBIDDEN',
      };
    }
    return {
      workspace: 'ADMIN',
      subView,
      allowed: true,
    };
  }

  // /responsable* routes
  if (cleanPath === '/responsable' || cleanPath.startsWith('/responsable/')) {
    const subSegment = cleanPath.slice('/responsable'.length).replace(/^\/+/, '');
    const respViewMap: Record<string, string> = {
      '': 'dashboard',
      signalements: 'received',
      'a-traiter': 'to_treat',
      'en-cours': 'in_progress',
      resolus: 'resolved',
      historique: 'history',
      rapports: 'reports',
      parametres: 'settings',
    };
    const subView = respViewMap[subSegment] || 'dashboard';

    if (!session.roles.includes('RESPONSABLE')) {
      return {
        workspace: 'RESPONSABLE',
        subView,
        allowed: false,
        reason: 'FORBIDDEN',
      };
    }
    return {
      workspace: 'RESPONSABLE',
      subView,
      allowed: true,
    };
  }

  // /employe* routes
  if (cleanPath === '/employe' || cleanPath.startsWith('/employe/')) {
    const subSegment = cleanPath.slice('/employe'.length).replace(/^\/+/, '');
    const empViewMap: Record<string, string> = {
      '': 'Accueil',
      'mes-signalements': 'Mes signalements',
      'nouveau-signalement': 'Créer un signalement',
      ressources: 'Ressources',
    };
    const subView = empViewMap[subSegment] || 'Accueil';

    if (!session.roles.includes('EMPLOYE')) {
      return {
        workspace: 'EMPLOYE',
        subView,
        allowed: false,
        reason: 'FORBIDDEN',
      };
    }
    return {
      workspace: 'EMPLOYE',
      subView,
      allowed: true,
    };
  }

  // Fallback for unknown paths: redirect to user's default authorized path
  return {
    workspace: 'LOGIN',
    allowed: true,
    redirectPath: getDefaultPathForRoles(session.roles),
  };
}

/**
 * Maps an internal view change back to a clean URL path.
 */
export function getPathForWorkspaceView(
  workspace: AppWorkspace,
  subView?: string
): string {
  if (workspace === 'LOGIN') return '/login';

  if (workspace === 'ADMIN') {
    const map: Record<string, string> = {
      dashboard: '/admin',
      employees: '/admin/employes',
      responsables: '/admin/responsables',
      departments: '/admin/departements',
      categories: '/admin/categories',
      signalements: '/admin/signalements',
      reports: '/admin/rapports',
      settings: '/admin/parametres',
    };
    return (subView && map[subView]) || '/admin';
  }

  if (workspace === 'RESPONSABLE') {
    const map: Record<string, string> = {
      dashboard: '/responsable',
      received: '/responsable/signalements',
      to_treat: '/responsable/a-traiter',
      in_progress: '/responsable/en-cours',
      resolved: '/responsable/resolus',
      history: '/responsable/historique',
      reports: '/responsable/rapports',
      settings: '/responsable/parametres',
    };
    return (subView && map[subView]) || '/responsable';
  }

  if (workspace === 'EMPLOYE') {
    const map: Record<string, string> = {
      Accueil: '/employe',
      'Mes signalements': '/employe/mes-signalements',
      'Créer un signalement': '/employe/nouveau-signalement',
      Ressources: '/employe/ressources',
    };
    return (subView && map[subView]) || '/employe';
  }

  return '/login';
}
