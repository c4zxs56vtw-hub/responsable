import React, { useState } from 'react';
import { ResponsibleUser } from '../types/ticket';
import { SessionProfile } from '../types/admin';

interface ResponsibleHeaderProps {
  currentUser: ResponsibleUser;
  unreadCount?: number;
  sessionProfile?: SessionProfile;
  onOpenMobileMenu?: () => void;
  onSwitchToAdmin?: () => void;
  onOpenEmployeeSpace?: () => void;
  onLogout?: () => void;
}

export const ResponsibleHeader: React.FC<ResponsibleHeaderProps> = ({
  currentUser,
  unreadCount = 2,
  sessionProfile,
  onOpenMobileMenu,
  onSwitchToAdmin,
  onOpenEmployeeSpace,
  onLogout,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const canAccessAdmin = sessionProfile
    ? sessionProfile.roles.includes('ADMINISTRATEUR')
    : false;
  const canAccessEmploye = sessionProfile
    ? sessionProfile.roles.includes('EMPLOYE')
    : true;

  return (
    <header className="h-16 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E5E0D8] px-4 lg:px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Left Department Badge & Authorized Role Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded text-[#173B3F] hover:bg-[#F3FBF5] transition-colors"
          aria-label="Ouvrir le menu de navigation"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        <span className="font-['DM_Sans'] text-xs font-semibold px-2.5 py-1 rounded bg-[#EDF6EF] text-[#002529] border border-[#E5E0D8]">
          {currentUser.department}
        </span>
        <span className="text-xs text-[#66736F] font-medium hidden md:inline font-['DM_Sans']">
          Espace Responsable
        </span>

        {canAccessAdmin && onSwitchToAdmin && (
          <button
            type="button"
            onClick={onSwitchToAdmin}
            className="ml-1 px-2.5 py-1 rounded bg-[#173B3F] text-white text-xs font-semibold hover:bg-[#102B2E] transition-colors whitespace-nowrap"
          >
            ← Espace Administrateur
          </button>
        )}

        {canAccessEmploye && onOpenEmployeeSpace && (
          <button
            type="button"
            onClick={onOpenEmployeeSpace}
            className="hidden sm:inline-flex px-2.5 py-1 rounded bg-[#F7F5F0] text-[#202824] border border-[#E5E0D8] text-xs font-semibold hover:bg-[#E5E0D8] transition-colors whitespace-nowrap"
          >
            Accéder à mon espace Employé
          </button>
        )}
      </div>

      {/* Right User Notifications, Profile & Logout */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Notifications Icon with Badge */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-1.5 rounded hover:bg-[#F3FBF5] text-[#414849] relative transition-colors"
            title="Notifications du service"
            aria-label="Afficher les notifications"
          >
            <span className="material-symbols-outlined text-xl">
              notifications
            </span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#B42332] rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E5E0D8] rounded shadow-lg p-3 z-50 text-xs font-['DM_Sans']">
              <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-2 mb-2 font-semibold text-[#151D19]">
                <span>Alertes de service</span>
                <span className="text-[11px] text-[#B42332] font-bold">Priorité requise</span>
              </div>
              <div className="space-y-2">
                <div className="p-2 bg-[#FFDAD6]/40 rounded border border-[#FFDAD6] text-[#93000A]">
                  <p className="font-bold">Incident urgent en attente</p>
                  <p className="text-[11px]">Un nouveau signalement prioritaire attend votre prise en charge.</p>
                </div>
                <div className="p-2 bg-[#F3FBF5] rounded border border-[#E5E0D8] text-[#151D19]">
                  <p className="font-bold">Nouveau message reçu</p>
                  <p className="text-[11px]">Un collaborateur a répondu à votre demande de précision.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Hairline Separator */}
        <div className="h-6 w-px bg-[#E5E0D8]"></div>

        {/* Manager Identity Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 lg:gap-3 p-1 rounded hover:bg-[#F3FBF5] transition-colors text-left font-['DM_Sans']"
            aria-expanded={showProfileMenu}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-[#E5E0D8]"
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-[#151D19] leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[11px] text-[#66736F] leading-none">
                {currentUser.role}
              </span>
            </div>
            <span className="material-symbols-outlined text-xs text-[#66736F]">
              expand_more
            </span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-[#E5E0D8] rounded shadow-lg p-3 z-50 text-xs font-['DM_Sans']">
              <div className="border-b border-[#E5E0D8] pb-2 mb-2">
                <p className="font-bold text-[#151D19]">{currentUser.name}</p>
                <p className="text-[#66736F]">{currentUser.department}</p>
                <p className="text-[10px] text-[#146C48] font-medium mt-0.5">
                  {currentUser.clearanceLevel}
                </p>
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                {canAccessEmploye && onOpenEmployeeSpace && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenEmployeeSpace();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded hover:bg-[#F3FBF5] text-[#173B3F] font-semibold flex items-center justify-between"
                  >
                    <span>Accéder à mon espace Employé</span>
                    <span className="material-symbols-outlined text-sm">swap_horiz</span>
                  </button>
                )}

                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded hover:bg-[#FDECEC] text-[#B42332] font-semibold flex items-center justify-between"
                  >
                    <span>Se déconnecter</span>
                    <span className="material-symbols-outlined text-sm">logout</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="px-3 py-1.5 text-xs font-semibold text-[#202824] bg-[#F7F5F0] hover:bg-[#E5E0D8] border border-[#E5E0D8] rounded transition-colors whitespace-nowrap shrink-0 font-['DM_Sans']"
          >
            Se déconnecter
          </button>
        )}
      </div>
    </header>
  );
};
