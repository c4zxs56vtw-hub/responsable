/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Ticket, ResponsibleUser, TicketPriority } from './types/ticket';
import {
  EmployeeAccount,
  ResponsableAccount,
  DepartmentRecord,
  CategoryAttribution,
  AdminActivityEvent,
  AdminCompanySettings,
  AccountStatus,
  SessionProfile,
} from './types/admin';
import { CURRENT_MANAGER, AVAILABLE_MANAGERS, INITIAL_TICKETS } from './data/mock-tickets';
import {
  INITIAL_EMPLOYEES,
  INITIAL_RESPONSABLES,
  INITIAL_DEPARTMENTS,
  INITIAL_CATEGORIES,
  INITIAL_ADMIN_EVENTS,
  INITIAL_ADMIN_SETTINGS,
} from './data/mock-admin';
import {
  filterTickets,
  computeMetrics,
  takeChargeTicket,
  proposeResolution,
  confirmClosure,
  reopenTicket,
  addMessage,
} from './utils/ticket-logic';
import {
  computeAdminDashboardStats,
  addEmployeeAccount,
  updateEmployeeAndSync,
  updateEmployeeStatus,
  promoteEmployeeToResponsable,
  createNewResponsableAccount,
  deactivateOrRemoveResponsable,
  updateDepartmentAndSync,
  updateCategoryAndSync,
  reassignTicketByAdmin,
  countActiveTicketsForResponsable,
  AddEmployeeInput,
  PromoteEmployeeInput,
  CreateNewResponsableInput,
} from './utils/admin-logic';

// Espace Administrateur components
import { AdminSidebar, AdminViewId } from './components/admin/AdminSidebar';
import { AdminHeader } from './components/admin/AdminHeader';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { AdminEmployeesView } from './components/admin/AdminEmployeesView';
import { AdminResponsablesView } from './components/admin/AdminResponsablesView';
import { AdminDepartmentsView } from './components/admin/AdminDepartmentsView';
import { AdminCategoriesView } from './components/admin/AdminCategoriesView';
import { AdminSignalementsView } from './components/admin/AdminSignalementsView';
import { AdminReportsView } from './components/admin/AdminReportsView';
import { AdminSettingsView } from './components/admin/AdminSettingsView';
import { LoginView } from './components/admin/LoginView';

// Espace Responsable components (preserved intact)
import { ResponsibleSidebar } from './components/ResponsibleSidebar';
import { ResponsibleHeader } from './components/ResponsibleHeader';
import { OperationalHeader } from './components/OperationalHeader';
import { DashboardMetrics } from './components/DashboardMetrics';
import { FilterBar } from './components/FilterBar';
import { TicketList } from './components/TicketList';
import { TicketDetailPanel } from './components/TicketDetailPanel';

import { ResolutionModal } from './components/ResolutionModal';
import { NewTicketModal } from './components/NewTicketModal';
import { TechnicianModal } from './components/TechnicianModal';
import { AuditExportModal } from './components/AuditExportModal';
import { EmployeePortalModal } from './components/EmployeePortalModal';
import { ViewsAstreinteModal } from './components/ViewsAstreinteModal';

import { TicketRegisterView } from './components/TicketRegisterView';
import { InterventionHistoryView } from './components/InterventionHistoryView';
import { DepartmentReportsView } from './components/DepartmentReportsView';
import { ResponsibleSettingsView } from './components/ResponsibleSettingsView';

const DEMO_PROFILES: SessionProfile[] = [
  {
    id: 'prof-admin-multi',
    fullName: 'Henri Rochefort',
    email: 'admin@entreprise.com',
    roleLabel: 'Administrateur (Habilité tous espaces)',
    roles: ['ADMINISTRATEUR', 'RESPONSABLE', 'EMPLOYE'],
    departmentName: 'Direction Générale & Gouvernance',
  },
  {
    id: 'prof-admin-strict',
    fullName: 'Henri Rochefort',
    email: 'admin@entreprise.com',
    roleLabel: 'Administrateur strict (Admin uniquement)',
    roles: ['ADMINISTRATEUR'],
    departmentName: 'Direction Générale & Gouvernance',
  },
  {
    id: 'prof-resp-sophie',
    fullName: 'Sophie Dubois',
    email: 'sophie.dubois@entreprise.com',
    roleLabel: 'Responsable IT (Resp. + Employé)',
    roles: ['RESPONSABLE', 'EMPLOYE'],
    departmentName: 'Pôle Informatique et Infrastructure',
  },
  {
    id: 'prof-emp-paul',
    fullName: 'Paul Martin',
    email: 'paul.martin@entreprise.com',
    roleLabel: 'Employé uniquement',
    roles: ['EMPLOYE'],
    departmentName: 'Comptabilité et Finances',
  },
];

