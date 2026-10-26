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

  // Compute counts dynamically
  const totalCount = tickets.length;
  const toTreatCount = tickets.filter(
    (t) => t.status === 'EN_ATTENTE' || t.status === 'ROUVERT'
  ).length;
  const inProgressCount = tickets.filter(
    (t) => t.status === 'DIAGNOSTIC_EN_COURS' || t.status === 'ATTENTE_VALIDATION'
  ).length;
  const resolvedCount = tickets.filter(
    (t) => t.status === 'RESOLU' || t.status === 'CLOTURE'
  ).length;
  const urgentCount = tickets.filter(
    (t) => (t.priority === 'CRITIQUE' || t.priority === 'ELEVEE') && t.status !== 'CLOTURE'
  ).length;

  return (
    <div className="bg-white p-2.5 rounded-lg border border-[#E5E0D8] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1 font-['DM_Sans']">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#66736F] text-lg pointer-events-none">
          search
        </span>
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher par référence #EC, titre, catégorie, collaborateur..."
          className="w-full pl-9 pr-14 py-1.5 text-xs text-[#151D19] bg-[#EDF6EF]/70 rounded border border-transparent focus:border-[#173B3F] focus:bg-white focus:outline-none transition-all placeholder:text-[#66736F]"
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
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none font-['DM_Sans']" role="tablist">
        {/* Tous */}
        <button
          type="button"
          role="tab"
          aria-selected={activeFilterTab === 'all'}
          onClick={() => onSelectFilterTab('all')}
          className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeFilterTab === 'all'
              ? 'bg-[#173B3F] text-white shadow-xs'
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

        {/* À traiter */}
        <button
          type="button"
          role="tab"
          aria-selected={activeFilterTab === 'to_treat'}
          onClick={() => onSelectFilterTab('to_treat')}
          className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeFilterTab === 'to_treat'
              ? 'bg-[#BA1A1A] text-white shadow-xs'
              : 'text-[#BA1A1A] hover:bg-[#FFDAD6]/40'
          }`}
        >
          <span>À traiter</span>
          <span
            className={`font-['JetBrains_Mono'] text-[10px] px-1 py-0.2 rounded font-bold ${
              activeFilterTab === 'to_treat' ? 'bg-white/20 text-white' : 'bg-[#FFDAD6] text-[#93000A]'
            }`}
          >
            {toTreatCount}
          </span>
        </button>

        {/* En cours */}
        <button
          type="button"
          role="tab"
          aria-selected={activeFilterTab === 'in_progress'}
          onClick={() => onSelectFilterTab('in_progress')}
          className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            activeFilterTab === 'in_progress'
              ? 'bg-[#173B3F] text-white shadow-xs'
              : 'text-[#414849] hover:bg-[#F3FBF5] hover:text-[#151D19]'
          }`}
        >
          <span>En cours</span>
          <span
            className={`font-['JetBrains_Mono'] text-[10px] px-1 py-0.2 rounded ${
              activeFilterTab === 'in_progress' ? 'bg-white/20 text-white' : 'bg-[#E7F0E9] text-[#414849]'
            }`}
          >
            {inProgressCount}
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
              ? 'bg-[#146C48] text-white shadow-xs'
              : 'text-[#146C48] hover:bg-[#EDF6EF]'
          }`}
        >
          <span>Résolus</span>
          <span
            className={`font-['JetBrains_Mono'] text-[10px] px-1 py-0.2 rounded font-bold ${
              activeFilterTab === 'resolved' ? 'bg-white/20 text-white' : 'bg-[#A2F4C6] text-[#002112]'
            }`}
          >
            {resolvedCount}
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
              ? 'bg-[#002529] text-white shadow-xs'
              : 'text-[#414849] hover:bg-[#F3FBF5]'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#BA1A1A]"></span>
          <span>Urgents</span>
          <span
            className={`font-['JetBrains_Mono'] text-[10px] px-1 py-0.2 rounded ${
              activeFilterTab === 'urgent' ? 'bg-white/20 text-white' : 'bg-[#E7F0E9] text-[#414849]'
            }`}
          >
            {urgentCount}
          </span>
        </button>
      </div>
    </div>
  );
};
