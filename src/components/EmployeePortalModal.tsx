import React, { useState } from 'react';
import { ResponsibleUser } from '../types/ticket';

interface EmployeePortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: ResponsibleUser;
}

export const EmployeePortalModal: React.FC<EmployeePortalModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [personalTab, setPersonalTab] = useState<'my_tickets' | 'new_declaration'>('my_tickets');
  const [personalSubject, setPersonalSubject] = useState('');
  const [personalCategory, setPersonalCategory] = useState('Matériel et équipements');
  const [personalDescription, setPersonalDescription] = useState('');
  const [personalTickets, setPersonalTickets] = useState([
    {
      id: 'pers-1',
      ref: '#EC-PERS-042',
      title: 'Demande de rehausseur ergonomique bureau',
      status: 'En cours de validation RH',
      date: '20 Oct. 2026',
    },
    {
      id: 'pers-2',
      ref: '#EC-PERS-019',
      title: 'Question sur le calcul des RTT trimestriels',
      status: 'Réponse apportée par le pôle RH',
      date: '14 Oct. 2026',
    },
  ]);

  if (!isOpen) return null;

  const handleCreatePersonalTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalSubject.trim()) return;

    setPersonalTickets([
      {
        id: `pers-${Date.now()}`,
        ref: `#EC-PERS-${Math.floor(100 + Math.random() * 900)}`,
        title: personalSubject.trim(),
        status: 'Transmis au pôle compétent',
        date: "Aujourd'hui",
      },
      ...personalTickets,
    ]);

    setPersonalSubject('');
    setPersonalDescription('');
    setPersonalTab('my_tickets');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#002529]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#E5E0D8] shadow-2xl max-w-2xl w-full p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E5E0D8] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#146C48] text-white flex items-center justify-center font-bold">
              <span className="material-symbols-outlined">person</span>
            </div>
            <div>
              <span className="font-['JetBrains_Mono'] text-[11px] text-[#146C48] font-bold">
                ESPACE PERSONNEL DU SALARIÉ
              </span>
              <h3 className="font-['DM_Serif_Display'] text-xl text-[#002529]">
                Mon Espace Salarié — {currentUser.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-xs text-[#002529] font-bold bg-[#EDF6EF] px-2.5 py-1 rounded hover:bg-[#DCE5DE]"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Retour Console Responsable</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E5E0D8] pb-2 text-xs">
          <button
            onClick={() => setPersonalTab('my_tickets')}
            className={`px-3 py-1.5 rounded font-semibold transition-all ${
              personalTab === 'my_tickets'
                ? 'bg-[#173B3F] text-white'
                : 'text-[#414849] hover:bg-[#F3FBF5]'
            }`}
          >
            Mes démarches personnelles ({personalTickets.length})
          </button>
          <button
            onClick={() => setPersonalTab('new_declaration')}
            className={`px-3 py-1.5 rounded font-semibold transition-all ${
              personalTab === 'new_declaration'
                ? 'bg-[#173B3F] text-white'
                : 'text-[#414849] hover:bg-[#F3FBF5]'
            }`}
          >
            + Déclarer une préoccupation personnelle
          </button>
        </div>

        {/* Tab 1: My Personal Submissions */}
        {personalTab === 'my_tickets' ? (
          <div className="space-y-3">
            <p className="text-xs text-[#66736F]">
              En tant que salariée de l'entreprise, voici les requêtes personnelles que vous avez transmises aux autres pôles (RH, Moyens Généraux, etc.).
            </p>

            <div className="border border-[#E5E0D8] rounded divide-y divide-[#E5E0D8] text-xs">
              {personalTickets.map((t) => (
                <div key={t.id} className="p-3 flex items-center justify-between bg-white hover:bg-[#F3FBF5]">
                  <div className="flex flex-col">
                    <span className="font-['JetBrains_Mono'] text-[10px] text-[#173B3F] font-bold">{t.ref}</span>
                    <span className="font-semibold text-[#151D19]">{t.title}</span>
                    <span className="text-[10px] text-[#66736F]">Déposé le {t.date}</span>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#EDF6EF] text-[#146C48] font-semibold">
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Tab 2: New Personal Declaration */
          <form onSubmit={handleCreatePersonalTicket} className="flex flex-col gap-3 text-xs">
            <div>
              <label className="block font-semibold text-[#151D19] mb-1">
                Objet de ma démarche
              </label>
              <input
                type="text"
                required
                value={personalSubject}
                onChange={(e) => setPersonalSubject(e.target.value)}
                placeholder="Ex : Problème de climatisation bureau..."
                className="w-full p-2.5 rounded border border-[#E5E0D8] focus:border-[#173B3F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#151D19] mb-1">
                Pôle concerné
              </label>
              <select
                value={personalCategory}
                onChange={(e) => setPersonalCategory(e.target.value)}
                className="w-full p-2.5 rounded border border-[#E5E0D8] focus:border-[#173B3F] focus:outline-none bg-white"
              >
                <option value="Ressources Humaines">Pôle Ressources Humaines & Contrats</option>
                <option value="Matériel et équipements">Pôle Services Généraux & Mobilier</option>
                <option value="Conditions de travail">Pôle Santé & Conditions de Travail</option>
                <option value="Médiation & Relations">Cellule d'Écoute & Médiation Indépendante</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#151D19] mb-1">
                Description de ma situation
              </label>
              <textarea
                rows={3}
                required
                value={personalDescription}
                onChange={(e) => setPersonalDescription(e.target.value)}
                placeholder="Décrivez votre préoccupation avec précision..."
                className="w-full p-2.5 rounded border border-[#E5E0D8] focus:border-[#173B3F] focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E0D8]">
              <button
                type="button"
                onClick={() => setPersonalTab('my_tickets')}
                className="px-3 py-1.5 rounded border border-[#E5E0D8] hover:bg-[#F3FBF5]"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-[#146C48] text-white font-semibold hover:bg-[#005234]"
              >
                Transmettre ma démarche
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
