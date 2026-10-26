import React, { useState } from 'react';
import { Ticket } from '../types/ticket';

interface AuditLogViewProps {
  tickets: Ticket[];
  onBackToDashboard: () => void;
  onOpenAuditExport: () => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  tickets,
  onBackToDashboard,
  onOpenAuditExport,
}) => {
  const [filterAction, setFilterAction] = useState('ALL');

  const allEvents = tickets.flatMap((t) =>
    t.timeline.map((ev) => ({
      ...ev,
      ticketRef: t.reference,
      ticketTitle: t.title,
      confidentiality: t.confidentiality,
    }))
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredEvents = allEvents.filter((ev) => {
    if (filterAction === 'ALL') return true;
    return ev.type === filterAction;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-['JetBrains_Mono'] text-xs font-semibold text-[#146C48] uppercase tracking-wider">
              Conformité CNIL / RGPD Art. 30
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#146C48]"></span>
            <span className="text-xs text-[#146C48] font-mono">Horodatage SHA-256 actif</span>
          </div>
          <h2 className="font-['DM_Serif_Display'] text-2xl text-[#002529] mt-1">
            Journal d'Audit Immuable & Traçabilité des Dossiers
          </h2>
          <p className="text-xs text-[#66736F] mt-1">
            Registre complet des prises en charge, consultations, attributions et résolutions du pôle.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenAuditExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#002529] text-white hover:bg-[#173B3F] text-xs font-semibold shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            <span>Exporter le registre (PDF scellé)</span>
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

      {/* Filter Chips */}
      <div className="flex items-center gap-2 text-xs">
        {[
          { id: 'ALL', label: 'Tous les actes' },
          { id: 'take_charge', label: 'Prises en charge' },
          { id: 'resolution', label: 'Résolutions' },
          { id: 'message', label: 'Messages & Notes' },
          { id: 'telemetry', label: 'Alertes Système' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterAction(f.id)}
            className={`px-3 py-1.5 rounded font-semibold transition-all ${
              filterAction === f.id
                ? 'bg-[#173B3F] text-white'
                : 'bg-white border border-[#E5E0D8] text-[#414849] hover:bg-[#F3FBF5]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Audit Table */}
      <div className="bg-white border border-[#E5E0D8] rounded-lg shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#EDF6EF] text-[#414849] border-b border-[#E5E0D8] font-['DM_Sans'] text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-4">Horodatage</th>
                <th className="py-2.5 px-4">Dossier / Réf.</th>
                <th className="py-2.5 px-4">Acte consigné</th>
                <th className="py-2.5 px-4">Auteur habilité</th>
                <th className="py-2.5 px-4">Empreinte SHA-256</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8]">
              {filteredEvents.map((ev, index) => (
                <tr key={index} className="hover:bg-[#F7F5F0] transition-colors">
                  <td className="py-3 px-4 font-['JetBrains_Mono'] text-[#66736F] whitespace-nowrap">
                    {ev.time}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-['JetBrains_Mono'] font-bold text-[#002529]">
                      {ev.ticketRef}
                    </span>
                    <span className="block text-[11px] text-[#66736F] truncate max-w-xs">
                      {ev.ticketTitle}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#151D19] block">{ev.title}</span>
                    <span className="text-[11px] text-[#414849] leading-snug">{ev.description}</span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-medium text-[#151D19]">{ev.author}</span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-['JetBrains_Mono'] text-[10px] px-1.5 py-0.5 rounded bg-[#EDF6EF] text-[#002529] border border-[#E5E0D8]">
                      {ev.hash || '#5C22-1030-IT'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
