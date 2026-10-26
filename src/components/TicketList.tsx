import React, { useState } from 'react';
import { Ticket, ResponsibleUser } from '../types/ticket';

interface TicketListProps {
  tickets: Ticket[];
  selectedTicketId: string;
  onSelectTicket: (ticket: Ticket) => void;
  onTakeCharge: (ticket: Ticket, e: React.MouseEvent) => void;
  currentUser: ResponsibleUser;
  onViewAllArchive?: () => void;
}

export const TicketList: React.FC<TicketListProps> = ({
  tickets,
  selectedTicketId,
  onSelectTicket,
  onTakeCharge,
  currentUser,
  onViewAllArchive,
}) => {
  const [sortOrder, setSortOrder] = useState<'sla' | 'recent'>('sla');

  const sortedTickets = [...tickets].sort((a, b) => {
    if (sortOrder === 'sla') {
      const aScore = a.priority === 'CRITIQUE' ? 0 : a.priority === 'ELEVEE' ? 1 : a.priority === 'MOYENNE' ? 2 : 3;
      const bScore = b.priority === 'CRITIQUE' ? 0 : b.priority === 'ELEVEE' ? 1 : b.priority === 'MOYENNE' ? 2 : 3;
      return aScore - bScore;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="flex flex-col gap-2.5">
      {/* Triage Queue Bar */}
      <div className="flex items-center justify-between px-1">
        <span className="font-['DM_Sans'] text-xs text-[#66736F] uppercase tracking-wider font-bold">
          File de traitement ({sortedTickets.length} signalements)
        </span>
        <button
          onClick={() => setSortOrder(sortOrder === 'sla' ? 'recent' : 'sla')}
          className="text-xs text-[#002529] font-medium flex items-center gap-1 hover:underline transition-colors font-['DM_Sans']"
        >
          <span className="material-symbols-outlined text-sm">swap_vert</span>
          <span>{sortOrder === 'sla' ? 'Par priorité' : 'Plus récents'}</span>
        </button>
      </div>

      {/* Ticket Cards List */}
      {sortedTickets.length === 0 ? (
        <div className="p-8 text-center bg-white border border-[#E5E0D8] rounded-lg">
          <span className="material-symbols-outlined text-3xl text-[#66736F] mb-2 block">
            inbox
          </span>
          <p className="text-sm font-semibold text-[#151D19] font-['DM_Sans']">
            Aucun signalement ne correspond à cette sélection
          </p>
          <p className="text-xs text-[#66736F] mt-1 font-['DM_Sans']">
            Modifiez vos filtres ou effectuez une autre recherche.
          </p>
        </div>
      ) : (
        sortedTickets.map((ticket) => {
          const isSelected = ticket.id === selectedTicketId;
          const isCritical = ticket.priority === 'CRITIQUE';
          const isToTreat = ticket.status === 'EN_ATTENTE' || ticket.status === 'ROUVERT';
          const isUnassigned = !ticket.assignedTo || ticket.assignedTo.trim().length === 0;

          // Card boundary classes
          let cardClasses = 'p-3.5 rounded-lg bg-white border transition-all cursor-pointer flex flex-col gap-2 relative shadow-xs ';
          if (isSelected) {
            cardClasses += 'border-[#173B3F] ring-2 ring-[#173B3F] bg-gradient-to-r from-[#EDF6EF]/50 to-white';
          } else if (isCritical && isToTreat) {
            cardClasses += 'border-[#FFDAD6] ring-2 ring-[#BA1A1A] hover:bg-[#FFFBFB]';
          } else {
            cardClasses += 'border-[#E5E0D8] hover:border-[#173B3F] hover:bg-[#F3FBF5]/40';
          }

          return (
            <div
              key={ticket.id}
              onClick={() => onSelectTicket(ticket)}
              className={cardClasses}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectTicket(ticket);
                }
              }}
              aria-label={`Signalement ${ticket.reference} : ${ticket.title}`}
            >
              {/* Header Row: Reference & Badges & Time */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`font-['JetBrains_Mono'] text-xs font-bold ${
                      isCritical ? 'text-[#BA1A1A]' : 'text-[#002529]'
                    }`}
                  >
                    {ticket.reference}
                  </span>

                  {/* Priority Badge */}
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wide font-['DM_Sans'] ${
                      ticket.priority === 'CRITIQUE'
                        ? 'bg-[#FFDAD6] text-[#93000A]'
                        : ticket.priority === 'ELEVEE'
                        ? 'bg-[#FFDCBF] text-[#522D00]'
                        : ticket.priority === 'MOYENNE'
                        ? 'bg-[#EDF6EF] text-[#002529]'
                        : 'bg-[#E7F0E9] text-[#66736F]'
                    }`}
                  >
                    {ticket.priority === 'CRITIQUE'
                      ? 'Critique'
                      : ticket.priority === 'ELEVEE'
                      ? 'Élevée'
                      : ticket.priority === 'MOYENNE'
                      ? 'Moyenne'
                      : 'Faible'}
                  </span>

                  {/* Status Badge */}
                  {ticket.status === 'ROUVERT' ? (
                    <span className="font-['DM_Sans'] text-[10px] px-1.5 py-0.2 rounded bg-[#FFDAD6] text-[#93000A] font-bold uppercase tracking-wide">
                      Rouvert
                    </span>
                  ) : ticket.status === 'EN_ATTENTE' ? (
                    <span className="font-['DM_Sans'] text-[10px] px-1.5 py-0.2 rounded bg-[#FFDAD6]/60 text-[#93000A] font-semibold uppercase tracking-wide">
                      À traiter
                    </span>
                  ) : ticket.status === 'DIAGNOSTIC_EN_COURS' ? (
                    <span className="font-['DM_Sans'] text-[10px] px-1.5 py-0.2 rounded bg-[#EDF6EF] text-[#002529] font-bold uppercase tracking-wide">
                      En cours
                    </span>
                  ) : ticket.status === 'ATTENTE_VALIDATION' ? (
                    <span className="font-['DM_Sans'] text-[10px] px-1.5 py-0.2 rounded bg-[#DCE5DE] text-[#414849] font-semibold uppercase tracking-wide">
                      Validation
                    </span>
                  ) : ticket.status === 'RESOLU' ? (
                    <span className="font-['DM_Sans'] text-[10px] px-1.5 py-0.2 rounded bg-[#A2F4C6] text-[#002112] font-semibold uppercase tracking-wide">
                      Résolu
                    </span>
                  ) : (
                    <span className="font-['DM_Sans'] text-[10px] px-1.5 py-0.2 rounded bg-[#E7F0E9] text-[#66736F] font-semibold uppercase tracking-wide">
                      Clôturé
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-[#66736F] whitespace-nowrap font-['DM_Sans']">
                  {ticket.createdTimeAgo}
                </span>
              </div>

              {/* Title & Excerpt */}
              <div>
                <h3
                  className={`text-sm font-semibold leading-snug line-clamp-2 font-['DM_Sans'] ${
                    isSelected ? 'text-[#002529] font-bold' : 'text-[#151D19]'
                  }`}
                >
                  {ticket.title}
                </h3>
                <p className="text-xs text-[#66736F] mt-1 line-clamp-2 leading-relaxed font-['DM_Sans']">
                  {ticket.description}
                </p>
              </div>

              {/* Bottom Info Row */}
              <div className="pt-1 flex items-center justify-between gap-2 text-xs text-[#66736F] font-['DM_Sans']">
                {isCritical && isToTreat && isUnassigned ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#BA1A1A] animate-ping"></span>
                      <span className="text-xs text-[#BA1A1A] font-bold">
                        Non assigné
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => onTakeCharge(ticket, e)}
                      className="px-2.5 py-1 rounded bg-[#BA1A1A] text-white hover:bg-[#93000A] text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">bolt</span>
                      <span>Prendre en charge</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 truncate">
                      {ticket.isAnonymous ? (
                        <div className="w-5 h-5 rounded-full bg-[#DCE5DE] text-[#414849] flex items-center justify-center font-mono text-[9px] font-bold">
                          ?
                        </div>
                      ) : ticket.requesterAvatar ? (
                        <img
                          src={ticket.requesterAvatar}
                          alt={ticket.requesterName || 'Demandeur'}
                          className="w-5 h-5 rounded-full object-cover border border-[#E5E0D8]"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-[#DCE5DE] text-[#414849] flex items-center justify-center font-mono text-[9px] font-bold">
                          {ticket.requesterName ? ticket.requesterName.substring(0, 2).toUpperCase() : 'EC'}
                        </div>
                      )}
                      <span className="text-xs font-medium text-[#151D19] truncate">
                        {ticket.isAnonymous ? 'Signalement anonymisé' : ticket.requesterName || 'Collaborateur'}
                      </span>
                      {ticket.requesterLocation && (
                        <span className="text-[11px] text-[#66736F] truncate hidden sm:inline">
                          • {ticket.requesterLocation.split('—')[0].trim()}
                        </span>
                      )}
                    </div>

                    <div className="shrink-0">
                      {ticket.assignedTo ? (
                        <span className="text-xs text-[#146C48] font-semibold">
                          {ticket.assignedTo}
                        </span>
                      ) : (
                        <span className="text-xs text-[#66736F]">
                          Non assigné
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })
      )}

      {/* Archive / History link footer */}
      <div className="p-2.5 rounded bg-[#EDF6EF] border border-[#E5E0D8] flex items-center justify-between text-xs text-[#414849] font-['DM_Sans']">
        <span>Consulter l'ensemble des signalements du service</span>
        <button
          onClick={onViewAllArchive}
          className="font-bold text-[#002529] hover:underline"
        >
          Ouvrir le registre
        </button>
      </div>
    </div>
  );
};
