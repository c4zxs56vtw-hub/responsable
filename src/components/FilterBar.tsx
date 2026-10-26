import React, { useEffect, useRef } from 'react';
import { Ticket } from '../types/ticket';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilterTab: string;
  onSelectFilterTab: (tab: string) => void;
  tickets: Ticket[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  activeFilterTab,
  onSelectFilterTab,
  tickets,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Command / or Ctrl / to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute counts dynamically from current ticket state
  const totalCount = tickets.length;
  const unassignedCount = tickets.filter(
    (t) => (!t.assignedTo || t.assignedTo.trim().length === 0) && t.status !== 'CLOTURE'
  ).length;
  const urgentCount = tickets.filter(
    (t) => (t.priority === 'CRITIQUE' || t.isCriticalSla || t.priority === 'ELEVEE') && t.status !== 'CLOTURE' && t.status !== 'RESOLU'
  ).length;
  const pendingCount = tickets.filter(
    (t) => t.status === 'EN_ATTENTE' || t.status === 'ATTENTE_VALIDATION'
  ).length;
  const resolvedCount = tickets.filter(
    (t) => t.status === 'RESOLU' || t.status === 'CLOTURE'
  ).length;

  return (
    <div className="bg-white p-2.5 rounded-lg border border-[#E5E0D8] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#66736F] text-lg pointer-events-none">
          search
        </span>
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filtrer par collaborateur, référence #EC, équipement..."
          className="w-full pl-9 pr-14 py-1.5 text-xs font-['DM_Sans'] text-[#151D19] bg-[#EDF6EF]/70 rounded border border-transparent focus:border-[#173B3F] focus:bg-white focus:outline-none transition-all placeholder:text-[#66736F]"
        />
        {searchQuery ? (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#66736F] hover:text-[#151D19] text-xs"
            title="Effacer la recherche"
          >
            ✕
          </button>
        ) : (
          <kbd className="hidden md:flex absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-[#E7F0E9] font-['JetBrains_Mono'] text-[10px] text-[#414849] border border-[#C1C8C9]/40">
            ⌘ /
          </kbd>
        )}
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none" role="tablist">
        {/* Tous */}
        <button
          type="button"
          role="tab"
          aria-selected={activeFilterTab === 'all'}
          onClick={() => onSelectFilterTab('all')}
          className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeFilterTab === 'all'
              ? 'bg-[#173B3F] text-white shadow-sm'
              : 'text-[#414849] hover:bg-[#F3FBF5] hover:text-[#151D19]'
          }`}
        >
          <span>Tous</span>
          <span
            className={`font-['JetBrains_Mono'] text-[10px] px-1 py-0.2 rounded ${
              activeFilterTab === 'all' ? 'bg-white/20 text-white' : 'bg-[#E7F0E9] text-[#414849]'
            }`}
          >
            {totalCount}
          </span>
        </button>

        {/* Non assignés */}
        <button
          type="button"
          role="tab"
          aria-selected={activeFilterTab === 'unassigned'}
          onClick={() => onSelectFilterTab('unassigned')}
          className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeFilterTab === 'unassigned'
              ? 'bg-[#173B3F] text-white shadow-sm'
              : 'text-[#414849] hover:bg-[#F3FBF5] hover:text-[#151D19]'
          }`}
        >
          <span>Non assignés</span>
          <span
            className={`font-['JetBrains_Mono'] text-[10px] px-1 py-0.2 rounded ${
              activeFilterTab === 'unassigned' ? 'bg-white/20 text-white' : 'bg-[#DCE5DE] text-[#151D19]'
            }`}
          >
            {unassignedCount}
          </span>
        </button>

        {/* Prioritaires / Urgents */}
        <button
          type="button"
          role="tab"
          aria-selected={activeFilterTab === 'urgent'}
          onClick={() => onSelectFilterTab('urgent')}
          className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeFilterTab === 'urgent'
              ? 'bg-[#BA1A1A] text-white shadow-sm'
              : 'text-[#BA1A1A] hover:bg-[#FFDAD6]/40'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#BA1A1A]"></span>
          <span>Prioritaires / Urgents</span>
          <span
            className={`font-['JetBrains_Mono'] text-[10px] px-1 py-0.2 rounded ${
              activeFilterTab === 'urgent'
                ? 'bg-white/20 text-white'
                : 'bg-[#FFDAD6] text-[#93000A] font-bold'
            }`}
          >
            {urgentCount}
          </span>
        </button>

        {/* En attente de retour */}
        <button
          type="button"
          role="tab"
          aria-selected={activeFilterTab === 'pending'}
          onClick={() => onSelectFilterTab('pending')}
          className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeFilterTab === 'pending'
              ? 'bg-[#173B3F] text-white shadow-sm'
              : 'text-[#414849] hover:bg-[#F3FBF5] hover:text-[#151D19]'
          }`}
        >
          <span>En attente de retour</span>
          <span
            className={`font-['JetBrains_Mono'] text-[10px] px-1 py-0.2 rounded ${
              activeFilterTab === 'pending' ? 'bg-white/20 text-white' : 'bg-[#E7F0E9] text-[#414849]'
            }`}
          >
            {pendingCount}
          </span>
        </button>

        {/* Résolus */}
        <button
          type="button"
          role="tab"
          aria-selected={activeFilterTab === 'resolved'}
          onClick={() => onSelectFilterTab('resolved')}
          className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeFilterTab === 'resolved'
              ? 'bg-[#146C48] text-white shadow-sm'
              : 'text-[#146C48] hover:bg-[#EDF6EF]'
          }`}
        >
          <span>Résolus</span>
          <span
            className={`font-['JetBrains_Mono'] text-[10px] px-1 py-0.2 rounded ${
              activeFilterTab === 'resolved' ? 'bg-white/20 text-white' : 'bg-[#A2F4C6] text-[#002112]'
            }`}
          >
            {resolvedCount}
          </span>
        </button>
      </div>
    </div>
  );
};
