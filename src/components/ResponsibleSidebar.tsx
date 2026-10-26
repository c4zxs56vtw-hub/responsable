import React from 'react';
import { ResponsibleUser } from '../types/ticket';

interface ResponsibleSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: ResponsibleUser;
  onOpenEmployeeSpace: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const ResponsibleSidebar: React.FC<ResponsibleSidebarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onOpenEmployeeSpace,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const menuItems = [
    {
      id: 'vue-responsable',
      label: 'Tableau de Bord',
      icon: 'dashboard',
      description: 'Supervision et triage actif',
    },
    {
      id: 'registre-des-signalements',
      label: 'Registre & Triage',
      icon: 'shield_person',
      description: 'Tous les signalements du pôle',
    },
    {
      id: 'analyse-climat-social',
      label: 'Climat Social & Alertes',
      icon: 'insights',
      description: 'Indicateurs de tension et SLA',
    },
    {
      id: 'registre-audit-conformite',
      label: "Journal d'Audit & RGPD",
      icon: 'history_edu',
      description: 'Traçabilité immuable scellée',
    },
  ];

  const content = (
    <div className="flex flex-col justify-between py-6 h-full">
      <div className="flex flex-col gap-6">
        {/* Brand Header */}
        <div className="px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#173B3F] text-white flex items-center justify-center font-serif text-lg font-bold shadow-sm">
              EC
            </div>
            <div className="flex flex-col">
              <span className="font-['DM_Sans'] text-lg font-bold text-[#002529] tracking-tight leading-none">
                EmployeeCare
              </span>
              <span className="font-['JetBrains_Mono'] text-[11px] font-medium text-[#146C48] uppercase tracking-wider mt-0.5">
                Console Médiation
              </span>
            </div>
          </div>

          {/* Close button on mobile drawer */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded text-[#66736F] hover:text-[#151D19]"
              aria-label="Fermer le menu"
            >
              ✕
            </button>
          )}
        </div>

        {/* Pôle Badge */}
        <div className="px-6">
          <div className="px-3 py-2 rounded border border-[#E5E0D8] bg-[#F7F5F0]">
            <span className="text-[10px] font-mono uppercase text-[#66736F] tracking-wider block">
              Service assigné
            </span>
            <span className="text-xs font-semibold text-[#173B3F] block truncate">
              {currentUser.department}
            </span>
            <span className="text-[10px] text-[#66736F] font-mono">
              {currentUser.codeDepartment}
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="px-4">
          <div className="px-3 py-1 mb-2">
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#66736F] uppercase tracking-wider font-semibold">
              Supervision & Dossiers
            </span>
          </div>
          <nav className="flex flex-col gap-1" aria-label="Navigation Espace Responsable">
            {menuItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-colors text-sm font-medium ${
                    isActive
                      ? 'bg-[#173B3F] text-white font-semibold shadow-sm'
                      : 'text-[#414849] hover:bg-[#F3FBF5] hover:text-[#151D19]'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / Bottom Actions */}
      <div className="px-5 flex flex-col gap-3">
        {/* Security Clearance Card */}
        <div className="p-3 rounded bg-[#EDF6EF] border border-[#C1C8C9]/30 flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[#146C48] text-xl">
            security
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#151D19] leading-tight">
              Session Sécurisée
            </span>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#414849]">
              {currentUser.clearanceLevel}
            </span>
          </div>
        </div>

        {/* Switch to Employee Portal Button */}
        <button
          onClick={() => {
            onOpenEmployeeSpace();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded bg-[#E7F0E9] hover:bg-[#DCE5DE] text-[#002529] font-medium text-xs transition-colors border border-[#C1C8C9]/50 shadow-sm"
          title="Consulter vos déclarations personnelles ou déclarer un incident"
        >
          <span className="material-symbols-outlined text-base">
            swap_horiz
          </span>
          <span>Accéder à mon espace Employé</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-72 bg-[#FFFFFF] border-r border-[#E5E0D8] z-30 flex-col justify-between shrink-0 h-screen sticky top-0">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative w-72 max-w-[80vw] bg-[#FFFFFF] h-full shadow-2xl z-10 flex flex-col">
            {content}
          </aside>
        </div>
      )}
    </>
  );
};
