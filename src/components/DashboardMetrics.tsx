import React from 'react';
import { OperationalMetrics } from '../types/ticket';

interface DashboardMetricsProps {
  metrics: OperationalMetrics;
  activeFilterTab: string;
  onSelectFilter: (tab: string) => void;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  metrics,
  activeFilterTab,
  onSelectFilter,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. Signalements reçus */}
      <button
        type="button"
        onClick={() => onSelectFilter('all')}
        className={`p-4 rounded-lg bg-white border text-left flex flex-col justify-between transition-all shadow-xs hover:border-[#173B3F] cursor-pointer ${
          activeFilterTab === 'all'
            ? 'border-[#173B3F] ring-1 ring-[#173B3F] bg-[#F7F5F0]/30'
            : 'border-[#E5E0D8]'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-[#66736F] font-medium font-['DM_Sans']">Signalements reçus</span>
          <span className="material-symbols-outlined text-base text-[#173B3F]">
            inbox
          </span>
        </div>
        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className="font-['DM_Serif_Display'] text-3xl text-[#002529] font-normal leading-none">
            {metrics.totalReceived}
          </span>
          <span className="text-xs text-[#66736F] font-['DM_Sans']">
            au total
          </span>
        </div>
        <span className="text-[11px] text-[#66736F] mt-1 font-['DM_Sans']">
          Tous les signalements du service
        </span>
      </button>

      {/* 2. À traiter */}
      <button
        type="button"
        onClick={() => onSelectFilter('to_treat')}
        className={`p-4 rounded-lg bg-white border text-left flex flex-col justify-between transition-all shadow-xs hover:border-[#BA1A1A] cursor-pointer ${
          activeFilterTab === 'to_treat'
            ? 'border-[#BA1A1A] ring-1 ring-[#BA1A1A] bg-[#FFDAD6]/20'
            : 'border-[#E5E0D8]'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-[#93000A] font-bold font-['DM_Sans']">À traiter</span>
          <span className="material-symbols-outlined text-base text-[#BA1A1A]">
            pending_actions
          </span>
        </div>
        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className="font-['DM_Serif_Display'] text-3xl text-[#BA1A1A] font-bold leading-none">
            {metrics.toTreat}
          </span>
          <span className="text-xs text-[#93000A] font-['DM_Sans'] font-medium">
            en attente ou rouverts
          </span>
        </div>
        <span className="text-[11px] text-[#BA1A1A] font-medium mt-1 font-['DM_Sans']">
          Nécessitent une intervention
        </span>
      </button>

      {/* 3. En cours */}
      <button
        type="button"
        onClick={() => onSelectFilter('in_progress')}
        className={`p-4 rounded-lg bg-white border text-left flex flex-col justify-between transition-all shadow-xs hover:border-[#173B3F] cursor-pointer ${
          activeFilterTab === 'in_progress'
            ? 'border-[#173B3F] ring-1 ring-[#173B3F] bg-[#EDF6EF]/40'
            : 'border-[#E5E0D8]'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-[#173B3F] font-bold font-['DM_Sans']">En cours</span>
          <span className="material-symbols-outlined text-base text-[#173B3F]">
            timelapse
          </span>
        </div>
        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className="font-['DM_Serif_Display'] text-3xl text-[#002529] font-normal leading-none">
            {metrics.inProgress}
          </span>
          <span className="text-xs text-[#66736F] font-['DM_Sans']">
            en traitement
          </span>
        </div>
        <span className="text-[11px] text-[#146C48] font-medium mt-1 font-['DM_Sans']">
          Interventions actives
        </span>
      </button>

      {/* 4. Résolus */}
      <button
        type="button"
        onClick={() => onSelectFilter('resolved')}
        className={`p-4 rounded-lg bg-white border text-left flex flex-col justify-between transition-all shadow-xs hover:border-[#146C48] cursor-pointer ${
          activeFilterTab === 'resolved'
            ? 'border-[#146C48] ring-1 ring-[#146C48] bg-[#A2F4C6]/15'
            : 'border-[#E5E0D8]'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-[#146C48] font-bold font-['DM_Sans']">Résolus</span>
          <span className="material-symbols-outlined text-base text-[#146C48]">
            check_circle
          </span>
        </div>
        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className="font-['DM_Serif_Display'] text-3xl text-[#146C48] font-bold leading-none">
            {metrics.resolved}
          </span>
          <span className="text-xs text-[#146C48] font-['DM_Sans'] font-medium">
            solutions apportées
          </span>
        </div>
        <span className="text-[11px] text-[#66736F] mt-1 font-['DM_Sans']">
          Résolus ou confirmés
        </span>
      </button>
    </div>
  );
};
