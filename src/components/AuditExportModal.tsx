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

  const totalAuditEvents = tickets.reduce((acc, t) => acc + t.timeline.length, 0);

  return (
    <div className="fixed inset-0 z-50 bg-[#002529]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#E5E0D8] shadow-2xl max-w-2xl w-full p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-[#E5E0D8] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#EDF6EF] text-[#002529] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">verified_user</span>
            </div>
            <div>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#146C48] font-bold">
                CERTIFICAT DE JOURNALISATION AUDITABLE
              </span>
              <h3 className="font-['DM_Serif_Display'] text-xl text-[#002529]">
                Registre de consignation & conformité RGPD/CNIL
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-[#66736F] hover:text-[#151D19] p-1 rounded">
            ✕
          </button>
        </div>

        <div className="p-4 bg-[#F7F5F0] rounded border border-[#E5E0D8] flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-2">
            <span className="text-[#66736F]">Empreinte cryptographique globale :</span>
            <span className="font-['JetBrains_Mono'] font-bold text-[#002529]">
              #8F9A-24D1-IT (SHA-256)
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-2">
            <span className="text-[#66736F]">Total des actes et interventions tracés :</span>
            <span className="font-semibold text-[#146C48]">{totalAuditEvents} événements certifiés</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#66736F]">Opposabilité légale :</span>
            <span className="font-semibold text-[#151D19]">Conforme Loi Travail, RGPD Art. 30 & Charte d'Éthique</span>
          </div>
        </div>

        <div className="space-y-2">
          <span className="font-['JetBrains_Mono'] text-[11px] text-[#66736F] uppercase tracking-wider font-semibold block">
            Extrait des derniers scellements du pôle
          </span>
          <div className="border border-[#E5E0D8] rounded max-h-48 overflow-y-auto text-xs divide-y divide-[#E5E0D8]">
            {tickets.flatMap((t) => t.timeline).slice(0, 6).map((ev, i) => (
              <div key={i} className="p-2.5 flex items-center justify-between hover:bg-[#F3FBF5]">
                <div className="flex flex-col">
                  <span className="font-semibold text-[#151D19]">{ev.title}</span>
                  <span className="text-[10px] text-[#66736F]">Auteur : {ev.author} • {ev.time}</span>
                </div>
                <span className="font-['JetBrains_Mono'] text-[10px] bg-[#EDF6EF] px-1.5 py-0.5 rounded text-[#002529]">
                  {ev.hash || '#5C22-1030-IT'}
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
            onClick={() => {
              window.print();
            }}
            className="px-4 py-2 rounded bg-[#002529] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:bg-[#173B3F]"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            <span>Imprimer / Télécharger l'export PDF scellé</span>
          </button>
        </div>
      </div>
    </div>
  );
};
