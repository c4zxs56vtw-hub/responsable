import {
  EmployeeAccount,
  ResponsableAccount,
  DepartmentRecord,
  CategoryAttribution,
  AdminDashboardStats,
  AccountStatus,
} from '../types/admin';
import { Ticket, TicketPriority } from '../types/ticket';

export function computeAdminDashboardStats(
  employees: EmployeeAccount[],
  responsables: ResponsableAccount[],
  tickets: Ticket[],
  categories: CategoryAttribution[]
): AdminDashboardStats {
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === 'ACTIF').length;
  const pendingEmployees = employees.filter((e) => e.status === 'EN_ATTENTE_ACTIVATION').length;
  const deactivatedEmployees = employees.filter((e) => e.status === 'DESACTIVE').length;

  // A responsable is active when their role is active and their account is not deactivated
  const activeResponsables = responsables.filter(
    (r) => r.roleActive && r.status !== 'DESACTIVE'
  ).length;

  const totalTickets = tickets.length;
  const waitingTickets = tickets.filter((t) => t.status === 'EN_ATTENTE').length;
  const reopenedTickets = tickets.filter((t) => t.status === 'ROUVERT').length;
  const pendingTickets = waitingTickets + reopenedTickets;
  const inProgressTickets = tickets.filter(
    (t) => t.status === 'DIAGNOSTIC_EN_COURS' || t.status === 'ATTENTE_VALIDATION'
  ).length;
  const resolvedTickets = tickets.filter((t) => t.status === 'RESOLU').length;
  const closedTickets = tickets.filter((t) => t.status === 'CLOTURE').length;

  const unassignedTicketsCount = tickets.filter(
    (t) =>
      (!t.assignedTo || t.assignedTo.trim() === '') &&
      t.status !== 'RESOLU' &&
      t.status !== 'CLOTURE'
  ).length;

  const unassignedCategoriesCount = categories.filter(
    (c) => c.status === 'ACTIVE' && (!c.primaryManagerId || c.primaryManagerId.trim() === '')
  ).length;

  return {
    totalEmployees,
    activeEmployees,
    pendingEmployees,
    deactivatedEmployees,
    activeResponsables,
    totalTickets,
    waitingTickets,
    reopenedTickets,
    pendingTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
    unassignedTicketsCount,
    unassignedCategoriesCount,
  };
}

export function isValidEmailFormat(email: string): boolean {
  const normalized = email.trim();
  if (!normalized) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalized);
}

export function isEmailUnique(
  employees: EmployeeAccount[],
  email: string,
  excludeEmployeeId?: string
): boolean {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  return !employees.some(
    (e) => e.id !== excludeEmployeeId && e.email.trim().toLowerCase() === normalized
  );
}

export function generateNextMatricule(employees: EmployeeAccount[]): string {
  const numbers = employees
    .map((e) => {
      const match = e.matricule.match(/EMP-(\d+)/i);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !Number.isNaN(n));
  const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
  return `EMP-${String(maxNum + 1).padStart(3, '0')}`;
}

export interface AddEmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: string;
  position: string;
  matricule?: string;
  initialStatus?: AccountStatus;
}

export function addEmployeeAccount(
  employees: EmployeeAccount[],
  departments: DepartmentRecord[],
  input: AddEmployeeInput
): { ok: true; employee: EmployeeAccount; employees: EmployeeAccount[] } | { ok: false; error: string } {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const email = input.email.trim().toLowerCase();

  if (!firstName || !lastName || !email || !input.departmentId) {
    return {
      ok: false,
      error: 'Veuillez renseigner le prénom, le nom, l’adresse email professionnelle et le département.',
    };
  }

  if (!isValidEmailFormat(email)) {
    return {
      ok: false,
      error: 'Veuillez saisir une adresse email professionnelle au format valide (ex: prenom.nom@entreprise.com).',
    };
  }

  if (!isEmailUnique(employees, email)) {
    return {
      ok: false,
      error: 'Cette adresse email professionnelle est déjà utilisée par un collaborateur.',
    };
  }

  const dept = departments.find((d) => d.id === input.departmentId);
  const matricule =
    input.matricule && input.matricule.trim() !== ''
      ? input.matricule.trim()
      : generateNextMatricule(employees);

  if (employees.some((e) => e.matricule.toLowerCase() === matricule.toLowerCase())) {
    return {
      ok: false,
      error: `Le matricule ${matricule} est déjà attribué à un autre collaborateur.`,
    };
  }

  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const newEmployee: EmployeeAccount = {
    id: `emp-${Date.now()}`,
    matricule,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    email,
    phone: input.phone.trim() || '+33 1 42 68 55 00',
    departmentId: input.departmentId,
    departmentName: dept ? dept.name : 'Service Général',
    position: input.position.trim() || 'Collaborateur',
    roles: ['EMPLOYE'],
    primaryRoleLabel: 'Employé',
    status: input.initialStatus || 'EN_ATTENTE_ACTIVATION',
    createdAt: dateStr,
    invitationPreparedAt: `${dateStr} à ${timeStr}`,
  };

  return {
    ok: true,
    employee: newEmployee,
    employees: [newEmployee, ...employees],
  };
}

