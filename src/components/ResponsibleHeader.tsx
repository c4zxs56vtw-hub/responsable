import React, { useState } from 'react';
import { ResponsibleUser } from '../types/ticket';

interface ResponsibleHeaderProps {
  currentUser: ResponsibleUser;
  unreadCount?: number;
  onOpenNotifications?: () => void;
  onOpenMobileMenu?: () => void;
}

export const ResponsibleHeader: React.FC<ResponsibleHeaderProps> = ({
  currentUser,
  unreadCount = 2,
  onOpenMobileMenu,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  return (
    <header className="h-16 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E5E0D8] px-4 lg:px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Left Compliance & Encryption Indicators */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu Button */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded text-[#173B3F] hover:bg-[#F3FBF5] transition-colors"
          aria-label="Ouvrir le menu de navigation"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        <span className="font-['JetBrains_Mono'] text-[11px] px-2.5 py-0.5 rounded bg-[#A2F4C6] text-[#002112] font-semibold tracking-wider">
          Canal Chiffré
        </span>
        <span className="text-xs text-[#66736F] font-medium hidden sm:inline">
          Collège Référent Indépendant
        </span>
      </div>

      {/* Right User & Security Status */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Protection Certifiée */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#EDF6EF] text-[#146C48] border border-[#146C48]/10">
          <span className="material-symbols-outlined text-sm">
            encrypted
          </span>
          <span className="font-['JetBrains_Mono'] text-[11px] font-semibold">
            Protection Certifiée
          </span>
        </div>

        {/* Notifications Icon with Badge */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-1.5 rounded hover:bg-[#F3FBF5] text-[#414849] relative transition-colors"
            title="Notifications du pôle"
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
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E5E0D8] rounded shadow-lg p-3 z-50 text-xs">
              <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-2 mb-2 font-semibold text-[#151D19]">
                <span>Alertes opérationnelles</span>
                <span className="font-mono text-[10px] text-[#B42332]">1 critique</span>
              </div>
              <div className="space-y-2">
                <div className="p-2 bg-[#FFDAD6]/40 rounded border border-[#FFDAD6] text-[#93000A]">
                  <p className="font-bold">#EC-2024-0902 SLA Critique (45m)</p>
                  <p className="text-[11px]">Panne switch étage 3 — Délais de prise en charge imminent.</p>
                </div>
                <div className="p-2 bg-[#F3FBF5] rounded border border-[#E5E0D8] text-[#151D19]">
                  <p className="font-bold">#EC-2024-0891 Message de Paul Martin</p>
                  <p className="text-[11px]">Prise RJ-04 : Disponibilité confirmée au bureau 204.</p>
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
            className="flex items-center gap-2 lg:gap-3 p-1 rounded hover:bg-[#F3FBF5] transition-colors text-left"
            aria-expanded={showProfileMenu}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-[#E5E0D8]"
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-['DM_Sans'] text-xs font-bold text-[#151D19] leading-tight">
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
            <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E5E0D8] rounded shadow-lg p-3 z-50 text-xs">
              <div className="border-b border-[#E5E0D8] pb-2 mb-2">
                <p className="font-bold text-[#151D19]">{currentUser.name}</p>
                <p className="text-[#66736F]">{currentUser.department}</p>
                <p className="font-mono text-[10px] text-[#146C48] mt-1">
                  ID: {currentUser.id}
                </p>
              </div>
              <div className="py-1">
                <span className="text-[#66736F] block text-[11px] mb-1">
                  Habilitation :
                </span>
                <span className="font-mono text-[10px] bg-[#EDF6EF] px-2 py-0.5 rounded text-[#146C48] font-semibold">
                  {currentUser.clearanceLevel}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
