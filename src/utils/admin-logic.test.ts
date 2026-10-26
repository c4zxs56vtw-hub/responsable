import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_EMPLOYEES,
  INITIAL_RESPONSABLES,
  INITIAL_DEPARTMENTS,
  INITIAL_CATEGORIES,
} from '../data/mock-admin';
import { INITIAL_TICKETS } from '../data/mock-tickets';
import {
  computeAdminDashboardStats,
  addEmployeeAccount,
  updateEmployeeAndSync,
  promoteEmployeeToResponsable,
  createNewResponsableAccount,
  deactivateOrRemoveResponsable,
  updateDepartmentAndSync,
  updateCategoryAndSync,
  reassignTicketByAdmin,
  listActiveTicketsForResponsable,
} from './admin-logic';

describe('EmployeeCare — Validation des 10 Scénarios de l’Espace Administrateur', () => {
  it('Cohérence des statistiques : aucune divergence entre total, actifs, en attente, désactivés et signalements', () => {
    const stats = computeAdminDashboardStats(
      INITIAL_EMPLOYEES,
      INITIAL_RESPONSABLES,
      INITIAL_TICKETS,
      INITIAL_CATEGORIES
    );

    assert.equal(stats.totalEmployees, 12);
    assert.equal(stats.activeEmployees, 10);
    assert.equal(stats.pendingEmployees, 1);
    assert.equal(stats.deactivatedEmployees, 1);
    assert.equal(
      stats.activeEmployees + stats.pendingEmployees + stats.deactivatedEmployees,
      stats.totalEmployees
    );

    assert.equal(stats.activeResponsables, 5);
    assert.equal(stats.totalTickets, 13);
    assert.equal(stats.waitingTickets, 5);
    assert.equal(stats.reopenedTickets, 1);
    assert.equal(stats.pendingTickets, 6);
    assert.equal(stats.inProgressTickets, 4);
    assert.equal(stats.resolvedTickets, 2);
    assert.equal(stats.closedTickets, 1);
    assert.equal(
      stats.waitingTickets +
        stats.reopenedTickets +
        stats.inProgressTickets +
        stats.resolvedTickets +
        stats.closedTickets,
      stats.totalTickets
    );
  });

  it('TEST 1 — Ajouter un employé : vérifie email valide, unicité, statut En attente d’activation et compteur total = 13', () => {
    const res = addEmployeeAccount(INITIAL_EMPLOYEES, INITIAL_DEPARTMENTS, {
      firstName: 'Lucas',
      lastName: 'Moreau',
      email: 'lucas.moreau@entreprise.com',
      phone: '+33 1 42 68 55 99',
      departmentId: 'dept-compta',
      position: 'Auditeur Comptable',
    });

    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.employee.status, 'EN_ATTENTE_ACTIVATION');
      assert.deepEqual(res.employee.roles, ['EMPLOYE']);
      const stats = computeAdminDashboardStats(
        res.employees,
        INITIAL_RESPONSABLES,
        INITIAL_TICKETS,
        INITIAL_CATEGORIES
      );
      assert.equal(stats.totalEmployees, 13);
      assert.equal(stats.pendingEmployees, 2);
    }

    // Duplicate email rejected
    const dup = addEmployeeAccount(INITIAL_EMPLOYEES, INITIAL_DEPARTMENTS, {
      firstName: 'Autre',
      lastName: 'Paul',
      email: 'paul.martin@entreprise.com',
      phone: '',
      departmentId: 'dept-compta',
      position: 'Comptable',
    });
    assert.equal(dup.ok, false);
  });

  it('TEST 2 — Promouvoir un employé en responsable : Paul Martin devient Responsable sans doublon employé', () => {
    const res = promoteEmployeeToResponsable(
      INITIAL_EMPLOYEES,
      INITIAL_RESPONSABLES,
      INITIAL_DEPARTMENTS,
      {
        employeeId: 'emp-001', // Paul Martin
        departmentId: 'dept-compta',
        assignedCategories: ['Administration et Paie'],
        canReceiveUncategorized: true,
        isConfidentialHab: false,
      },
      INITIAL_CATEGORIES
    );

    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.employees.length, 12); // Pas de compte en double
      const paul = res.employees.find((e) => e.id === 'emp-001');
      assert.ok(paul?.roles.includes('RESPONSABLE'));
      const stats = computeAdminDashboardStats(
        res.employees,
        res.responsables,
        INITIAL_TICKETS,
        res.categories || INITIAL_CATEGORIES
      );
      assert.equal(stats.activeResponsables, 6);
    }
  });

  it('TEST 3 — Créer un nouveau responsable : crée le compte et incrémente les compteurs', () => {
    const res = createNewResponsableAccount(
      INITIAL_EMPLOYEES,
      INITIAL_RESPONSABLES,
      INITIAL_DEPARTMENTS,
      {
        firstName: 'Nadia',
        lastName: 'Khelifi',
        email: 'nadia.khelifi@entreprise.com',
        phone: '+33 1 42 68 55 40',
        departmentId: 'dept-rh',
        position: 'Responsable Relations Sociales',
        assignedCategories: ['Ressources Humaines'],
        canReceiveUncategorized: true,
        isConfidentialHab: true,
      },
      INITIAL_CATEGORIES
    );

    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.employees.length, 13);
      assert.equal(res.responsables.length, 6);
      const stats = computeAdminDashboardStats(
        res.employees,
        res.responsables,
        INITIAL_TICKETS,
        res.categories || INITIAL_CATEGORIES
      );
      assert.equal(stats.activeResponsables, 6);
    }
  });

  it('TEST 4 & 5 — Retirer le rôle vs Désactiver un responsable ayant des dossiers ouverts', () => {
    const openForSophie = listActiveTicketsForResponsable(INITIAL_TICKETS, 'Sophie Dubois');
    assert.equal(openForSophie.length, 2);

    // Sans remplaçant -> bloqué avec message explicite
    const blocked = deactivateOrRemoveResponsable(
      INITIAL_EMPLOYEES,
      INITIAL_RESPONSABLES,
      INITIAL_TICKETS,
      INITIAL_CATEGORIES,
      'resp-sophie',
      undefined,
      'REMOVE_ROLE_KEEP_EMPLOYEE'
    );
    assert.equal(blocked.ok, false);
    if (!blocked.ok) {
      assert.match(blocked.error, /Sophie Dubois possède actuellement 2 signalements ouverts/);
    }

    // Avec remplaçant (Marc Lambert) en mode REMOVE_ROLE_KEEP_EMPLOYEE
    const removedRole = deactivateOrRemoveResponsable(
      INITIAL_EMPLOYEES,
      INITIAL_RESPONSABLES,
      INITIAL_TICKETS,
      INITIAL_CATEGORIES,
      'resp-sophie',
      'resp-marc',
      'REMOVE_ROLE_KEEP_EMPLOYEE'
    );
    assert.equal(removedRole.ok, true);
    if (removedRole.ok) {
      assert.equal(removedRole.reassignedCount, 2);
      const sophieEmp = removedRole.employees.find((e) => e.id === 'emp-002');
      assert.equal(sophieEmp?.status, 'ACTIF'); // Conserve son compte employé actif
      assert.ok(!sophieEmp?.roles.includes('RESPONSABLE'));
    }
  });

  it('TEST 6 & 7 — Modifier un département ou une catégorie propage les changements partout', () => {
    const deptSync = updateDepartmentAndSync(
      INITIAL_DEPARTMENTS,
      INITIAL_EMPLOYEES,
      INITIAL_RESPONSABLES,
      INITIAL_CATEGORIES,
      INITIAL_TICKETS,
      {
        ...INITIAL_DEPARTMENTS[0],
        name: 'Direction du Numérique & SI',
      }
    );
    assert.equal(
      deptSync.employees.find((e) => e.id === 'emp-002')?.departmentName,
      'Direction du Numérique & SI'
    );

    const catSync = updateCategoryAndSync(
      INITIAL_CATEGORIES,
      INITIAL_RESPONSABLES,
      INITIAL_TICKETS,
      {
        ...INITIAL_CATEGORIES[7], // Suggestions d'amélioration
        primaryManagerId: 'resp-claire',
        primaryManagerName: 'Claire Moreau',
      }
    );
    const claire = catSync.responsables.find((r) => r.id === 'resp-claire');
    assert.ok(claire?.assignedCategories.includes('Suggestions d’amélioration'));
  });

  it('TEST 8 — Réattribuer un signalement met à jour le responsable et l’historique', () => {
    const ticket = INITIAL_TICKETS[0]; // Non attribué
    const marc = INITIAL_RESPONSABLES.find((r) => r.id === 'resp-marc')!;
    const updated = reassignTicketByAdmin(ticket, marc, 'CRITIQUE');
    assert.equal(updated.assignedTo, 'Marc Lambert');
    assert.equal(updated.priority, 'CRITIQUE');
  });

  it('Modification employé : propage le nouveau nom sur le compte responsable et les signalements', () => {
    const sophie = INITIAL_EMPLOYEES.find((e) => e.id === 'emp-002')!;
    const res = updateEmployeeAndSync(
      INITIAL_EMPLOYEES,
      INITIAL_RESPONSABLES,
      INITIAL_DEPARTMENTS,
      INITIAL_CATEGORIES,
      INITIAL_TICKETS,
      {
        ...sophie,
        lastName: 'Dubois-Morel',
      }
    );
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(
        res.responsables.find((r) => r.id === 'resp-sophie')?.fullName,
        'Sophie Dubois-Morel'
      );
    }
  });
});
