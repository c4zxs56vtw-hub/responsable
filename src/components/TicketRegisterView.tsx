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

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-['JetBrains_Mono'] text-xs font-semibold text-[#146C48] uppercase tracking-wider">
            Supervision Centralisée
          </span>
          <h2 className="font-['DM_Serif_Display'] text-2xl text-[#002529] mt-1">
            Registre Exhaustif & Matrice de Triage du Pôle
          </h2>
          <p className="text-xs text-[#66736F] mt-1">
            {filteredTickets.length} signalements répertoriés pour le {currentUser.department}.
          </p>
        </div>

        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-[#E5E0D8] text-xs font-semibold text-[#151D19] hover:bg-[#F3FBF5] self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Retour au Tableau de bord</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-lg border border-[#E5E0D8] text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#414849]">Statut :</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1.5 rounded border border-[#E5E0D8] bg-[#F7F5F0] text-xs"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="EN_ATTENTE">À traiter / En attente</option>
            <option value="DIAGNOSTIC_EN_COURS">Diagnostic en cours</option>
            <option value="ATTENTE_VALIDATION">En attente validation</option>
            <option value="RESOLU">Résolu</option>
            <option value="CLOTURE">Clôturé</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#414849]">Priorité :</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="p-1.5 rounded border border-[#E5E0D8] bg-[#F7F5F0] text-xs"
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
              <tr className="bg-[#EDF6EF] text-[#414849] border-b border-[#E5E0D8] font-['DM_Sans'] text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-4">Référence</th>
                <th className="py-2.5 px-4">Intitulé de l'incident</th>
                <th className="py-2.5 px-4">Demandeur / Bureau</th>
                <th className="py-2.5 px-4">Priorité & SLA</th>
                <th className="py-2.5 px-4">Statut</th>
                <th className="py-2.5 px-4">Responsable</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8]">
              {filteredTickets.map((ticket) => (
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
                      {ticket.requesterName || 'Anonymisé'}
                    </span>
                    <span className="text-[11px] text-[#66736F] truncate max-w-xs block">
                      {ticket.requesterLocation || ticket.requesterDepartment}
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
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        ticket.status === 'RESOLU'
                          ? 'bg-[#A2F4C6] text-[#002112]'
                          : ticket.status === 'CLOTURE'
                          ? 'bg-[#E7F0E9] text-[#66736F]'
                          : ticket.status === 'DIAGNOSTIC_EN_COURS'
                          ? 'bg-[#EDF6EF] text-[#002529]'
                          : 'bg-[#DCE5DE] text-[#414849]'
                      }`}
                    >
                      {ticket.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-['JetBrains_Mono'] text-[11px]">
                    {ticket.assignedTo ? (
                      <span className="text-[#146C48] font-semibold">{ticket.assignedTo}</span>
                    ) : (
                      <span className="text-[#66736F]">Non assigné</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {!ticket.assignedTo ? (
                      <button
                        onClick={(e) => onTakeCharge(ticket, e)}
                        className="px-2 py-1 rounded bg-[#173B3F] text-white font-semibold text-[11px] hover:bg-[#002529]"
                      >
                        Prendre en charge
                      </button>
                    ) : (
                      <button
                        onClick={() => onSelectTicket(ticket)}
                        className="px-2 py-1 rounded bg-[#EDF6EF] text-[#002529] font-medium text-[11px] hover:bg-[#DCE5DE]"
                      >
                        Ouvrir
                      </button>
                    )}
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
