import React from 'react';
import { AdminViewId } from './AdminSidebar';
import { SessionProfile } from '../../types/admin';

interface AdminHeaderProps {
  currentView: AdminViewId;
  companyName: string;
  sessionProfile: SessionProfile;
  onOpenMobileMenu: () => void;
  onSwitchWorkspace: (workspace: 'ADMIN' | 'RESPONSABLE' | 'EMPLOYE' | 'LOGIN') => void;
  onLogout: () => void;
}

const VIEW_LABELS: Record<AdminViewId, string> = {
  dashboard: 'Tableau de bord',
  employees: 'Gestion des employés',
  responsables: 'Gestion des responsables',
  departments: 'Gestion des départements',
  categories: 'Catégories et attributions',
  signalements: 'Suivi des signalements',
  reports: 'Rapports et statistiques',
  settings: 'Paramètres de la plateforme',
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentView,
  sessionProfile,
  onOpenMobileMenu,
  onSwitchWorkspace,
  onLogout,
}) => {
  const canAccessResponsable = sessionProfile.roles.includes('RESPONSABLE');
  const canAccessEmploye = sessionProfile.roles.includes('EMPLOYE');

  return (
    <header className="h-16 bg-[#FFFFFF] border-b border-[#E5E0D8] px-4 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-20 font-['DM_Sans']">
      {/* Zone 1: Mobile button + Brand context */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded text-[#173B3F] hover:bg-[#F7F5F0] transition-colors"
          aria-label="Ouvrir le menu d'administration"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        <div className="flex items-center gap-2 text-[13px] text-[#66736F]">
          <span className="font-semibold text-[#173B3F] whitespace-nowrap">
            EmployeeCare — Espace Administrateur
          </span>
          <span aria-hidden="true" className="hidden md:inline shrink-0">
            /
          </span>
          <span className="font-semibold text-[#202824] truncate hidden md:inline">
            {VIEW_LABELS[currentView]}
          </span>
        </div>
      </div>

      {/* Zone 2: Profil connecté, accès multi-rôles éventuels & Déconnexion */}
      <div className="flex items-center gap-3 shrink-0">
        {canAccessResponsable && (
          <button
            type="button"
            onClick={() => onSwitchWorkspace('RESPONSABLE')}
            className="hidden md:inline-flex px-3 py-1.5 rounded bg-[#F7F5F0] hover:bg-[#E5E0D8] border border-[#E5E0D8] text-xs font-semibold text-[#173B3F] transition-colors whitespace-nowrap"
          >
            Espace Responsable
          </button>
        )}

        {canAccessEmploye && (
          <button
            type="button"
            onClick={() => onSwitchWorkspace('EMPLOYE')}
            className="hidden md:inline-flex px-3 py-1.5 rounded bg-[#F7F5F0] hover:bg-[#E5E0D8] border border-[#E5E0D8] text-xs font-semibold text-[#202824] transition-colors whitespace-nowrap"
          >
            Mon espace Employé
          </button>
        )}

        <div className="hidden sm:flex items-center gap-2 text-xs text-[#66736F] pr-1">
          <span className="w-2 h-2 rounded-full bg-[#287A55]" />
          <span className="font-semibold text-[#202824]">{sessionProfile.fullName}</span>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="px-3.5 py-1.5 text-xs font-semibold text-[#202824] bg-[#F7F5F0] hover:bg-[#E5E0D8] border border-[#E5E0D8] rounded transition-colors whitespace-nowrap shrink-0"
        >
          Se déconnecter
        </button>
      </div>
    </header>
  );
};