export default function App() {
  // Top-level workspace selector: defaults to 'ADMIN' (Espace Administrateur)
  const [activeWorkspace, setActiveWorkspace] = useState<'ADMIN' | 'RESPONSABLE' | 'LOGIN'>('ADMIN');
  const [sessionProfile, setSessionProfile] = useState<SessionProfile>(DEMO_PROFILES[0]);

  // Shared Enterprise Data State (Source de données commune)
  const [employees, setEmployees] = useState<EmployeeAccount[]>(INITIAL_EMPLOYEES);
  const [responsables, setResponsables] = useState<ResponsableAccount[]>(INITIAL_RESPONSABLES);
  const [departments, setDepartments] = useState<DepartmentRecord[]>(INITIAL_DEPARTMENTS);
  const [categories, setCategories] = useState<CategoryAttribution[]>(INITIAL_CATEGORIES);
  const [adminEvents, setAdminEvents] = useState<AdminActivityEvent[]>(INITIAL_ADMIN_EVENTS);
  const [adminSettings, setAdminSettings] = useState<AdminCompanySettings>(INITIAL_ADMIN_SETTINGS);
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);

  // Admin navigation & quick-action states
  const [adminView, setAdminView] = useState<AdminViewId>('dashboard');
  const [isAdminMobileOpen, setIsAdminMobileOpen] = useState(false);
  const [openAddEmpModal, setOpenAddEmpModal] = useState(false);
  const [openAddRespModal, setOpenAddRespModal] = useState(false);
  const [openCreateDeptModal, setOpenCreateDeptModal] = useState(false);
  const [adminTicketToReassign, setAdminTicketToReassign] = useState<Ticket | null>(null);

  // Espace Responsable State
  const [currentUser, setCurrentUser] = useState<ResponsibleUser>(CURRENT_MANAGER);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('ticket-ec-2024-0902');
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [mobileDetailViewOpen, setMobileDetailViewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState('all');

  // Modals
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [isTechnicianModalOpen, setIsTechnicianModalOpen] = useState(false);
  const [isAuditExportModalOpen, setIsAuditExportModalOpen] = useState(false);
  const [isEmployeePortalOpen, setIsEmployeePortalOpen] = useState(false);
  const [isAstreinteModalOpen, setIsAstreinteModalOpen] = useState(false);
  const [targetTicketForModal, setTargetTicketForModal] = useState<Ticket | null>(null);

  // Synchronize document.title with the active workspace
  useEffect(() => {
    if (activeWorkspace === 'ADMIN') {
      document.title = 'EmployeeCare — Espace Administrateur';
    } else if (activeWorkspace === 'RESPONSABLE') {
      document.title = 'EmployeeCare — Espace Responsable';
    } else {
      document.title = 'EmployeeCare — Connexion';
    }
  }, [activeWorkspace]);

  // Helper to log dated administrative activity
  const pushAdminEvent = (
    type: AdminActivityEvent['type'],
    title: string,
    description: string
  ) => {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} · ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newEv: AdminActivityEvent = {
      id: `ev-${Date.now()}`,
      date: dateStr,
      timestamp: now.toISOString(),
      type,
      title,
      description,
      actor: `${sessionProfile.fullName} (Admin)`,
    };
    setAdminEvents((prev) => [newEv, ...prev]);
  };

  // Admin Dashboard KPIs (Calculated from the single shared source of truth)
  const adminStats = useMemo(() => {
    return computeAdminDashboardStats(employees, responsables, tickets, categories);
  }, [employees, responsables, tickets, categories]);

  // Admin Handlers
  const handleAdminAddEmployee = (input: AddEmployeeInput) => {
    const res = addEmployeeAccount(employees, departments, input);
    if (!res.ok) return { ok: false, error: res.error };
    setEmployees(res.employees);
    pushAdminEvent(
      'EMPLOYEE_ADDED',
      'Nouvel employé ajouté',
      `Compte de ${res.employee.fullName} (${res.employee.departmentName}) créé en attente d'activation.`
    );
    return { ok: true };
  };

  const handleAdminUpdateEmployee = (updated: EmployeeAccount) => {
    const res = updateEmployeeAndSync(
      employees,
      responsables,
      departments,
      categories,
      tickets,
      updated
    );
    if (!res.ok) return { ok: false, error: res.error };

    setEmployees(res.employees);
    setResponsables(res.responsables);
    setDepartments(res.departments);
    setCategories(res.categories);
    setTickets(res.tickets);

    pushAdminEvent(
      'ACCOUNT_STATUS',
      'Fiche collaborateur modifiée',
      `Informations de ${updated.fullName} mises à jour et synchronisées (${updated.departmentName}).`
    );
    return { ok: true };
  };

  const handleAdminUpdateEmployeeStatus = (empId: string, newStatus: AccountStatus) => {
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return { ok: false, error: 'Collaborateur introuvable.' };

    // If deactivating an employee who is also an active Responsable, check if they have open tickets
    if (newStatus === 'DESACTIVE') {
      const linkedResp = responsables.find((r) => r.employeeId === empId && r.roleActive);
      if (linkedResp) {
        const openCount = countActiveTicketsForResponsable(tickets, linkedResp.fullName);
        if (openCount > 0) {
          return {
            ok: false,
            error: `${linkedResp.fullName} est également Responsable et possède actuellement ${openCount} signalement(s) ouvert(s). Veuillez réattribuer ses dossiers depuis la rubrique « Responsables » avant de désactiver son compte.`,
          };
        }
        setResponsables((prev) =>
          prev.map((r) =>
            r.id === linkedResp.id ? { ...r, status: 'DESACTIVE', roleActive: false } : r
          )
        );
      }
    } else if (newStatus === 'ACTIF') {
      setResponsables((prev) =>
        prev.map((r) => (r.employeeId === empId ? { ...r, status: 'ACTIF' } : r))
      );
    }

    setEmployees((prev) => updateEmployeeStatus(prev, empId, newStatus));
    pushAdminEvent(
      'ACCOUNT_STATUS',
      `Statut du compte mis à jour`,
      `Le compte de ${emp.fullName} est passé au statut ${newStatus}.`
    );
    return { ok: true };
  };

  const handleAdminPromoteEmployee = (input: PromoteEmployeeInput) => {
    const res = promoteEmployeeToResponsable(
      employees,
      responsables,
      departments,
      input,
      categories
    );
    if (!res.ok) return { ok: false, error: res.error };
    setEmployees(res.employees);
    setResponsables(res.responsables);
    if (res.categories) setCategories(res.categories);
    pushAdminEvent(
      'MANAGER_ADDED',
      'Employé promu Responsable',
      `${res.responsable.fullName} a été habilité sur ${res.responsable.departmentName}.`
    );
    return { ok: true };
  };

  const handleAdminCreateNewResponsable = (input: CreateNewResponsableInput) => {
    const res = createNewResponsableAccount(
      employees,
      responsables,
      departments,
      input,
      categories
    );
    if (!res.ok) return { ok: false, error: res.error };
    setEmployees(res.employees);
    setResponsables(res.responsables);
    if (res.categories) setCategories(res.categories);
    pushAdminEvent(
      'MANAGER_ADDED',
      'Nouveau compte Responsable créé',
      `${res.responsable.fullName} (${res.responsable.departmentName}) ajouté en attente d'activation.`
    );
    return { ok: true };
  };

  const handleAdminUpdateResponsableAttributions = (updated: ResponsableAccount) => {
    setResponsables((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    // Also sync employees department if changed
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === updated.employeeId
          ? {
              ...e,
              departmentId: updated.departmentId,
              departmentName: updated.departmentName,
            }
          : e
      )
    );
    pushAdminEvent(
      'ATTRIBUTION_UPDATED',
      'Attributions d’un responsable modifiées',
      `Périmètre de ${updated.fullName} mis à jour (${updated.assignedCategories.join(', ')}).`
    );
  };

  const handleAdminDeactivateOrRemoveResponsable = (
    targetId: string,
    replacementId: string | undefined,
    mode: 'DEACTIVATE_ACCESS' | 'REMOVE_ROLE_KEEP_EMPLOYEE'
  ) => {
    const targetResp = responsables.find((r) => r.id === targetId);
    const res = deactivateOrRemoveResponsable(
      employees,
      responsables,
      tickets,
      categories,
      targetId,
      replacementId,
      mode
    );
    if (!res.ok) return { ok: false, error: res.error };
    setEmployees(res.employees);
    setResponsables(res.responsables);
    setTickets(res.tickets);
    setCategories(res.categories);
    pushAdminEvent(
      'MANAGER_REMOVED',
      mode === 'REMOVE_ROLE_KEEP_EMPLOYEE'
        ? 'Retrait du rôle Responsable'
        : 'Désactivation du compte Responsable',
      `${mode === 'REMOVE_ROLE_KEEP_EMPLOYEE' ? 'Rôle retiré' : 'Compte désactivé'} pour ${targetResp?.fullName || ''}. ${res.reassignedCount} signalement(s) réattribué(s).`
    );
    return { ok: true, reassignedCount: res.reassignedCount };
  };

  const handleAdminReactivateResponsable = (targetId: string) => {
    const target = responsables.find((r) => r.id === targetId);
    setResponsables((prev) =>
      prev.map((r) =>
        r.id === targetId ? { ...r, roleActive: true, status: 'ACTIF' } : r
      )
    );
    if (target) {
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === target.employeeId
            ? {
                ...e,
                status: 'ACTIF',
                roles: e.roles.includes('RESPONSABLE') ? e.roles : [...e.roles, 'RESPONSABLE'],
                primaryRoleLabel: 'Responsable',
              }
            : e
        )
      );
      pushAdminEvent(
        'MANAGER_ADDED',
        'Rôle Responsable réactivé',
        `L'accès Responsable de ${target.fullName} a été rétabli.`
      );
    }
  };

  const handleAdminCreateDepartment = (newDept: Omit<DepartmentRecord, 'id' | 'createdAt'>) => {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const created: DepartmentRecord = {
      ...newDept,
      id: `dept-${Date.now()}`,
      createdAt: dateStr,
    };
    setDepartments((prev) => [...prev, created]);
    pushAdminEvent(
      'DEPARTMENT_CREATED',
      'Nouveau département créé',
      `Département « ${created.name} » (${created.code}) ajouté.`
    );
  };

  const handleAdminUpdateDepartment = (updated: DepartmentRecord) => {
    const synced = updateDepartmentAndSync(
      departments,
      employees,
      responsables,
      categories,
      tickets,
      updated
    );
    setDepartments(synced.departments);
    setEmployees(synced.employees);
    setResponsables(synced.responsables);
    setCategories(synced.categories);
    setTickets(synced.tickets);
    pushAdminEvent(
      'ATTRIBUTION_UPDATED',
      'Département mis à jour',
      `Configuration du département « ${updated.name} » modifiée et propagée.`
    );
  };

  const handleAdminCreateCategory = (newCat: Omit<CategoryAttribution, 'id'>) => {
    const created: CategoryAttribution = {
      ...newCat,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, created]);
    if (created.primaryManagerId) {
      setResponsables((prev) =>
        prev.map((r) =>
          r.id === created.primaryManagerId && !r.assignedCategories.includes(created.name)
            ? { ...r, assignedCategories: [...r.assignedCategories, created.name] }
            : r
        )
      );
    }
    pushAdminEvent(
      'ATTRIBUTION_UPDATED',
      'Nouvelle catégorie créée',
      `Catégorie « ${created.name} » rattachée à ${created.departmentName}.`
    );
  };

  const handleAdminUpdateCategory = (updated: CategoryAttribution) => {
    const synced = updateCategoryAndSync(categories, responsables, tickets, updated);
    setCategories(synced.categories);
    setResponsables(synced.responsables);
    setTickets(synced.tickets);
    pushAdminEvent(
      'ATTRIBUTION_UPDATED',
      'Attribution de catégorie modifiée',
      `Catégorie « ${updated.name} » attribuée à ${updated.primaryManagerName || 'aucun responsable'}.`
    );
  };

  const handleAdminReassignTicket = (
    ticket: Ticket,
    newResp: ResponsableAccount,
    newPriority?: TicketPriority
  ) => {
    const updated = reassignTicketByAdmin(ticket, newResp, newPriority);
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    pushAdminEvent(
      'TICKET_REASSIGNED',
      `Signalement ${ticket.reference} réattribué`,
      `Attribué à ${newResp.fullName} (${newResp.departmentName}).`
    );
  };

  // Switch between workspaces respecting role permissions
  const handleSwitchWorkspace = (workspace: 'ADMIN' | 'RESPONSABLE' | 'EMPLOYE' | 'LOGIN') => {
    if (workspace === 'EMPLOYE') {
      setIsEmployeePortalOpen(true);
      return;
    }
    if (workspace === 'ADMIN' && !sessionProfile.roles.includes('ADMINISTRATEUR')) {
      return;
    }
    if (workspace === 'RESPONSABLE' && !sessionProfile.roles.includes('RESPONSABLE')) {
      return;
    }
    setActiveWorkspace(workspace);
  };

  // Dev mode profile switcher
  const handleSelectDemoProfile = (profileId: string) => {
    const found = DEMO_PROFILES.find((p) => p.id === profileId);
    if (!found) return;
    setSessionProfile(found);

    if (found.roles.includes('ADMINISTRATEUR')) {
      setActiveWorkspace('ADMIN');
    } else if (found.roles.includes('RESPONSABLE')) {
      setActiveWorkspace('RESPONSABLE');
      const mgr = AVAILABLE_MANAGERS.find((m) => m.name === found.fullName);
      if (mgr) setCurrentUser(mgr);
    } else {
      setActiveWorkspace('RESPONSABLE');
      setIsEmployeePortalOpen(true);
    }
  };

  // Espace Responsable derived data & handlers
  const filteredTickets = useMemo(() => {
    return filterTickets(tickets, {
      search: searchQuery,
      filterTab: activeFilterTab,
      targetDepartment: currentUser.department,
    });
  }, [tickets, searchQuery, activeFilterTab, currentUser.department]);

  const metrics = useMemo(() => {
    return computeMetrics(tickets, currentUser.department);
  }, [tickets, currentUser.department]);

  useEffect(() => {
    if (filteredTickets.length > 0) {
      const isSelectedInList = filteredTickets.some((t) => t.id === selectedTicketId);
      if (!isSelectedInList) {
        setSelectedTicketId(filteredTickets[0].id);
      }
    }
  }, [filteredTickets, selectedTicketId]);

  const selectedTicket = useMemo(() => {
    const found = filteredTickets.find((t) => t.id === selectedTicketId);
    if (found) return found;
    return filteredTickets[0] || null;
  }, [filteredTickets, selectedTicketId]);

  const handleNavigate = (view: string) => {
    if (view === 'to_treat') {
      setCurrentView('dashboard');
      setActiveFilterTab('to_treat');
    } else if (view === 'in_progress') {
      setCurrentView('dashboard');
      setActiveFilterTab('in_progress');
    } else if (view === 'resolved') {
      setCurrentView('dashboard');
      setActiveFilterTab('resolved');
    } else {
      setCurrentView(view);
      if (view === 'dashboard') {
        setActiveFilterTab('all');
      }
    }
    setMobileDetailViewOpen(false);
  };

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicketId(ticket.id);
    setMobileDetailViewOpen(true);
  };

  const handleTakeCharge = (ticketToCharge: Ticket, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = takeChargeTicket(ticketToCharge, currentUser);
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTicketId(updated.id);
    setMobileDetailViewOpen(true);
  };

  const handleOpenResolutionModal = (ticket: Ticket) => {
    setTargetTicketForModal(ticket);
    setIsResolutionModalOpen(true);
  };

  const handleProposeResolutionSubmit = (
    ticket: Ticket,
    solution: string,
    actionsTaken: string,
    recommendations: string
  ) => {
    const updated = proposeResolution(ticket, solution, actionsTaken, recommendations, currentUser);
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleConfirmClosure = (ticket: Ticket) => {
    const updated = confirmClosure(ticket, ticket.requesterName);
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleReopen = (ticket: Ticket) => {
    const updated = reopenTicket(ticket, 'Le collaborateur indique la persistance du dysfonctionnement.');
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleOpenTechnicianModal = (ticket: Ticket) => {
    setTargetTicketForModal(ticket);
    setIsTechnicianModalOpen(true);
  };

  const handleScheduleTechnician = (
    ticket: Ticket,
    technician: string,
    dateSlot: string,
    note: string
  ) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const updated: Ticket = {
      ...ticket,
      status: 'DIAGNOSTIC_EN_COURS',
      assignedTo: `${technician.split('(')[0].trim()} (Sous supervision ${currentUser.name})`,
      timeline: [
        {
          id: `tl-tech-${Date.now()}`,
          time: timeStr,
          timestamp: now.toISOString(),
          title: `Intervention technicien planifiée : ${technician.split('(')[0].trim()}`,
          description: `Créneau : ${dateSlot}. Consignes : ${note}`,
          author: currentUser.name,
          type: 'take_charge',
          newStatus: 'DIAGNOSTIC_EN_COURS',
        },
        ...ticket.timeline,
      ],
      updatedAt: now.toISOString(),
    };
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleSendMessage = (ticket: Ticket, content: string, isInternalNote: boolean) => {
    const updated = addMessage(ticket, content, isInternalNote, currentUser);
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleAddTicket = (newTicket: Ticket) => {
    // Apply automatic routing from CategoryAttribution if configured
    const matchingCat = categories.find((c) => c.name === newTicket.category);
    const enrichedTicket: Ticket =
      matchingCat && adminSettings.autoAssignByCategory
        ? {
            ...newTicket,
            targetDepartment: matchingCat.departmentName || newTicket.targetDepartment,
            assignedTo: matchingCat.primaryManagerName || newTicket.assignedTo,
          }
        : newTicket;

    setTickets((prev) => [enrichedTicket, ...prev]);
    setSelectedTicketId(enrichedTicket.id);
    setMobileDetailViewOpen(true);
  };

  const handleSelectManager = (newManager: ResponsibleUser) => {
    setCurrentUser(newManager);
    setActiveFilterTab('all');
    setSearchQuery('');
  };

  // RENDER 1: PAGE DE CONNEXION (Sans aucune inscription publique)
  if (activeWorkspace === 'LOGIN') {
    return (
      <>
        <LoginView
          employees={employees}
          onLoginSuccess={(target, email) => {
            const norm = email.trim().toLowerCase();
            if (target === 'ADMIN') {
              setSessionProfile(DEMO_PROFILES[0]);
              setActiveWorkspace('ADMIN');
            } else if (target === 'RESPONSABLE') {
              const foundEmp = employees.find((e) => e.email.toLowerCase() === norm);
              setSessionProfile({
                id: foundEmp?.id || 'prof-resp',
                fullName: foundEmp?.fullName || 'Sophie Dubois',
                email: norm,
                roleLabel: 'Responsable (Resp. + Employé)',
                roles: ['RESPONSABLE', 'EMPLOYE'],
                departmentName: foundEmp?.departmentName,
              });
              setActiveWorkspace('RESPONSABLE');
            } else {
              const foundEmp = employees.find((e) => e.email.toLowerCase() === norm);
              setSessionProfile({
                id: foundEmp?.id || 'prof-emp',
                fullName: foundEmp?.fullName || 'Paul Martin',
                email: norm,
                roleLabel: 'Employé',
                roles: ['EMPLOYE'],
                departmentName: foundEmp?.departmentName,
              });
              setActiveWorkspace('RESPONSABLE');
              setIsEmployeePortalOpen(true);
            }
          }}
        />
        <EmployeePortalModal
          isOpen={isEmployeePortalOpen}
          onClose={() => setIsEmployeePortalOpen(false)}
          currentUser={currentUser}
        />
      </>
    );
  }

  // RENDER 2: ESPACE ADMINISTRATEUR
  if (activeWorkspace === 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#F7F5F0] text-[#202824] flex font-['DM_Sans']">
        <AdminSidebar
          currentView={adminView}
          onNavigate={setAdminView}
          stats={adminStats}
          sessionProfile={sessionProfile}
          onSwitchWorkspace={handleSwitchWorkspace}
          isMobileOpen={isAdminMobileOpen}
          onCloseMobile={() => setIsAdminMobileOpen(false)}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader
            currentView={adminView}
            companyName={adminSettings.companyName}
            sessionProfile={sessionProfile}
            availableDemoProfiles={DEMO_PROFILES}
            onSelectDemoProfile={handleSelectDemoProfile}
            onOpenMobileMenu={() => setIsAdminMobileOpen(true)}
            onSwitchWorkspace={handleSwitchWorkspace}
          />

          <main className="p-4 lg:p-8 flex-1 flex flex-col gap-6 max-w-[1600px] w-full mx-auto">
            {adminView === 'dashboard' && (
              <AdminDashboardView
                stats={adminStats}
                events={adminEvents}
                tickets={tickets}
                categories={categories}
                onNavigate={setAdminView}
                onQuickAddEmployee={() => {
                  setOpenAddEmpModal(true);
                  setAdminView('employees');
                }}
                onQuickAddResponsable={() => {
                  setOpenAddRespModal(true);
                  setAdminView('responsables');
                }}
                onQuickCreateDepartment={() => {
                  setOpenCreateDeptModal(true);
                  setAdminView('departments');
                }}
                onReassignTicket={(ticket) => {
                  setAdminTicketToReassign(ticket);
                  setAdminView('signalements');
                }}
              />
            )}

            {adminView === 'employees' && (
              <AdminEmployeesView
                employees={employees}
                departments={departments}
                onAddEmployee={handleAdminAddEmployee}
                onUpdateEmployee={handleAdminUpdateEmployee}
                onUpdateStatus={handleAdminUpdateEmployeeStatus}
                openAddModalInitially={openAddEmpModal}
                onConsumeInitialModal={() => setOpenAddEmpModal(false)}
              />
            )}

            {adminView === 'responsables' && (
              <AdminResponsablesView
                employees={employees}
                responsables={responsables}
                departments={departments}
                categories={categories}
                tickets={tickets}
                onPromoteEmployee={handleAdminPromoteEmployee}
                onCreateNewResponsable={handleAdminCreateNewResponsable}
                onUpdateResponsableAttributions={handleAdminUpdateResponsableAttributions}
                onDeactivateOrRemoveResponsable={handleAdminDeactivateOrRemoveResponsable}
                onReactivateResponsable={handleAdminReactivateResponsable}
                openAddModalInitially={openAddRespModal}
                onConsumeInitialModal={() => setOpenAddRespModal(false)}
              />
            )}

            {adminView === 'departments' && (
              <AdminDepartmentsView
                departments={departments}
                employees={employees}
                responsables={responsables}
                tickets={tickets}
                onCreateDepartment={handleAdminCreateDepartment}
                onUpdateDepartment={handleAdminUpdateDepartment}
                openCreateModalInitially={openCreateDeptModal}
                onConsumeInitialModal={() => setOpenCreateDeptModal(false)}
              />
            )}

            {adminView === 'categories' && (
              <AdminCategoriesView
                categories={categories}
                departments={departments}
                responsables={responsables}
                onCreateCategory={handleAdminCreateCategory}
                onUpdateCategory={handleAdminUpdateCategory}
              />
            )}

            {adminView === 'signalements' && (
              <AdminSignalementsView
                tickets={tickets}
                categories={categories}
                departments={departments}
                responsables={responsables}
                onReassignTicket={handleAdminReassignTicket}
                initialReassignTicket={adminTicketToReassign}
                onConsumeInitialReassign={() => setAdminTicketToReassign(null)}
              />
            )}

            {adminView === 'reports' && (
              <AdminReportsView
                tickets={tickets}
                categories={categories}
                departments={departments}
              />
            )}

            {adminView === 'settings' && (
              <AdminSettingsView
                settings={adminSettings}
                onUpdateSettings={(next) => {
                  setAdminSettings(next);
                  pushAdminEvent(
                    'ATTRIBUTION_UPDATED',
                    'Paramètres généraux mis à jour',
                    `Configuration de ${next.companyName} enregistrée.`
                  );
                }}
              />
            )}
          </main>
        </div>

        <EmployeePortalModal
          isOpen={isEmployeePortalOpen}
          onClose={() => setIsEmployeePortalOpen(false)}
          currentUser={currentUser}
        />
      </div>
    );
  }

  // RENDER 3: ESPACE RESPONSABLE (Conserve intégralement l'interface validée)
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#151D19] flex font-['DM_Sans']">
      {/* 1. Left Navigation Sidebar (8 Items) */}
      <ResponsibleSidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        metrics={metrics}
        onOpenEmployeeSpace={() => setIsEmployeePortalOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 2. Top Header with role-based navigation + Dev Mode switcher */}
        <ResponsibleHeader
          currentUser={currentUser}
          unreadCount={metrics.toTreat}
          sessionProfile={sessionProfile}
          availableDemoProfiles={DEMO_PROFILES}
          onSelectDemoProfile={handleSelectDemoProfile}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onSelectManager={handleSelectManager}
          onSwitchToAdmin={() => setActiveWorkspace('ADMIN')}
          onOpenEmployeeSpace={() => setIsEmployeePortalOpen(true)}
        />

        {/* 3. Main Workspace Container */}
        <main className="p-4 lg:p-8 flex-1 flex flex-col gap-5 lg:gap-6 max-w-[1600px] w-full mx-auto">
          {currentView === 'dashboard' && (
            <>
              <OperationalHeader
                onOpenAstreinte={() => setIsAstreinteModalOpen(true)}
                onOpenNewTicket={() => setIsNewTicketModalOpen(true)}
                departmentName={currentUser.department}
                departmentCode={currentUser.codeDepartment}
                managerName={currentUser.name.split(' ')[0]}
              />

              <DashboardMetrics
                metrics={metrics}
                activeFilterTab={activeFilterTab}
                onSelectFilter={(tab) => {
                  setActiveFilterTab(tab);
                  setMobileDetailViewOpen(false);
                }}
              />

              <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeFilterTab={activeFilterTab}
                onSelectFilterTab={(tab) => {
                  setActiveFilterTab(tab);
                  setMobileDetailViewOpen(false);
                }}
                tickets={tickets.filter((t) => t.targetDepartment === currentUser.department)}
              />

              {mobileDetailViewOpen && (
                <div className="lg:hidden">
                  <button
                    onClick={() => setMobileDetailViewOpen(false)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-white border border-[#E5E0D8] text-xs font-bold text-[#002529] shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    <span>Retour à la liste des signalements</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className={`lg:col-span-5 ${mobileDetailViewOpen ? 'hidden lg:block' : 'block'}`}>
                  <TicketList
                    tickets={filteredTickets}
                    selectedTicketId={selectedTicket?.id || ''}
                    onSelectTicket={handleSelectTicket}
                    onTakeCharge={handleTakeCharge}
                    currentUser={currentUser}
                    onViewAllArchive={() => handleNavigate('received')}
                  />
                </div>

                <div className={`lg:col-span-7 ${!mobileDetailViewOpen ? 'hidden lg:block' : 'block'}`}>
                  {selectedTicket ? (
                    <TicketDetailPanel
                      ticket={selectedTicket}
                      currentUser={currentUser}
                      onTakeCharge={handleTakeCharge}
                      onOpenResolutionModal={handleOpenResolutionModal}
                      onOpenTechnicianModal={handleOpenTechnicianModal}
                      onSendMessage={handleSendMessage}
                      onConfirmClosure={handleConfirmClosure}
                      onReopen={handleReopen}
                    />
                  ) : (
                    <div className="p-12 text-center bg-white border border-[#E5E0D8] rounded-lg">
                      <p className="text-sm font-semibold text-[#151D19]">
                        Aucun signalement ne correspond aux filtres sélectionnés.
                      </p>
                      <button
                        onClick={() => {
                          setActiveFilterTab('all');
                          setSearchQuery('');
                        }}
                        className="mt-3 px-3 py-1.5 rounded bg-[#173B3F] text-white text-xs font-semibold"
                      >
                        Réinitialiser les filtres
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {currentView === 'received' && (
            <TicketRegisterView
              tickets={tickets}
              currentUser={currentUser}
              onSelectTicket={(t) => {
                setSelectedTicketId(t.id);
                setCurrentView('dashboard');
                setMobileDetailViewOpen(true);
              }}
              onTakeCharge={handleTakeCharge}
              onBackToDashboard={() => setCurrentView('dashboard')}
            />
          )}

          {currentView === 'history' && (
            <InterventionHistoryView
              tickets={tickets}
              currentUser={currentUser}
              onBackToDashboard={() => setCurrentView('dashboard')}
              onSelectTicket={(t) => {
                setSelectedTicketId(t.id);
                setCurrentView('dashboard');
                setMobileDetailViewOpen(true);
              }}
            />
          )}

          {currentView === 'reports' && (
            <DepartmentReportsView
              tickets={tickets}
              currentUser={currentUser}
              onBackToDashboard={() => setCurrentView('dashboard')}
              onSelectTicket={(t) => {
                setSelectedTicketId(t.id);
                setCurrentView('dashboard');
                setMobileDetailViewOpen(true);
              }}
            />
          )}

          {currentView === 'settings' && (
            <ResponsibleSettingsView
              currentUser={currentUser}
              onBackToDashboard={() => setCurrentView('dashboard')}
            />
          )}

          <footer className="mt-4 p-4 rounded-lg bg-[#EDF6EF] border border-[#E5E0D8] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#DCE5DE] flex items-center justify-center text-[#002529]">
                <span className="material-symbols-outlined text-xl">policy</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#151D19]">
                  Journalisation & traçabilité des interventions de service
                </span>
                <span className="text-[11px] text-[#414849]">
                  Toutes les actions prises dans cet espace sont consignées pour assurer la continuité opérationnelle et le suivi CSE.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              <button
                type="button"
                onClick={() => setIsAuditExportModalOpen(true)}
                className="px-3 py-1.5 rounded bg-white hover:bg-[#F3FBF5] border border-[#E5E0D8] text-[#151D19] text-xs font-semibold transition-colors shadow-2xs"
              >
                Exporter le journal d'activité
              </button>
            </div>
          </footer>
        </main>
      </div>

      {/* MODALS */}
      <ResolutionModal
        isOpen={isResolutionModalOpen}
        ticket={targetTicketForModal || selectedTicket}
        onClose={() => setIsResolutionModalOpen(false)}
        onSubmit={handleProposeResolutionSubmit}
      />

      <NewTicketModal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        onAddTicket={handleAddTicket}
        currentUser={currentUser}
      />

      <TechnicianModal
        isOpen={isTechnicianModalOpen}
        ticket={targetTicketForModal || selectedTicket}
        onClose={() => setIsTechnicianModalOpen(false)}
        onSchedule={handleScheduleTechnician}
        currentUser={currentUser}
      />

      <AuditExportModal
        isOpen={isAuditExportModalOpen}
        onClose={() => setIsAuditExportModalOpen(false)}
        tickets={tickets.filter((t) => t.targetDepartment === currentUser.department)}
      />

      <EmployeePortalModal
        isOpen={isEmployeePortalOpen}
        onClose={() => setIsEmployeePortalOpen(false)}
        currentUser={currentUser}
      />

      <ViewsAstreinteModal
        isOpen={isAstreinteModalOpen}
        onClose={() => setIsAstreinteModalOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
