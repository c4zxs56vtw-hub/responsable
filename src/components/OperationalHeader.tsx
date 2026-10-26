import React from 'react';

interface OperationalHeaderProps {
  onOpenAstreinte: () => void;
  onOpenNewTicket: () => void;
  departmentName?: string;
  departmentCode?: string;
  managerName?: string;
}

export const OperationalHeader: React.FC<OperationalHeaderProps> = ({
  onOpenAstreinte,
  onOpenNewTicket,
  departmentName = 'Pôle Informatique & Infrastructure',
  departmentCode = 'REF-IT-DIR-402',
  managerName = 'Sophie',
}) => {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          {/* Unit Scope Metadata */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-['JetBrains_Mono'] text-[11px] px-2 py-0.5 rounded bg-[#E7F0E9] text-[#414849] uppercase tracking-wider font-medium">
              Unité Opérationnelle
            </span>
            <span className="text-[#414849] font-['JetBrains_Mono'] text-[11px] font-semibold">
              {departmentCode}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#146C48] animate-pulse"></span>
            <span className="text-xs text-[#146C48] font-medium font-['DM_Sans']">
              Signalements de votre service
            </span>
            <span className="text-xs text-[#66736F] hidden sm:inline">•</span>
            <span className="text-xs font-semibold text-[#173B3F] font-['DM_Sans'] hidden sm:inline">
              {departmentName}
            </span>
          </div>

          {/* Main Editorial Headline with DM Serif Display */}
          <h1 className="font-['DM_Serif_Display'] text-3xl lg:text-4xl text-[#002529] tracking-tight leading-tight">
            Bonjour {managerName},
          </h1>

          {/* Editorial Subtitle */}
          <p className="font-['DM_Sans'] text-sm text-[#414849] max-w-3xl leading-relaxed">
            Voici les signalements de votre service. Identifiez les priorités et suivez les interventions en cours.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto shrink-0">
          <button
            onClick={onOpenAstreinte}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-white border border-[#E5E0D8] text-[#151D19] hover:bg-[#F3FBF5] text-xs font-semibold shadow-sm transition-all font-['DM_Sans']"
          >
            <span className="material-symbols-outlined text-base text-[#414849]">
              tune
            </span>
            <span>Vues d'astreinte</span>
          </button>

          <button
            onClick={onOpenNewTicket}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#173B3F] text-white hover:bg-[#002529] text-xs font-semibold shadow-sm transition-all font-['DM_Sans']"
          >
            <span className="material-symbols-outlined text-base">
              add_moderator
            </span>
            <span>Nouveau Ticket Manuel</span>
          </button>
        </div>
      </div>
    </section>
  );
};
