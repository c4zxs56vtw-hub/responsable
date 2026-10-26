import React, { useState } from 'react';
import { ResponsibleUser } from '../types/ticket';
import { AVAILABLE_MANAGERS } from '../data/mock-tickets';
import { SessionProfile } from '../types/admin';

interface ResponsibleHeaderProps {
  currentUser: ResponsibleUser;
  unreadCount?: number;
  sessionProfile?: SessionProfile;
  availableDemoProfiles?: SessionProfile[];
  onSelectDemoProfile?: (profileId: string) => void;
  onOpenMobileMenu?: () => void;
  onSelectManager?: (manager: ResponsibleUser) => void;
  onSwitchToAdmin?: () => void;
  onOpenEmployeeSpace?: () => void;
}

export const ResponsibleHeader: React.FC<ResponsibleHeaderProps> = ({
  currentUser,
  unreadCount = 2,
  sessionProfile,
  availableDemoProfiles = [],
  onSelectDemoProfile,
  onOpenMobileMenu,
  onSelectManager,
  onSwitchToAdmin,
  onOpenEmployeeSpace,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const canAccessAdmin = sessionProfile
    ? sessionProfile.roles.includes('ADMINISTRATEUR')
    : true;
  const canAccessEmploye = sessionProfile
    ? sessionProfile.roles.includes('EMPLOYE')
    : true;

  return (
    <header className="h-16 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E5E0D8] px-4 lg:px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Left Department Badge & Authorized Navigation */}
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
            Mon Espace Employé
          </button>
        )}
      </div>

      {/* Right User, Demo Selector & Notifications */}
      <div className="flex items-center gap-3 lg:gap-4">
        {availableDemoProfiles.length > 0 && onSelectDemoProfile && sessionProfile && (
          <div
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F7F5F0] border border-[#E5E0D8] text-xs font-['DM_Sans']"
            title="Sélecteur de profil réservé au mode développement"
          >
            <span className="font-['JetBrains_Mono'] text-[10px] uppercase font-bold text-[#A86412] px-1 py-0.5 bg-[#FFF8EB] rounded border border-[#A86412]/30">
              Mode Démo
            </span>
            <select
              aria-label="Sélecteur de profil (Mode développement)"
              value={sessionProfile.id}
              onChange={(e) => onSelectDemoProfile(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#202824] focus:outline-none cursor-pointer"
            >
              {availableDemoProfiles.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.fullName} ({prof.roleLabel})
                </option>
              ))}
            </select>
          </div>
        )}

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

        {/* Manager Identity Profile & Switcher */}
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

              {/* Department Switcher */}
              <div className="py-1">
                <span className="text-[#66736F] block text-[11px] font-semibold mb-1.5">
                  Changer de responsable (Démo multi-services) :
                </span>
                <div className="flex flex-col gap-1">
                  {AVAILABLE_MANAGERS.map((mgr) => (
                    <button
                      key={mgr.id}
                      onClick={() => {
                        if (onSelectManager) onSelectManager(mgr);
                        setShowProfileMenu(false);
                      }}
                      className={`w-full text-left p-1.5 rounded text-xs flex items-center justify-between ${
                        currentUser.id === mgr.id
                          ? 'bg-[#173B3F] text-white font-semibold'
                          : 'hover:bg-[#F3FBF5] text-[#151D19]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img src={mgr.avatar} alt={mgr.name} className="w-5 h-5 rounded-full object-cover" />
                        <span className="truncate">{mgr.name}</span>
                      </div>
                      <span className="text-[10px] opacity-80 shrink-0 ml-1">
                        {mgr.department.includes('Info') ? 'IT' : mgr.department.includes('RH') ? 'RH' : 'Maint.'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
