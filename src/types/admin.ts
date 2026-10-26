import { TicketCategory, TicketPriority } from './ticket';

export type AccountStatus = 'ACTIF' | 'EN_ATTENTE_ACTIVATION' | 'DESACTIVE';

export type UserRole = 'EMPLOYE' | 'RESPONSABLE' | 'ADMINISTRATEUR';

export interface SessionProfile {
  id: string;
  fullName: string;
  email: string;
  roleLabel: string;
  roles: UserRole[];
  departmentName?: string;
}

export interface EmployeeAccount {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  position: string;
  roles: UserRole[]; // An employee promoted to Responsable has ['EMPLOYE', 'RESPONSABLE']
  primaryRoleLabel: 'Employé' | 'Responsable' | 'Administrateur';
  status: AccountStatus;
  createdAt: string; // e.g. '12/01/2026'
  invitationPreparedAt?: string;
}

export interface ResponsableAccount {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  assignedCategories: string[];
  canReceiveUncategorized: boolean;
  isConfidentialHab: boolean; // Habilitated for sensitive/confidential reports
  status: AccountStatus;
  roleActive: boolean; // Whether the Responsable role is active
  createdAt: string;
  avatar?: string;
}

export interface DepartmentRecord {
  id: string;
  name: string;
  code: string;
  description: string;
  headManagerId: string; // Responsable principal ID
  headManagerName: string;
  status: 'ACTIF' | 'INACTIF';
  createdAt: string;
}

export interface CategoryAttribution {
  id: string;
  name: TicketCategory | string;
  description: string;
  departmentId: string;
  departmentName: string;
  primaryManagerId: string;
  primaryManagerName: string;
  secondaryManagerId?: string;
  secondaryManagerName?: string;
  defaultPriority: TicketPriority;
  isSensitiveConfidential: boolean;
  restrictedHandlerIds: string[]; // Authorized handlers when isSensitiveConfidential is true
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AdminActivityEvent {
  id: string;
  date: string;
  timestamp: string;
  type:
    | 'EMPLOYEE_ADDED'
    | 'MANAGER_ADDED'
    | 'MANAGER_REMOVED'
    | 'DEPARTMENT_CREATED'
    | 'ATTRIBUTION_UPDATED'
    | 'TICKET_REASSIGNED'
    | 'ACCOUNT_STATUS';
  title: string;
  description: string;
  actor: string;
}

export interface AdminCompanySettings {
  companyName: string;
  companySubtitle: string;
  contactEmail: string;
  invitationValidityHours: number;
  requireManualActivation: boolean;
  archiveDeactivatedAccountsDays: number;
  autoAssignByCategory: boolean;
  defaultFallbackPriority: TicketPriority;
  notifyAdminOnUnassignedTicket: boolean;
  notifyManagerOnAssignment: boolean;
  notifyEmployeeOnStatusChange: boolean;
}

export interface AdminDashboardStats {
  totalEmployees: number;       // Nombre total de collaborateurs (Actifs + En attente + Désactivés)
  activeEmployees: number;      // Employés actifs
  pendingEmployees: number;     // Comptes en attente d'activation
  deactivatedEmployees: number; // Comptes désactivés
  activeResponsables: number;   // Responsables avec rôle actif et compte non désactivé
  totalTickets: number;         // Nombre total de signalements (sans double comptage)
  waitingTickets: number;       // EN_ATTENTE uniquement
  reopenedTickets: number;      // ROUVERT uniquement
  pendingTickets: number;       // EN_ATTENTE + ROUVERT
  inProgressTickets: number;    // DIAGNOSTIC_EN_COURS + ATTENTE_VALIDATION
  resolvedTickets: number;      // RESOLU
  closedTickets: number;        // CLOTURE
  unassignedTicketsCount: number;
  unassignedCategoriesCount: number;
}
