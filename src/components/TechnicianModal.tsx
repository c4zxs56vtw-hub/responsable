import React, { useState } from 'react';
import { Ticket, ResponsibleUser } from '../types/ticket';

interface TechnicianModalProps {
  isOpen: boolean;
  ticket: Ticket | null;
  onClose: () => void;
  onSchedule: (ticket: Ticket, technician: string, dateSlot: string, note: string) => void;
  currentUser: ResponsibleUser;
}

export const TechnicianModal: React.FC<TechnicianModalProps> = ({
  isOpen,
  ticket,
  onClose,
  onSchedule,
}) => {
  const [technician, setTechnician] = useState('Marc L. (Technicien Réseau & Câblage)');
  const [dateSlot, setDateSlot] = useState("Aujourd'hui à 14h30 (Créneau 45 min)");
  const [interventionType, setInterventionType] = useState('Diagnostic physique & Panneau de brassage');
  const [note, setNote] = useState('Emporter testeur Fluke DSX-5000 et jeu de jarretières Cat6A blindées.');

  if (!isOpen || !ticket) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSchedule(ticket, technician, dateSlot, `${interventionType} - ${note}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#002529]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#E5E0D8] shadow-xl max-w-lg w-full p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between border-b border-[#E5E0D8] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#146C48] bg-[#EDF6EF] px-2 py-0.5 rounded">
                Planification Intervention
              </span>
              <span className="font-['JetBrains_Mono'] text-xs text-[#66736F]">
                {ticket.reference}
              </span>
            </div>
            <h3 className="font-['DM_Serif_Display'] text-xl text-[#002529] mt-1">
              Diligenter un technicien sur site
            </h3>
          </div>
          <button onClick={onClose} className="text-[#66736F] hover:text-[#151D19] p-1 rounded">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
          <div>
            <label className="block font-semibold text-[#151D19] mb-1">
              Technicien habilité assigné
            </label>
            <select
              value={technician}
              onChange={(e) => setTechnician(e.target.value)}
              className="w-full p-2.5 rounded border border-[#E5E0D8] focus:border-[#173B3F] focus:outline-none bg-white font-medium"
            >
              <option value="Marc L. (Technicien Réseau & Câblage)">Marc L. (Technicien Réseau & Câblage)</option>
              <option value="Karim B. (Support Poste de Travail)">Karim B. (Support Poste de Travail)</option>
              <option value="Alexandre D. (Ingénieur Systèmes)">Alexandre D. (Ingénieur Systèmes)</option>
              <option value="Prestataire Extérieur (Astreinte Télécoms)">Prestataire Extérieur (Astreinte Télécoms)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#151D19] mb-1">
              Créneau d'intervention sur site
            </label>
            <select
              value={dateSlot}
              onChange={(e) => setDateSlot(e.target.value)}
              className="w-full p-2.5 rounded border border-[#E5E0D8] focus:border-[#173B3F] focus:outline-none bg-white font-medium"
            >
              <option value="Immédiat (Astreinte Urgente 30m)">Immédiat (Astreinte Urgente 30m)</option>
              <option value="Aujourd'hui à 14h30 (Créneau 45 min)">Aujourd'hui à 14h30 (Créneau 45 min)</option>
              <option value="Aujourd'hui à 16h30 (Fin de journée)">Aujourd'hui à 16h30 (Fin de journée)</option>
              <option value="Demain à 08h30 (Avant ouverture)">Demain à 08h30 (Avant ouverture)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#151D19] mb-1">
              Nature de l'intervention
            </label>
            <input
              type="text"
              value={interventionType}
              onChange={(e) => setInterventionType(e.target.value)}
              className="w-full p-2.5 rounded border border-[#E5E0D8] focus:border-[#173B3F] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#151D19] mb-1">
              Consignes d'accès et outillage
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2.5 rounded border border-[#E5E0D8] focus:border-[#173B3F] focus:outline-none resize-none"
            />
          </div>

          <div className="p-2.5 rounded bg-[#EDF6EF] text-[11px] text-[#414849]">
            L'intervention sera consignée dans le journal d'audit cryptographique et l'employé recevra un créneau de passage estimé.
          </div>

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
              className="px-4 py-2 rounded bg-[#173B3F] hover:bg-[#002529] text-white font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">assignment_turned_in</span>
              <span>Confirmer la planification</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
