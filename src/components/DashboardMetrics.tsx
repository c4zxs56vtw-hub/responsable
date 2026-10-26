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
      {/* Metric 1: Dossiers actifs */}
      <button
        type="button"
        onClick={() => onSelectFilter('all')}
        className={`p-3.5 rounded-lg bg-white border text-left flex flex-col justify-between transition-all shadow-sm hover:border-[#173B3F] ${
          activeFilterTab === 'all' ? 'border-[#173B3F] ring-1 ring-[#173B3F]' : 'border-[#E5E0D8]'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-[#66736F] font-medium">Dossiers actifs</span>
          <span className="material-symbols-outlined text-base text-[#173B3F]">
            dns
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-['DM_Serif_Display'] text-2xl text-[#002529] font-normal leading-none">
            {metrics.activeTickets}
          </span>
          <span className="font-['JetBrains_Mono'] text-[11px] text-[#66736F]">
            flux IT
          </span>
        </div>
        <span className="text-xs text-[#146C48] font-medium mt-1">
          Capacité pôle sous contrôle ({metrics.capacityRate}%)
        </span>
      </button>

      {/* Metric 2: Alerte SLA critique */}
      <button
        type="button"
        onClick={() => onSelectFilter('urgent')}
        className={`p-3.5 rounded-lg bg-[#FFDAD6]/40 border text-left flex flex-col justify-between relative overflow-hidden transition-all shadow-sm hover:border-[#BA1A1A] ${
          activeFilterTab === 'urgent' ? 'border-[#BA1A1A] ring-1 ring-[#BA1A1A]' : 'border-[#FFDAD6]'
        }`}
      >
        <div className="absolute -right-3 -top-3 w-12 h-12 bg-[#BA1A1A]/10 rounded-full blur-md pointer-events-none"></div>
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-[#93000A] font-bold">Alerte SLA critique</span>
          <span className="material-symbols-outlined text-base text-[#BA1A1A]">
            priority_high
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-['DM_Serif_Display'] text-2xl text-[#BA1A1A] font-bold leading-none">
            {metrics.criticalSlaCount}
          </span>
          <span className="font-['JetBrains_Mono'] text-[11px] text-[#93000A] font-medium">
            dépassement imminent
          </span>
        </div>
        <span className="text-xs text-[#BA1A1A] font-medium mt-1 truncate w-full" title={metrics.criticalSlaItem || 'Switch central (Étage 3)'}>
          {metrics.criticalSlaItem || 'Switch central (Étage 3)'}
        </span>
      </button>

      {/* Metric 3: Temps moyen de résolution */}
      <button
        type="button"
        onClick={() => onSelectFilter('resolved')}
        className={`p-3.5 rounded-lg bg-white border text-left flex flex-col justify-between transition-all shadow-sm hover:border-[#173B3F] ${
          activeFilterTab === 'resolved' ? 'border-[#173B3F] ring-1 ring-[#173B3F]' : 'border-[#E5E0D8]'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-[#66736F] font-medium">Temps moyen de résolution</span>
          <span className="material-symbols-outlined text-base text-[#66736F]">
            timelapse
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-['DM_Serif_Display'] text-2xl text-[#002529] font-normal leading-none">
            {metrics.averageResolutionHours}
          </span>
          <span className="font-['JetBrains_Mono'] text-[11px] text-[#66736F]">
            heures
          </span>
        </div>
        <span className="text-xs text-[#146C48] font-medium mt-1">
          {metrics.resolutionComparisonQuarter}
        </span>
      </button>

      {/* Metric 4: Satisfaction collaborateurs */}
      <div className="p-3.5 rounded-lg bg-white border border-[#E5E0D8] text-left flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-[#66736F] font-medium">Satisfaction collaborateurs</span>
          <span className="material-symbols-outlined text-base text-[#146C48]">
            verified_user
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-['DM_Serif_Display'] text-2xl text-[#002529] font-normal leading-none">
            {metrics.satisfactionRate}%
          </span>
          <span className="font-['JetBrains_Mono'] text-[11px] text-[#146C48] font-semibold">
            ISO-27001
          </span>
        </div>
        <span className="text-xs text-[#66736F] mt-1">
          Sur {metrics.satisfactionReviewsCount} retours post-clôture
        </span>
      </div>
    </div>
  );
};
