import React, { useState } from 'react';
import { Ticket } from '../types/ticket';

interface ResolutionModalProps {
  isOpen: boolean;
  ticket: Ticket | null;
  onClose: () => void;
  onSubmit: (ticket: Ticket, solution: string, actionsTaken: string, recommendations: string) => void;
}

export const ResolutionModal: React.FC<ResolutionModalProps> = ({
  isOpen,
  ticket,
  onClose,
  onSubmit,
}) => {
  const [solution, setSolution] = useState(
    'Remplacement de l’embase murale RJ45 bureau 204 et re-sertissage du panneau B2.'
  );
  const [actionsTaken, setActionsTaken] = useState(
    'Mesure au réflectomètre Fluke effectuée (0% perte), négociation 1 Gbps rétablie, test de charge SAP validé avec l’utilisateur.'
  );
  const [recommendations, setRecommendations] = useState(
    'Prévoir une inspection semestrielle des jarretières de l’étage B.'
  );

  if (!isOpen || !ticket) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!solution.trim() || !actionsTaken.trim()) return;
    onSubmit(ticket, solution.trim(), actionsTaken.trim(), recommendations.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#002529]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#E5E0D8] shadow-xl max-w-xl w-full p-6 flex flex-col gap-4">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#E5E0D8] pb-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#146C48] bg-[#A2F4C6] px-2 py-0.5 rounded">
                Étape 5 — Résolution
              </span>
              <span className="font-['JetBrains_Mono'] text-xs text-[#66736F]">
                {ticket.reference}
              </span>
            </div>
            <h3 className="font-['DM_Serif_Display'] text-xl text-[#002529] mt-1">
              Proposer une résolution opérationnelle
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#66736F] hover:text-[#151D19] p-1 rounded"
          >
            ✕
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
          <div>
            <label className="block font-semibold text-[#151D19] mb-1">
              Solution apportée au dysfonctionnement *
            </label>
            <input
              type="text"
              required
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              className="w-full p-2.5 rounded border border-[#E5E0D8] focus:border-[#173B3F] focus:outline-none"
              placeholder="Ex : Réparation du connecteur réseau, changement du switch..."
            />
          </div>

          <div>
            <label className="block font-semibold text-[#151D19] mb-1">
              Actions techniques réalisées *
            </label>
            <textarea
              required
              rows={3}
              value={actionsTaken}
              onChange={(e) => setActionsTaken(e.target.value)}
              className="w-full p-2.5 rounded border border-[#E5E0D8] focus:border-[#173B3F] focus:outline-none resize-none"
              placeholder="Détaillez les manipulations techniques effectuées sur site ou à distance..."
            />
          </div>

          <div>
            <label className="block font-semibold text-[#151D19] mb-1">
              Recommandations préventives pour l'employé (Optionnel)
            </label>
            <input
              type="text"
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              className="w-full p-2.5 rounded border border-[#E5E0D8] focus:border-[#173B3F] focus:outline-none"
              placeholder="Conseils pour éviter la récurrence..."
            />
          </div>

          {/* Compliance note */}
          <div className="p-3 bg-[#EDF6EF] rounded border border-[#E5E0D8] text-[11px] text-[#414849]">
            Une notification de confirmation de résolution sera transmise à{' '}
            <strong className="text-[#002529]">{ticket.requesterName || 'Collaborateur'}</strong>.
            Le dossier sera définitivement clôturé dès son approbation ou après délai d'acceptation automatique.
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E0D8]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded border border-[#E5E0D8] hover:bg-[#F3FBF5] text-[#151D19] font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#146C48] hover:bg-[#005234] text-white font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>Valider la proposition de résolution</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