export function updateEmployeeAndSync(
  employees: EmployeeAccount[],
  responsables: ResponsableAccount[],
  departments: DepartmentRecord[],
  categories: CategoryAttribution[],
  tickets: Ticket[],
  updatedEmp: EmployeeAccount
):
  | {
      ok: true;
      employees: EmployeeAccount[];
      responsables: ResponsableAccount[];
      departments: DepartmentRecord[];
      categories: CategoryAttribution[];
      tickets: Ticket[];
    }
  | { ok: false; error: string } {
  const firstName = updatedEmp.firstName.trim();
  const lastName = updatedEmp.lastName.trim();
  const email = updatedEmp.email.trim().toLowerCase();

  if (!firstName || !lastName || !email) {
    return {
      ok: false,
      error: 'Le prénom, le nom et l’adresse email professionnelle sont obligatoires.',
    };
  }

  if (!isValidEmailFormat(email)) {
    return {
      ok: false,
      error: 'Le format de l’adresse email professionnelle est invalide.',
    };
  }

  if (!isEmailUnique(employees, email, updatedEmp.id)) {
    return {
      ok: false,
      error: 'Cette adresse email professionnelle est déjà utilisée par un autre collaborateur.',
    };
  }

  const prevEmp = employees.find((e) => e.id === updatedEmp.id);
  const dept = departments.find((d) => d.id === updatedEmp.departmentId);
  const fullName = `${firstName} ${lastName}`;
  const departmentName = dept ? dept.name : updatedEmp.departmentName;

  const normalizedEmp: EmployeeAccount = {
    ...updatedEmp,
    firstName,
    lastName,
    fullName,
    email,
    departmentName,
  };

  const nextEmployees = employees.map((e) => (e.id === normalizedEmp.id ? normalizedEmp : e));

  const linkedResp = responsables.find((r) => r.employeeId === normalizedEmp.id);
  const nextResponsables = responsables.map((r) => {
    if (r.employeeId !== normalizedEmp.id) return r;
    return {
      ...r,
      fullName,
      email,
      phone: normalizedEmp.phone,
      departmentId: normalizedEmp.departmentId,
      departmentName,
      status: normalizedEmp.status,
      roleActive: normalizedEmp.status === 'DESACTIVE' ? false : r.roleActive,
    };
  });

  const nextDepartments = departments.map((d) => {
    if (linkedResp && d.headManagerId === linkedResp.id) {
      return { ...d, headManagerName: fullName };
    }
    return d;
  });

  const nextCategories = categories.map((c) => {
    let nextCat = { ...c };
    if (linkedResp && c.primaryManagerId === linkedResp.id) {
      nextCat.primaryManagerName = fullName;
    }
    if (linkedResp && c.secondaryManagerId === linkedResp.id) {
      nextCat.secondaryManagerName = fullName;
    }
    return nextCat;
  });

  const nextTickets = tickets.map((t) => {
    if (prevEmp && matchesManagerName(t.assignedTo, prevEmp.fullName)) {
      return {
        ...t,
        assignedTo: fullName,
      };
    }
    return t;
  });

  return {
    ok: true,
    employees: nextEmployees,
    responsables: nextResponsables,
    departments: nextDepartments,
    categories: nextCategories,
    tickets: nextTickets,
  };
}

export function updateEmployeeStatus(
  employees: EmployeeAccount[],
  employeeId: string,
  newStatus: AccountStatus
): EmployeeAccount[] {
  return employees.map((emp) =>
    emp.id === employeeId ? { ...emp, status: newStatus } : emp
  );
}

