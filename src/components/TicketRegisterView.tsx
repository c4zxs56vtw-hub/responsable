import React, { useState } from 'react';
import { Ticket, ResponsibleUser } from '../types/ticket';

interface TicketRegisterViewProps {
  tickets: Ticket[];
  currentUser: ResponsibleUser;
  onSelectTicket: (ticket: Ticket) => void;
  onTakeCharge: (ticket: Ticket, e: React.MouseEvent) => void;
  onBackToDashboard: () => void;
}

export const TicketRegisterView: React.FC<TicketRegisterViewProps> = ({
  tickets,
  currentUser,
  onSelectTicket,
  onTakeCharge,
  onBackToDashboard,
}) => {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Department-scoped
  const deptTickets = tickets.filter((t) => t.targetDepartment === currentUser.department);

  const filteredTickets = deptTickets.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = t.reference.toLowerCase().includes(q);
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchCat = t.category.toLowerCase().includes(q);
      const matchReq = t.requesterName?.toLowerCase().includes(q) ?? false;
      if (!matchRef && !matchTitle && !matchCat && !matchReq) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6 font-['DM_Sans']">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-['JetBrains_Mono'] text-xs font-semibold text-[#146C48] uppercase tracking-wider">
            Vue Opérationnelle
          </span>
          <h2 className="font-['DM_Serif_Display'] text-2xl text-[#002529] mt-1">
            Signalements reçus
          </h2>
          <p className="text-xs text-[#66736F] mt-1">
            {filteredTickets.length} signalement{filteredTickets.length > 1 ? 's' : ''} enregistré{filteredTickets.length > 1 ? 's' : ''} pour le {currentUser.department}.
          </p>
        </div>

        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-[#E5E0D8] text-xs font-semibold text-[#151D19] hover:bg-[#F3FBF5] self-start sm:self-auto shadow-2xs transition-colors"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Retour au Tableau de bord</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-lg border border-[#E5E0D8] text-xs shadow-2xs">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-2.5 top-2 text-base text-[#66736F]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par référence, titre, collaborateur..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#F7F5F0] border border-[#E5E0D8] rounded text-xs text-[#151D19] focus:outline-none focus:border-[#173B3F]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#414849]">Statut :</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1.5 rounded border border-[#E5E0D8] bg-[#F7F5F0] text-xs font-medium"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="EN_ATTENTE">À traiter / En attente</option>
            <option value="DIAGNOSTIC_EN_COURS">Diagnostic en cours</option>
            <option value="ATTENTE_VALIDATION">En attente validation</option>
            <option value="RESOLU">Résolu</option>
            <option value="CLOTURE">Clôturé</option>
            <option value="ROUVERT">Rouvert</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#414849]">Priorité :</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="p-1.5 rounded border border-[#E5E0D8] bg-[#F7F5F0] text-xs font-medium"
          >
            <option value="ALL">Toutes les priorités</option>
            <option value="CRITIQUE">Critique</option>
            <option value="ELEVEE">Élevée</option>
            <option value="MOYENNE">Moyenne</option>
            <option value="BASSE">Basse</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5E0D8] rounded-lg shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#EDF6EF] text-[#414849] border-b border-[#E5E0D8] text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-4">Référence</th>
                <th className="py-2.5 px-4">Intitulé du signalement</th>
                <th className="py-2.5 px-4">Demandeur / Emplacement</th>
                <th className="py-2.5 px-4">Priorité & SLA</th>
                <th className="py-2.5 px-4">Statut</th>
                <th className="py-2.5 px-4">Assignation</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8]">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#66736F]">
                    Aucun signalement ne correspond à vos filtres.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => onSelectTicket(ticket)}
                    className="hover:bg-[#F7F5F0] cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-['JetBrains_Mono'] font-bold text-[#002529]">
                      {ticket.reference}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#151D19] block max-w-sm truncate">
                        {ticket.title}
                      </span>
                      <span className="text-[11px] text-[#66736F]">{ticket.category}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-[#151D19] block">
                        {ticket.isAnonymous ? 'Anonyme' : (ticket.requesterName || 'Collaborateur')}
                      </span>
                      <span className="text-[11px] text-[#66736F] truncate max-w-xs block">
                        {ticket.requesterLocation || ticket.requesterDepartment || 'Non précisé'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-['JetBrains_Mono'] text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          ticket.priority === 'CRITIQUE'
                            ? 'bg-[#FFDAD6] text-[#93000A]'
                            : ticket.priority === 'ELEVEE'
                            ? 'bg-[#FFDCBF] text-[#522D00]'
                            : 'bg-[#EDF6EF] text-[#414849]'
                        }`}
                      >
                        {ticket.priority}
                      </span>
                      <span className="text-[10px] text-[#66736F] block mt-0.5">
                        {ticket.slaInfo}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          ticket.status === 'RESOLU'
                            ? 'bg-[#A2F4C6] text-[#002112]'
                            : ticket.status === 'CLOTURE'
                            ? 'bg-[#E7F0E9] text-[#414849]'
                            : ticket.status === 'ROUVERT'
                            ? 'bg-[#FFDAD6] text-[#93000A]'
                            : ticket.status === 'DIAGNOSTIC_EN_COURS'
                            ? 'bg-[#EDF6EF] text-[#002529]'
                            : 'bg-[#FFDAD6] text-[#93000A]'
                        }`}
                      >
                        {ticket.status === 'DIAGNOSTIC_EN_COURS'
                          ? 'En cours'
                          : ticket.status === 'ATTENTE_VALIDATION'
                          ? 'Validation'
                          : ticket.status === 'EN_ATTENTE'
                          ? 'À traiter'
                          : ticket.status === 'RESOLU'
                          ? 'Résolu'
                          : ticket.status === 'CLOTURE'
                          ? 'Clôturé'
                          : 'Rouvert'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[#151D19] font-medium block">
                        {ticket.assignedTo || 'Non assigné'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {ticket.status === 'EN_ATTENTE' || ticket.status === 'ROUVERT' ? (
                        <button
                          onClick={(e) => onTakeCharge(ticket, e)}
                          className="px-2.5 py-1 rounded bg-[#173B3F] hover:bg-[#002529] text-white text-xs font-semibold shadow-2xs"
                        >
                          Prendre en charge
                        </button>
                      ) : (
                        <span className="text-[#66736F] text-[11px] font-semibold">
                          Consulter →
                        </span>
                      )}
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
