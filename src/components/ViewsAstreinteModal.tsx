import React from 'react';
import { ResponsibleUser } from '../types/ticket';

interface ViewsAstreinteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: ResponsibleUser;
}

export const ViewsAstreinteModal: React.FC<ViewsAstreinteModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#002529]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#E5E0D8] shadow-xl max-w-xl w-full p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between border-b border-[#E5E0D8] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#146C48] bg-[#EDF6EF] px-2 py-0.5 rounded">
                Supervision 24/7 & Continuité
              </span>
            </div>
            <h3 className="font-['DM_Serif_Display'] text-xl text-[#002529] mt-1">
              Roster & Vues d'astreinte opérationnelle
            </h3>
          </div>
          <button onClick={onClose} className="text-[#66736F] hover:text-[#151D19] p-1 rounded">
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-[#F7F5F0] rounded border border-[#E5E0D8]">
            <p className="font-bold text-[#002529] mb-1">
              Protocole d'astreinte Pôle IT & Infrastructure (Semaine 43)
            </p>
            <p className="text-[#414849] leading-relaxed">
              En cas d'incident critique de Niveau 1 (SLA &lt; 45 minutes) tel qu'une panne de switch de baie ou perte de lien WAN, l'escalade est automatiquement routée vers l'ingénieur d'astreinte de garde.
            </p>
          </div>

          <div className="border border-[#E5E0D8] rounded divide-y divide-[#E5E0D8]">
            <div className="p-3 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#146C48]"></span>
                <div>
                  <p className="font-bold text-[#151D19]">Sophie Dubois (Responsable)</p>
                  <p className="text-[#66736F] text-[11px]">Astreinte Opérationnelle de Jour • Ligne directe 402-1</p>
                </div>
              </div>
              <span className="font-mono text-[11px] bg-[#A2F4C6] text-[#002112] px-2 py-0.5 rounded font-semibold">
                Actif
              </span>
            </div>

            <div className="p-3 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A86412]"></span>
                <div>
                  <p className="font-bold text-[#151D19]">Marc L. (Technicien Réseau)</p>
                  <p className="text-[#66736F] text-[11px]">Intervention physique campus • Clés baie B/C</p>
                </div>
              </div>
              <span className="font-mono text-[11px] bg-[#FFDCBF] text-[#522D00] px-2 py-0.5 rounded font-semibold">
                Sur site
              </span>
            </div>

            <div className="p-3 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#66736F]"></span>
                <div>
                  <p className="font-bold text-[#151D19]">Escalade Télécoms Opérateur (NOC)</p>
                  <p className="text-[#66736F] text-[11px]">GTR 2 heures sous contrat SLA Gold</p>
                </div>
              </div>
              <span className="font-mono text-[11px] bg-[#EDF6EF] text-[#414849] px-2 py-0.5 rounded">
                Standby
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#E5E0D8]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-[#173B3F] text-white text-xs font-semibold hover:bg-[#002529]"
          >
            Fermer la vue d'astreinte
          </button>
        </div>
      </div>
    </div>
  );
};