export function matchesManagerName(assignedTo: string | undefined, managerFullName: string): boolean {
  if (!assignedTo) return false;
  const cleanAssigned = assignedTo.trim().toLowerCase();
  const cleanManager = managerFullName.trim().toLowerCase();
  if (cleanAssigned === cleanManager) return true;
  if (cleanAssigned.includes(cleanManager)) return true;
  // Also match abbreviated "Marc L." with "Marc Lambert"
  const parts = managerFullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    const shortForm = `${parts[0]} ${parts[1][0]}.`.toLowerCase();
    if (cleanAssigned === shortForm || cleanAssigned.startsWith(shortForm)) return true;
  }
  return false;
}

export function listActiveTicketsForResponsable(
  tickets: Ticket[],
  managerFullName: string
): Ticket[] {
  return tickets.filter(
    (t) =>
      (t.status === 'EN_ATTENTE' ||
        t.status === 'ROUVERT' ||
        t.status === 'DIAGNOSTIC_EN_COURS' ||
        t.status === 'ATTENTE_VALIDATION') &&
      matchesManagerName(t.assignedTo, managerFullName)
  );
}

export function countActiveTicketsForResponsable(
  tickets: Ticket[],
  managerFullName: string
): number {
  return listActiveTicketsForResponsable(tickets, managerFullName).length;
}

export interface PromoteEmployeeInput {
  employeeId: string;
  departmentId: string;
  assignedCategories: string[];
  canReceiveUncategorized: boolean;
  isConfidentialHab: boolean;
}

export function promoteEmployeeToResponsable(
  employees: EmployeeAccount[],
  responsables: ResponsableAccount[],
  departments: DepartmentRecord[],
  input: PromoteEmployeeInput,
  categories?: CategoryAttribution[]
):
  | {
      ok: true;
      responsable: ResponsableAccount;
      employees: EmployeeAccount[];
      responsables: ResponsableAccount[];
      categories?: CategoryAttribution[];
    }
  | { ok: false; error: string } {
  const emp = employees.find((e) => e.id === input.employeeId);
  if (!emp) {
    return { ok: false, error: 'Employé introuvable.' };
  }
  if (emp.status === 'DESACTIVE') {
    return { ok: false, error: 'Impossible de promouvoir un compte employé désactivé.' };
  }

  const dept = departments.find((d) => d.id === input.departmentId);
  const departmentName = dept ? dept.name : emp.departmentName;

  const existingResp = responsables.find((r) => r.employeeId === emp.id);
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  const updatedResponsable: ResponsableAccount = existingResp
    ? {
        ...existingResp,
        departmentId: input.departmentId,
        departmentName,
        assignedCategories: input.assignedCategories,
        canReceiveUncategorized: input.canReceiveUncategorized,
        isConfidentialHab: input.isConfidentialHab,
        roleActive: true,
        status: emp.status,
      }
    : {
        id: `resp-${Date.now()}`,
        employeeId: emp.id,
        fullName: emp.fullName,
        email: emp.email,
        phone: emp.phone,
        departmentId: input.departmentId,
        departmentName,
        assignedCategories: input.assignedCategories,
        canReceiveUncategorized: input.canReceiveUncategorized,
        isConfidentialHab: input.isConfidentialHab,
        status: emp.status,
        roleActive: true,
        createdAt: dateStr,
      };

  const updatedEmployees: EmployeeAccount[] = employees.map((e) => {
    if (e.id !== emp.id) return e;
    const roles: EmployeeAccount['roles'] = e.roles.includes('RESPONSABLE')
      ? e.roles
      : [...e.roles, 'RESPONSABLE'];
    return {
      ...e,
      departmentId: input.departmentId,
      departmentName,
      roles,
      primaryRoleLabel: 'Responsable',
    };
  });

  const updatedResponsables = existingResp
    ? responsables.map((r) => (r.id === existingResp.id ? updatedResponsable : r))
    : [updatedResponsable, ...responsables];

  // Sync categories: if an assigned category currently has no primary manager, assign this responsable as primary; otherwise if no secondary manager, assign as secondary
  const updatedCategories = categories
    ? categories.map((cat) => {
        if (!input.assignedCategories.includes(cat.name)) return cat;
        if (!cat.primaryManagerId || cat.primaryManagerId.trim() === '') {
          return {
            ...cat,
            primaryManagerId: updatedResponsable.id,
            primaryManagerName: updatedResponsable.fullName,
          };
        }
        if (
          cat.primaryManagerId !== updatedResponsable.id &&
          (!cat.secondaryManagerId || cat.secondaryManagerId.trim() === '')
        ) {
          return {
            ...cat,
            secondaryManagerId: updatedResponsable.id,
            secondaryManagerName: updatedResponsable.fullName,
          };
        }
        return cat;
      })
    : undefined;

  return {
    ok: true,
    responsable: updatedResponsable,
    employees: updatedEmployees,
    responsables: updatedResponsables,
    categories: updatedCategories,
  };
}

