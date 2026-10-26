import React from 'react';
import { AdminDashboardStats, SessionProfile } from '../../types/admin';

export type AdminViewId =
  | 'dashboard'
  | 'employees'
  | 'responsables'
  | 'departments'
  | 'categories'
  | 'signalements'
  | 'reports'
  | 'settings';

interface AdminSidebarProps {
  currentView: AdminViewId;
  onNavigate: (view: AdminViewId) => void;
  stats: AdminDashboardStats;
  sessionProfile: SessionProfile;
  onSwitchWorkspace: (workspace: 'ADMIN' | 'RESPONSABLE' | 'EMPLOYE' | 'LOGIN') => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentView,
  onNavigate,
  stats,
  sessionProfile,
  onSwitchWorkspace,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const menuItems: {
    id: AdminViewId;
    label: string;
    icon: string;
    badge?: number;
    badgeTitle?: string;
    badgeAlert?: boolean;
  }[] = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: 'space_dashboard',
    },
    {
      id: 'employees',
      label: 'Employés',
      icon: 'badge',
      badge: stats.totalEmployees,
      badgeTitle: `${stats.totalEmployees} collaborateurs (${stats.activeEmployees} actifs, ${stats.pendingEmployees} en attente, ${stats.deactivatedEmployees} désactivé)`,
    },
    {
      id: 'responsables',
      label: 'Responsables',
      icon: 'supervisor_account',
      badge: stats.activeResponsables,
      badgeTitle: `${stats.activeResponsables} responsables actifs`,
    },
    {
      id: 'departments',
      label: 'Départements',
      icon: 'domain',
    },
    {
      id: 'categories',
      label: 'Catégories et attributions',
      icon: 'category',
      badge: stats.unassignedCategoriesCount > 0 ? stats.unassignedCategoriesCount : undefined,
      badgeTitle:
        stats.unassignedCategoriesCount > 0
          ? `${stats.unassignedCategoriesCount} catégorie(s) sans responsable principal`
          : undefined,
      badgeAlert: stats.unassignedCategoriesCount > 0,
    },
    {
      id: 'signalements',
      label: 'Signalements',
      icon: 'assignment_late',
      badge: stats.totalTickets,
      badgeTitle: `${stats.totalTickets} signalements au total (${stats.unassignedTicketsCount} non attribués)`,
      badgeAlert: stats.unassignedTicketsCount > 0,
    },
    {
      id: 'reports',
      label: 'Rapports et statistiques',
      icon: 'monitoring',
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: 'tune',
    },
  ];

  const canAccessResponsable = sessionProfile.roles.includes('RESPONSABLE');

  const content = (
    <div className="flex flex-col justify-between py-6 h-full bg-[#FFFFFF] text-[#202824]">
      <div className="flex flex-col gap-5">
        {/* En-tête : EmployeeCare / ESPACE ADMINISTRATEUR */}
        <div className="px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#173B3F] text-white flex items-center justify-center font-['DM_Serif_Display'] text-lg font-normal shadow-2xs">
              EC
            </div>
            <div className="flex flex-col">
              <span className="font-['DM_Sans'] text-lg font-bold text-[#173B3F] tracking-tight leading-none">
                EmployeeCare
              </span>
              <span className="font-['DM_Sans'] text-[11px] font-bold uppercase tracking-wider text-[#66736F] mt-1">
                Espace Administrateur
              </span>
            </div>
          </div>

          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded text-[#66736F] hover:text-[#202824]"
              aria-label="Fermer le menu"
            >
              ✕
            </button>
          )}
        </div>

        {/* Cadre Gouvernance */}
        <div className="px-5">
          <div className="px-3.5 py-2.5 rounded border border-[#E5E0D8] bg-[#F7F5F0]">
            <span className="text-[10px] uppercase font-['DM_Sans'] text-[#66736F] font-semibold tracking-wider block">
              Périmètre de gestion
            </span>
            <span className="text-xs font-bold text-[#173B3F] block truncate mt-0.5">
              Direction Générale & Gouvernance
            </span>
            <span className="text-[11px] text-[#66736F] font-['JetBrains_Mono'] block">
              ADM-CENTRAL-01
            </span>
          </div>
        </div>

        {/* 8 Rubriques exactes */}
        <div className="px-3">
          <div className="px-3 py-1 mb-1">
            <span className="font-['DM_Sans'] text-[11px] text-[#66736F] uppercase tracking-wider font-bold">
              Menu Administrateur
            </span>
          </div>
          <nav className="flex flex-col gap-0.5" aria-label="Navigation Espace Administrateur">
            {menuItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onNavigate(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  title={item.badgeTitle || item.label}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-left transition-colors text-[13px] font-medium font-['DM_Sans'] ${
                    isActive
                      ? 'bg-[#173B3F] text-white font-semibold'
                      : 'text-[#202824] hover:bg-[#F7F5F0] hover:text-[#173B3F]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      aria-hidden="true"
                      className="material-symbols-outlined text-base shrink-0"
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`font-['JetBrains_Mono'] tabular-nums text-xs px-1.5 py-0.5 rounded font-semibold shrink-0 ml-1 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badgeAlert
                          ? 'bg-[#FDECEC] text-[#B42332]'
                          : 'bg-[#F7F5F0] text-[#66736F]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Pied du menu : Profil administrateur + Déconnexion & Bascule selon les droits */}
      <div className="px-4 flex flex-col gap-2.5 border-t border-[#E5E0D8] pt-4">
        <div className="p-2.5 rounded bg-[#F7F5F0] border border-[#E5E0D8] flex items-center justify-between">
          <div className="flex flex-col text-xs min-w-0">
            <span className="font-bold text-[#202824] truncate">
              {sessionProfile.fullName}
            </span>
            <span className="text-[11px] text-[#66736F] truncate">
              {sessionProfile.roleLabel}
            </span>
          </div>
          <span className="font-['JetBrains_Mono'] text-[10px] text-[#173B3F] font-semibold px-1.5 py-0.5 bg-white rounded border border-[#E5E0D8]">
            ADMIN
          </span>
        </div>

        <div className={canAccessResponsable ? 'grid grid-cols-2 gap-1.5' : 'grid grid-cols-1'}>
          {canAccessResponsable && (
            <button
              type="button"
              onClick={() => {
                onSwitchWorkspace('RESPONSABLE');
                if (onCloseMobile) onCloseMobile();
              }}
              className="flex items-center justify-center gap-1 px-2.5 py-2 rounded bg-[#F7F5F0] hover:bg-[#E5E0D8]/60 text-[#173B3F] font-semibold text-xs transition-colors border border-[#E5E0D8] whitespace-nowrap"
              title="Basculer vers l'espace Responsable (habilité)"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-sm">
                swap_horiz
              </span>
              <span>Espace Resp.</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onSwitchWorkspace('LOGIN');
              if (onCloseMobile) onCloseMobile();
            }}
            className="flex items-center justify-center gap-1 px-2.5 py-2 rounded bg-white hover:bg-[#FDECEC] text-[#B42332] font-semibold text-xs transition-colors border border-[#E5E0D8] whitespace-nowrap"
            title="Se déconnecter et afficher l'écran de connexion"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-sm">
              logout
            </span>
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex w-64 bg-[#FFFFFF] border-r border-[#E5E0D8] z-30 flex-col justify-between shrink-0 h-screen sticky top-0">
        {content}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative w-64 max-w-[82vw] bg-[#FFFFFF] h-full shadow-xl z-10 flex flex-col">
            {content}
          </aside>
        </div>
      )}
    </>
  );
};
