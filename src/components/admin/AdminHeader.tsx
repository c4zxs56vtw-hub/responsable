import React from 'react';
import { AdminViewId } from './AdminSidebar';
import { SessionProfile } from '../../types/admin';

interface AdminHeaderProps {
  currentView: AdminViewId;
  companyName: string;
  sessionProfile: SessionProfile;
  availableDemoProfiles: SessionProfile[];
  onSelectDemoProfile: (profileId: string) => void;
  onOpenMobileMenu: () => void;
  onSwitchWorkspace: (workspace: 'ADMIN' | 'RESPONSABLE' | 'EMPLOYE' | 'LOGIN') => void;
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
  companyName,
  sessionProfile,
  availableDemoProfiles,
  onSelectDemoProfile,
  onOpenMobileMenu,
  onSwitchWorkspace,
}) => {
  const canAccessAdmin = sessionProfile.roles.includes('ADMINISTRATEUR');
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
          <span aria-hidden="true" className="hidden 2xl:inline shrink-0">/</span>
          <span className="font-semibold text-[#202824] truncate hidden 2xl:inline">
            {VIEW_LABELS[currentView]}
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation stricte selon les rôles de l'utilisateur connecté */}
      <nav
        className="hidden md:flex items-center gap-4 text-[13px] font-medium text-[#66736F] shrink-0"
        aria-label="Espaces autorisés selon le rôle"
      >
        {canAccessAdmin && (
          <button
            type="button"
            onClick={() => onSwitchWorkspace('ADMIN')}
            className="text-[#173B3F] font-bold underline underline-offset-4 whitespace-nowrap shrink-0"
          >
            Espace Administrateur
          </button>
        )}
        {canAccessResponsable && (
          <button
            type="button"
            onClick={() => onSwitchWorkspace('RESPONSABLE')}
            className="hover:text-[#173B3F] transition-colors whitespace-nowrap shrink-0"
          >
            Espace Responsable
          </button>
        )}
        {canAccessEmploye && (
          <button
            type="button"
            onClick={() => onSwitchWorkspace('EMPLOYE')}
            className="hover:text-[#173B3F] transition-colors whitespace-nowrap shrink-0"
          >
            Mon Espace Employé
          </button>
        )}
      </nav>

      {/* Zone 3: Sélecteur de profils réservé au Mode Développement + Déconnexion */}
      <div className="flex items-center gap-2 shrink-0">
        <div
          className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded bg-[#F7F5F0] border border-[#E5E0D8] text-xs"
          title="Sélecteur de profil réservé uniquement au mode développement / démonstration (les autorisations réelles sont vérifiées côté serveur Spring Boot)"
        >
          <span className="font-['JetBrains_Mono'] text-[10px] uppercase font-bold text-[#A86412] px-1 py-0.5 bg-[#FFF8EB] rounded border border-[#A86412]/30 shrink-0">
            Mode Démo
          </span>
          <select
            aria-label="Sélecteur de profil (Mode développement)"
            value={sessionProfile.id}
            onChange={(e) => onSelectDemoProfile(e.target.value)}
            className="bg-transparent text-xs font-semibold text-[#202824] focus:outline-none cursor-pointer max-w-[140px] truncate"
          >
            {availableDemoProfiles.map((prof) => (
              <option key={prof.id} value={prof.id}>
                {prof.fullName} — {prof.roleLabel}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => onSwitchWorkspace('LOGIN')}
          className="px-3.5 py-1.5 text-xs font-semibold text-[#202824] bg-[#F7F5F0] hover:bg-[#E5E0D8] border border-[#E5E0D8] rounded transition-colors whitespace-nowrap shrink-0"
        >
          Se déconnecter
        </button>
      </div>
    </header>
  );
};