export interface CreateNewResponsableInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: string;
  position: string;
  assignedCategories: string[];
  canReceiveUncategorized: boolean;
  isConfidentialHab: boolean;
}

export function createNewResponsableAccount(
  employees: EmployeeAccount[],
  responsables: ResponsableAccount[],
  departments: DepartmentRecord[],
  input: CreateNewResponsableInput,
  categories?: CategoryAttribution[]
):
  | {
      ok: true;
      employee: EmployeeAccount;
      responsable: ResponsableAccount;
      employees: EmployeeAccount[];
      responsables: ResponsableAccount[];
      categories?: CategoryAttribution[];
    }
  | { ok: false; error: string } {
  const empResult = addEmployeeAccount(employees, departments, {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    departmentId: input.departmentId,
    position: input.position || 'Responsable de Service',
  });

  if (!empResult.ok) {
    return empResult;
  }

  const promotedEmp: EmployeeAccount = {
    ...empResult.employee,
    roles: ['EMPLOYE', 'RESPONSABLE'],
    primaryRoleLabel: 'Responsable',
  };

  const newResp: ResponsableAccount = {
    id: `resp-${Date.now() + 1}`,
    employeeId: promotedEmp.id,
    fullName: promotedEmp.fullName,
    email: promotedEmp.email,
    phone: promotedEmp.phone,
    departmentId: promotedEmp.departmentId,
    departmentName: promotedEmp.departmentName,
    assignedCategories: input.assignedCategories,
    canReceiveUncategorized: input.canReceiveUncategorized,
    isConfidentialHab: input.isConfidentialHab,
    status: 'EN_ATTENTE_ACTIVATION',
    roleActive: true,
    createdAt: promotedEmp.createdAt,
  };

  const updatedCategories = categories
    ? categories.map((cat) => {
        if (!input.assignedCategories.includes(cat.name)) return cat;
        if (!cat.primaryManagerId || cat.primaryManagerId.trim() === '') {
          return {
            ...cat,
            primaryManagerId: newResp.id,
            primaryManagerName: newResp.fullName,
          };
        }
        return cat;
      })
    : undefined;

  return {
    ok: true,
    employee: promotedEmp,
    responsable: newResp,
    employees: [promotedEmp, ...employees],
    responsables: [newResp, ...responsables],
    categories: updatedCategories,
  };
}

