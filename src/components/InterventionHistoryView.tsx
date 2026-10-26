import React, { useState } from 'react';
import { Ticket, ResponsibleUser } from '../types/ticket';

interface InterventionHistoryViewProps {
  tickets: Ticket[];
  currentUser: ResponsibleUser;
  onBackToDashboard: () => void;
  onSelectTicket?: (ticket: Ticket) => void;
}

export const InterventionHistoryView: React.FC<InterventionHistoryViewProps> = ({
  tickets,
  currentUser,
  onBackToDashboard,
  onSelectTicket,
}) => {
  const [filterAction, setFilterAction] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Flatten events across tickets relevant to current department
  const allEvents = tickets
    .filter((t) => t.targetDepartment === currentUser.department)
    .flatMap((t) =>
      t.timeline.map((ev) => ({
        ...ev,
        ticket: t,
        ticketRef: t.reference,
        ticketTitle: t.title,
        ticketStatus: t.status,
      }))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredEvents = allEvents.filter((ev) => {
    if (filterAction !== 'ALL' && ev.type !== filterAction) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = ev.ticketRef.toLowerCase().includes(q);
      const matchTitle = ev.ticketTitle.toLowerCase().includes(q);
      const matchAuthor = ev.author.toLowerCase().includes(q);
      const matchDesc = ev.description.toLowerCase().includes(q);
      if (!matchRef && !matchTitle && !matchAuthor && !matchDesc) return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Horodatage', 'Reference', 'Titre', 'Type Action', 'Auteur', 'Statut', 'Details'];
    const rows = filteredEvents.map((ev) => [
      `"${ev.time} (${new Date(ev.timestamp).toLocaleDateString('fr-FR')})"`,
      `"${ev.ticketRef}"`,
      `"${ev.ticketTitle.replace(/"/g, '""')}"`,
      `"${ev.title.replace(/"/g, '""')}"`,
      `"${ev.author.replace(/"/g, '""')}"`,
      `"${ev.newStatus || ev.ticketStatus}"`,
      `"${ev.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `journal_interventions_${currentUser.codeDepartment.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('Journal exporté au format CSV avec succès.');
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="flex flex-col gap-6 font-['DM_Sans']">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-['JetBrains_Mono'] text-xs font-semibold text-[#146C48] uppercase tracking-wider">
            Traçabilité Opérationnelle
          </span>
          <h2 className="font-['DM_Serif_Display'] text-2xl text-[#002529] mt-1">
            Historique des interventions
          </h2>
          <p className="text-xs text-[#66736F] mt-1">
            Journal chronologique complet des prises en charge, consignes, changements d'état et résolutions pour {currentUser.department}.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#173B3F] text-white hover:bg-[#002529] text-xs font-semibold shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Exporter en CSV</span>
          </button>
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1 px-3 py-2 rounded bg-white border border-[#E5E0D8] text-xs font-semibold text-[#151D19] hover:bg-[#F3FBF5]"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Tableau de bord</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-[#A2F4C6]/30 border border-[#A2F4C6] rounded-lg text-xs font-semibold text-[#002112] flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-[#146C48]">check_circle</span>
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-[#E5E0D8] shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-base text-[#66736F]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par référence, intervenant ou mot-clé..."
            className="w-full pl-8 pr-3 py-2 bg-[#F7F5F0] border border-[#E5E0D8] rounded text-xs text-[#151D19] focus:outline-none focus:border-[#173B3F]"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'ALL', label: 'Tous les actes' },
            { id: 'take_charge', label: 'Prises en charge' },
            { id: 'resolution', label: 'Résolutions' },
            { id: 'message', label: 'Échanges' },
            { id: 'reopen', label: 'Réouvertures' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterAction(f.id)}
              className={`px-3 py-1.5 rounded font-semibold transition-all ${
                filterAction === f.id
                  ? 'bg-[#173B3F] text-white'
                  : 'bg-[#F7F5F0] border border-[#E5E0D8] text-[#414849] hover:bg-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit & Intervention Table */}
      <div className="bg-white border border-[#E5E0D8] rounded-lg shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#EDF6EF] text-[#414849] border-b border-[#E5E0D8] text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-4">Date & Heure</th>
                <th className="py-2.5 px-4">Dossier / Réf.</th>
                <th className="py-2.5 px-4">Action effectuée</th>
                <th className="py-2.5 px-4">Intervenant</th>
                <th className="py-2.5 px-4">Statut</th>
                <th className="py-2.5 px-4">Détails consignés</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8]">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#66736F]">
                    Aucune intervention ne correspond aux critères sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev, index) => (
                  <tr
                    key={ev.id || index}
                    onClick={() => onSelectTicket && onSelectTicket(ev.ticket)}
                    className="hover:bg-[#F7F5F0] transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-['JetBrains_Mono'] text-[#66736F] whitespace-nowrap">
                      <div>{ev.time}</div>
                      <div className="text-[10px] text-[#66736F]/80">
                        {new Date(ev.timestamp).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-['JetBrains_Mono'] font-bold text-[#002529]">
                        {ev.ticketRef}
                      </span>
                      <span className="block text-[11px] text-[#66736F] truncate max-w-xs">
                        {ev.ticketTitle}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-[#151D19] block">{ev.title}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-medium text-[#151D19]">{ev.author}</span>
                      {ev.authorRole && (
                        <span className="block text-[10px] text-[#66736F]">{ev.authorRole}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        (ev.newStatus || ev.ticketStatus) === 'RESOLU'
                          ? 'bg-[#A2F4C6] text-[#002112]'
                          : (ev.newStatus || ev.ticketStatus) === 'CLOTURE'
                          ? 'bg-[#E7F0E9] text-[#414849]'
                          : (ev.newStatus || ev.ticketStatus) === 'ROUVERT'
                          ? 'bg-[#FFDAD6] text-[#93000A]'
                          : 'bg-[#EDF6EF] text-[#002529]'
                      }`}>
                        {(ev.newStatus || ev.ticketStatus) === 'DIAGNOSTIC_EN_COURS'
                          ? 'EN COURS'
                          : (ev.newStatus || ev.ticketStatus) === 'EN_ATTENTE'
                          ? 'À TRAITER'
                          : (ev.newStatus || ev.ticketStatus)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] text-[#414849] leading-relaxed line-clamp-2">
                        {ev.description}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
