import React from 'react';
import { Ticket } from '../types/ticket';

interface AuditExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: Ticket[];
}

export const AuditExportModal: React.FC<AuditExportModalProps> = ({
  isOpen,
  onClose,
  tickets,
}) => {
  if (!isOpen) return null;

  const totalEvents = tickets.reduce((acc, t) => acc + t.timeline.length, 0);

  const handleExportCSV = () => {
    const headers = ['Date', 'Ticket', 'Intitule', 'Action', 'Auteur', 'Description'];
    const rows = tickets.flatMap((t) =>
      t.timeline.map((ev) => [
        `"${ev.time} (${new Date(ev.timestamp).toLocaleDateString('fr-FR')})"`,
        `"${t.reference}"`,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${ev.title.replace(/"/g, '""')}"`,
        `"${ev.author.replace(/"/g, '""')}"`,
        `"${ev.description.replace(/"/g, '""')}"`,
      ])
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `journal_activite_service_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#002529]/60 backdrop-blur-xs flex items-center justify-center p-4 font-['DM_Sans']">
      <div className="bg-white rounded-lg border border-[#E5E0D8] shadow-2xl max-w-2xl w-full p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-[#E5E0D8] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#EDF6EF] text-[#002529] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-[#173B3F]">history_edu</span>
            </div>
            <div>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#146C48] font-bold">
                RAPPORT D'ACTIVITÉ & TRAÇABILITÉ
              </span>
              <h3 className="font-['DM_Serif_Display'] text-xl text-[#002529]">
                Synthèse des interventions du service
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-[#66736F] hover:text-[#151D19] p-1 rounded">
            ✕
          </button>
        </div>

        <div className="p-4 bg-[#F7F5F0] rounded border border-[#E5E0D8] flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-2">
            <span className="text-[#66736F]">Périmètre :</span>
            <span className="font-semibold text-[#002529]">
              Tous les signalements et actes enregistrés
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-2">
            <span className="text-[#66736F]">Total des interventions journalisées :</span>
            <span className="font-semibold text-[#146C48]">{totalEvents} actes tracés</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#66736F]">Finalité :</span>
            <span className="font-semibold text-[#151D19]">Revue de performance, bilan de service et CSE</span>
          </div>
        </div>

        <div className="space-y-2">
          <span className="font-['JetBrains_Mono'] text-[11px] text-[#66736F] uppercase tracking-wider font-semibold block">
            Dernières actions enregistrées
          </span>
          <div className="border border-[#E5E0D8] rounded max-h-48 overflow-y-auto text-xs divide-y divide-[#E5E0D8]">
            {tickets.flatMap((t) => t.timeline).slice(0, 6).map((ev, i) => (
              <div key={i} className="p-2.5 flex items-center justify-between hover:bg-[#F3FBF5]">
                <div className="flex flex-col">
                  <span className="font-semibold text-[#151D19]">{ev.title}</span>
                  <span className="text-[10px] text-[#66736F]">Auteur : {ev.author} • {ev.time}</span>
                </div>
                <span className="text-[10px] text-[#146C48] font-medium">
                  Enregistré
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E0D8]">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded border border-[#E5E0D8] text-[#151D19] text-xs font-semibold hover:bg-[#F3FBF5]"
          >
            Fermer
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded bg-[#173B3F] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:bg-[#002529]"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Télécharger le journal (CSV)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