export function deactivateOrRemoveResponsable(
  employees: EmployeeAccount[],
  responsables: ResponsableAccount[],
  tickets: Ticket[],
  categories: CategoryAttribution[],
  targetResponsableId: string,
  replacementResponsableId?: string,
  mode: 'DEACTIVATE_ACCESS' | 'REMOVE_ROLE_KEEP_EMPLOYEE' = 'REMOVE_ROLE_KEEP_EMPLOYEE'
):
  | {
      ok: true;
      reassignedCount: number;
      employees: EmployeeAccount[];
      responsables: ResponsableAccount[];
      tickets: Ticket[];
      categories: CategoryAttribution[];
    }
  | { ok: false; error: string; activeTicketsCount: number } {
  const targetResp = responsables.find((r) => r.id === targetResponsableId);
  if (!targetResp) {
    return { ok: false, error: 'Responsable introuvable.', activeTicketsCount: 0 };
  }

  const activeCount = countActiveTicketsForResponsable(tickets, targetResp.fullName);
  const actionLabel =
    mode === 'REMOVE_ROLE_KEEP_EMPLOYEE'
      ? 'retirer ses responsabilités'
      : 'désactiver son compte';

  if (
    activeCount > 0 &&
    (!replacementResponsableId || replacementResponsableId === targetResponsableId)
  ) {
    return {
      ok: false,
      error: `${targetResp.fullName} possède actuellement ${activeCount} signalement${activeCount > 1 ? 's' : ''} ouvert${activeCount > 1 ? 's' : ''}. Veuillez les réattribuer avant de ${actionLabel}.`,
      activeTicketsCount: activeCount,
    };
  }

  const isAdminFallback = replacementResponsableId === 'ADMIN_FALLBACK_UNASSIGNED';
  const replacementResp =
    replacementResponsableId && !isAdminFallback
      ? responsables.find((r) => r.id === replacementResponsableId)
      : undefined;

  if (activeCount > 0 && !replacementResp && !isAdminFallback) {
    return {
      ok: false,
      error: 'Veuillez sélectionner un responsable destinataire valide pour la réattribution.',
      activeTicketsCount: activeCount,
    };
  }

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  let reassignedCount = 0;
  const updatedTickets = tickets.map((t) => {
    const isActive =
      t.status === 'EN_ATTENTE' ||
      t.status === 'ROUVERT' ||
      t.status === 'DIAGNOSTIC_EN_COURS' ||
      t.status === 'ATTENTE_VALIDATION';

    if (isActive && matchesManagerName(t.assignedTo, targetResp.fullName)) {
      if (replacementResp) {
        reassignedCount += 1;
        return {
          ...t,
          assignedTo: replacementResp.fullName,
          targetDepartment: replacementResp.departmentName,
          updatedAt: now.toISOString(),
          timeline: [
            {
              id: `tl-admin-reassign-${Date.now()}-${reassignedCount}`,
              time: timeStr,
              timestamp: now.toISOString(),
              title: `Dossier réattribué à ${replacementResp.fullName}`,
              description: `Réattribution administrative suite au retrait des responsabilités de ${targetResp.fullName}. Continuité de traitement assurée.`,
              author: 'Administration EmployeeCare',
              authorRole: 'Administrateur',
              type: 'assignment' as const,
            },
            ...t.timeline,
          ],
        };
      }
      if (isAdminFallback) {
        reassignedCount += 1;
        return {
          ...t,
          assignedTo: '',
          updatedAt: now.toISOString(),
          timeline: [
            {
              id: `tl-admin-fallback-${Date.now()}-${reassignedCount}`,
              time: timeStr,
              timestamp: now.toISOString(),
              title: `Mise en file d'attente administrative`,
              description: `Dossier placé sous supervision administrative suite au retrait de ${targetResp.fullName} (en attente d'un nouveau responsable habilité).`,
              author: 'Administration EmployeeCare',
              authorRole: 'Administrateur',
              type: 'assignment' as const,
            },
            ...t.timeline,
          ],
        };
      }
    }
    // Historical closed/resolved tickets keep their original author/assignedTo intact!
    return t;
  });

  // Update categories where targetResp was primary or secondary manager
  const updatedCategories = categories.map((cat) => {
    if (cat.primaryManagerId === targetResp.id) {
      return {
        ...cat,
        primaryManagerId: replacementResp ? replacementResp.id : '',
        primaryManagerName: replacementResp ? replacementResp.fullName : '',
      };
    }
    if (cat.secondaryManagerId === targetResp.id) {
      return {
        ...cat,
        secondaryManagerId: undefined,
        secondaryManagerName: undefined,
      };
    }
    return cat;
  });

  const updatedResponsables = responsables.map((r) => {
    if (r.id !== targetResp.id) {
      if (replacementResp && r.id === replacementResp.id) {
        const mergedCats = Array.from(
          new Set([...r.assignedCategories, ...targetResp.assignedCategories])
        );
        return {
          ...r,
          assignedCategories: mergedCats,
        };
      }
      return r;
    }
    return {
      ...r,
      roleActive: false,
      status: mode === 'DEACTIVATE_ACCESS' ? ('DESACTIVE' as AccountStatus) : r.status,
    };
  });

  const updatedEmployees: EmployeeAccount[] = employees.map((e) => {
    if (e.id !== targetResp.employeeId) return e;
    if (mode === 'REMOVE_ROLE_KEEP_EMPLOYEE') {
      return {
        ...e,
        roles: e.roles.filter((role) => role !== 'RESPONSABLE'),
        primaryRoleLabel: 'Employé',
      };
    }
    return {
      ...e,
      roles: e.roles.filter((role) => role !== 'RESPONSABLE'),
      primaryRoleLabel: 'Employé',
      status: 'DESACTIVE',
    };
  });

  return {
    ok: true,
    reassignedCount,
    employees: updatedEmployees,
    responsables: updatedResponsables,
    tickets: updatedTickets,
    categories: updatedCategories,
  };
}

