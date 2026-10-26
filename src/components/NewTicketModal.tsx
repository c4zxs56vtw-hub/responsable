import React, { useState } from 'react';
import { Ticket, TicketCategory, TicketPriority, ConfidentialityLevel, ResponsibleUser } from '../types/ticket';
import { generateAuditHash } from '../utils/ticket-logic';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTicket: (ticket: Ticket) => void;
  currentUser: ResponsibleUser;
}

export const NewTicketModal: React.FC<NewTicketModalProps> = ({
  isOpen,
  onClose,
  onAddTicket,
  currentUser,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [requesterDepartment, setRequesterDepartment] = useState('Direction Financière');
  const [requesterLocation, setRequesterLocation] = useState('Bâtiment B — Bureau 204');
  const [category, setCategory] = useState<TicketCategory>('Réseau et Internet');
  const [priority, setPriority] = useState<TicketPriority>('MOYENNE');
  const [confidentiality, setConfidentiality] = useState<ConfidentialityLevel>('NOMINATIF');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newRefNumber = Math.floor(100 + Math.random() * 900);
    const reference = `#EC-2026-0${newRefNumber}`;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newTicket: Ticket = {
      id: `ticket-manual-${Date.now()}`,
      reference,
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      status: 'EN_ATTENTE',
      confidentiality,
      slaInfo: priority === 'CRITIQUE' ? 'Critique • SLA 45m' : 'SLA Standard (4h max)',
      isCriticalSla: priority === 'CRITIQUE',
      requesterName: confidentiality === 'ANONYME' ? 'Signalement anonymisé' : requesterName || 'Collaborateur',
      requesterDepartment,
      requesterLocation,
      isAnonymous: confidentiality === 'ANONYME',
      assignedTo: '',
      targetDepartment: currentUser.department,
      createdAt: now.toISOString(),
      createdTimeAgo: "À l'instant",
      timeElapsed: '0 min',
      updatedAt: now.toISOString(),
      timeline: [
        {
          id: `tl-${Date.now()}`,
          time: timeStr,
          timestamp: now.toISOString(),
          title: 'Signalement manuel créé par le responsable',
          description: `Créé en guichet / astreinte par ${currentUser.name} (${currentUser.role}).`,
          author: currentUser.name,
          type: 'creation',
          hash: generateAuditHash(),
        },
      ],
      messages: [],
      attachments: [],
    };

    onAddTicket(newTicket);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#002529]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-[#E5E0D8] shadow-xl max-w-xl w-full p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-[#E5E0D8] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#173B3F] bg-[#EDF6EF] px-2 py-0.5 rounded">
                Saisie Astreinte / Hotline
              </span>
            </div>
            <h3 className="font-['DM_Serif_Display'] text-xl text-[#002529] mt-1">
              Créer un ticket manuel au pôle
            </h3>
          </div>
          <button onClick={onClose} className="text-[#66736F] hover:text-[#151D19] p-1 rounded">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
          <div>
            <label className="block font-semibold text-[#151D19] mb-1">
              Intitulé synthétique du problème *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded border border-[#E5E0D8] focus:border-[#173B3F] focus:outline-none text-xs"
              placeholder="Ex : Panne écran double affichage bureau 102..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#151D19] mb-1">
                Catégorie d'incident
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                className="w-full p-2 rounded border border-[#E5E0D8] focus:border-[#173B3F] focus:outline-none text-xs bg-white"
              >
                <option value="Réseau et Internet">Réseau et Internet</option>
                <option value="Matériel informatique">Matériel informatique</option>
                <option value="Logiciels et Systèmes">Logiciels et Systèmes</option>
                <option value="Conditions de Travail">Conditions de Travail</option>
                <option value="Ressources Humaines">Ressources Humaines</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#151D19] mb-1">
                Niveau d'urgence / Priorité
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full p-2 rounded border border-[#E5E0D8] focus:border-[#173B3F] focus:outline-none text-xs bg-white font-semibold"
              >
                <option value="CRITIQUE">Critique (SLA 45m)</option>
                <option value="ELEVEE">Élevée (SLA 4h)</option>
                <option value="MOYENNE">Moyenne (SLA 24h)</option>
                <option value="BASSE">Basse (SLA 72h)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#151D19] mb-1">
                Collaborateur concerné
              </label>
              <input
                type="text"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                className="w-full p-2 rounded border border-[#E5E0D8] focus:border-[#173B3F] focus:outline-none text-xs"
                placeholder="Ex : Claire Dufresne"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#151D19] mb-1">
                Département demandeur
              </label>
              <input
                type="text"
                value={requesterDepartment}
                onChange={(e) => setRequesterDepartment(e.target.value)}
                className="w-full p-2 rounded border border-[#E5E0D8] focus:border-[#173B3F] focus:outline-none text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#151D19] mb-1">
                Localisation / Bureau
              </label>
              <input
                type="text"
                value={requesterLocation}
                onChange={(e) => setRequesterLocation(e.target.value)}
                className="w-full p-2 rounded border border-[#E5E0D8] focus:border-[#173B3F] focus:outline-none text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#151D19] mb-1">
              Protocole de confidentialité
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'NOMINATIF', label: 'Nominatif', desc: 'Échanges ouverts' },
                { id: 'CONFIDENTIEL', label: 'Confidentiel', desc: 'RH/DSI Niv 3' },
                { id: 'ANONYME', label: 'Anonymisé', desc: 'Identité masquée' },
              ].map((lvl) => (
                <button
                  type="button"
                  key={lvl.id}
                  onClick={() => setConfidentiality(lvl.id as ConfidentialityLevel)}
                  className={`p-2 rounded border text-left transition-all ${
                    confidentiality === lvl.id
                      ? 'border-[#173B3F] bg-[#EDF6EF] font-bold text-[#002529]'
                      : 'border-[#E5E0D8] bg-white text-[#414849]'
                  }`}
                >
                  <p className="text-xs">{lvl.label}</p>
                  <p className="text-[10px] text-[#66736F]">{lvl.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#151D19] mb-1">
              Description détaillée des symptômes constatés *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded border border-[#E5E0D8] focus:border-[#173B3F] focus:outline-none text-xs resize-none"
              placeholder="Renseignez les constatations techniques ou la demande exprimée..."
            />
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
              <span className="material-symbols-outlined text-sm">save</span>
              <span>Enregistrer et intégrer à la file de triage</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
