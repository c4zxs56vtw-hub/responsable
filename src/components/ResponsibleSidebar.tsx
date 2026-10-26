import React from 'react';
import { ResponsibleUser, OperationalMetrics } from '../types/ticket';

interface ResponsibleSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: ResponsibleUser;
  metrics: OperationalMetrics;
  onOpenEmployeeSpace: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const ResponsibleSidebar: React.FC<ResponsibleSidebarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  metrics,
  onOpenEmployeeSpace,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: 'dashboard',
      count: undefined,
    },
    {
      id: 'received',
      label: 'Signalements reçus',
      icon: 'inbox',
      count: metrics.totalReceived,
    },
    {
      id: 'to_treat',
      label: 'À traiter',
      icon: 'pending_actions',
      count: metrics.toTreat,
      badgeColor: 'bg-[#FFDAD6] text-[#93000A]',
    },
    {
      id: 'in_progress',
      label: 'En cours',
      icon: 'timelapse',
      count: metrics.inProgress,
      badgeColor: 'bg-[#EDF6EF] text-[#002529]',
    },
    {
      id: 'resolved',
      label: 'Résolus',
      icon: 'check_circle',
      count: metrics.resolved,
      badgeColor: 'bg-[#A2F4C6] text-[#002112]',
    },
    {
      id: 'history',
      label: 'Historique',
      icon: 'history',
      count: undefined,
    },
    {
      id: 'reports',
      label: 'Rapports et statistiques',
      icon: 'query_stats',
      count: undefined,
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: 'settings',
      count: undefined,
    },
  ];

  const content = (
    <div className="flex flex-col justify-between py-6 h-full">
      <div className="flex flex-col gap-5">
        {/* Brand Header with Espace Responsable */}
        <div className="px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#173B3F] text-white flex items-center justify-center font-serif text-lg font-bold shadow-sm">
              EC
            </div>
            <div className="flex flex-col">
              <span className="font-['DM_Sans'] text-lg font-bold text-[#002529] tracking-tight leading-none">
                EmployeeCare
              </span>
              <span className="font-['DM_Sans'] text-xs font-semibold text-[#146C48] mt-0.5">
                Espace Responsable
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

        {/* Dynamic Department Scope Box */}
        <div className="px-5">
          <div className="px-3.5 py-2.5 rounded border border-[#E5E0D8] bg-[#F7F5F0]">
            <span className="text-[10px] uppercase font-['DM_Sans'] text-[#66736F] font-semibold tracking-wider block">
              Service assigné
            </span>
            <span className="text-xs font-bold text-[#173B3F] block truncate mt-0.5">
              {currentUser.department}
            </span>
            <span className="text-[11px] text-[#66736F] font-mono block">
              {currentUser.codeDepartment}
            </span>
          </div>
        </div>

        {/* 8 Menu Items */}
        <div className="px-3">
          <div className="px-3 py-1 mb-1">
            <span className="font-['DM_Sans'] text-[11px] text-[#66736F] uppercase tracking-wider font-bold">
              Menu Responsable
            </span>
          </div>
          <nav className="flex flex-col gap-0.5" aria-label="Navigation Espace Responsable">
            {menuItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-left transition-colors text-xs font-medium font-['DM_Sans'] ${
                    isActive
                      ? 'bg-[#173B3F] text-white font-semibold shadow-xs'
                      : 'text-[#414849] hover:bg-[#F3FBF5] hover:text-[#151D19]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="material-symbols-outlined text-base shrink-0">
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span
                      className={`font-['JetBrains_Mono'] text-[10px] px-1.5 py-0.2 rounded font-semibold shrink-0 ml-1 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badgeColor || 'bg-[#E7F0E9] text-[#414849]'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / Switch to Employee Portal Button */}
      <div className="px-4 flex flex-col gap-3">
        <div className="p-2.5 rounded bg-[#EDF6EF] border border-[#E5E0D8] flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#146C48]"></div>
          <div className="flex flex-col text-[11px]">
            <span className="font-bold text-[#151D19] leading-tight">
              {currentUser.name}
            </span>
            <span className="text-[#66736F]">
              {currentUser.role}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            onOpenEmployeeSpace();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded bg-[#E7F0E9] hover:bg-[#DCE5DE] text-[#002529] font-medium text-xs transition-colors border border-[#C1C8C9]/50 shadow-xs font-['DM_Sans']"
          title="Accéder à votre espace personnel pour signaler un problème"
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
      <aside className="hidden lg:flex w-64 bg-[#FFFFFF] border-r border-[#E5E0D8] z-30 flex-col justify-between shrink-0 h-screen sticky top-0">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative w-64 max-w-[80vw] bg-[#FFFFFF] h-full shadow-2xl z-10 flex flex-col">
            {content}
          </aside>
        </div>
      )}
    </>
  );
};