export function updateDepartmentAndSync(
  departments: DepartmentRecord[],
  employees: EmployeeAccount[],
  responsables: ResponsableAccount[],
  categories: CategoryAttribution[],
  tickets: Ticket[],
  updatedDept: DepartmentRecord
): {
  departments: DepartmentRecord[];
  employees: EmployeeAccount[];
  responsables: ResponsableAccount[];
  categories: CategoryAttribution[];
  tickets: Ticket[];
} {
  const prevDept = departments.find((d) => d.id === updatedDept.id);
  const oldName = prevDept?.name;
  const newName = updatedDept.name.trim();

  const nextDepartments = departments.map((d) =>
    d.id === updatedDept.id ? { ...updatedDept, name: newName } : d
  );

  const nextEmployees = employees.map((e) =>
    e.departmentId === updatedDept.id ? { ...e, departmentName: newName } : e
  );

  const nextResponsables = responsables.map((r) =>
    r.departmentId === updatedDept.id ? { ...r, departmentName: newName } : r
  );

  const nextCategories = categories.map((c) =>
    c.departmentId === updatedDept.id ? { ...c, departmentName: newName } : c
  );

  const nextTickets = tickets.map((t) =>
    oldName && t.targetDepartment === oldName ? { ...t, targetDepartment: newName } : t
  );

  return {
    departments: nextDepartments,
    employees: nextEmployees,
    responsables: nextResponsables,
    categories: nextCategories,
    tickets: nextTickets,
  };
}

export function updateCategoryAndSync(
  categories: CategoryAttribution[],
  responsables: ResponsableAccount[],
  tickets: Ticket[],
  updatedCat: CategoryAttribution
): {
  categories: CategoryAttribution[];
  responsables: ResponsableAccount[];
  tickets: Ticket[];
} {
  const prevCat = categories.find((c) => c.id === updatedCat.id);
  const oldName = prevCat?.name;
  const newName = updatedCat.name.trim();

  const normalizedCat: CategoryAttribution = {
    ...updatedCat,
    name: newName,
  };

  const nextCategories = categories.map((c) =>
    c.id === normalizedCat.id ? normalizedCat : c
  );

  const nextResponsables = responsables.map((r) => {
    let cats = r.assignedCategories.map((cName) => (oldName && cName === oldName ? newName : cName));
    if (
      (r.id === normalizedCat.primaryManagerId || r.id === normalizedCat.secondaryManagerId) &&
      !cats.includes(newName)
    ) {
      cats = [...cats, newName];
    }
    return {
      ...r,
      assignedCategories: cats,
    };
  });

  const nextTickets: Ticket[] = tickets.map((t) =>
    oldName && t.category === oldName
      ? { ...t, category: newName as Ticket['category'] }
      : t
  );

  return {
    categories: nextCategories,
    responsables: nextResponsables,
    tickets: nextTickets,
  };
}

export function reassignTicketByAdmin(
  ticket: Ticket,
  newResponsable: ResponsableAccount,
  newPriority?: TicketPriority
): Ticket {
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return {
    ...ticket,
    assignedTo: newResponsable.fullName,
    targetDepartment: newResponsable.departmentName,
    priority: newPriority || ticket.priority,
    updatedAt: now.toISOString(),
    timeline: [
      {
        id: `tl-adm-${Date.now()}`,
        time: timeStr,
        timestamp: now.toISOString(),
        title: `Attribution administrative à ${newResponsable.fullName}`,
        description: `Dossier orienté vers ${newResponsable.departmentName} par l’administrateur.`,
        author: 'Administration EmployeeCare',
        authorRole: 'Administrateur',
        type: 'assignment',
      },
      ...ticket.timeline,
    ],
  };
}

export function isTicketConfidentialRestricted(
  ticket: Ticket,
  categories: CategoryAttribution[]
): boolean {
  if (ticket.confidentiality === 'CONFIDENTIEL' || ticket.confidentiality === 'ANONYME') {
    return true;
  }
  const cat = categories.find((c) => c.name === ticket.category);
  return Boolean(cat?.isSensitiveConfidential);
}
