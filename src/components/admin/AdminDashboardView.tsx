import React from 'react';
import {
  AdminDashboardStats,
  AdminActivityEvent,
  CategoryAttribution,
} from '../../types/admin';
import { Ticket } from '../../types/ticket';
import { AdminViewId } from './AdminSidebar';
import { isTicketConfidentialRestricted } from '../../utils/admin-logic';

interface AdminDashboardViewProps {
  stats: AdminDashboardStats;
  events: AdminActivityEvent[];
  tickets: Ticket[];
  categories: CategoryAttribution[];
  onNavigate: (view: AdminViewId) => void;
  onQuickAddEmployee: () => void;
  onQuickAddResponsable: () => void;
  onQuickCreateDepartment: () => void;
  onReassignTicket: (ticket: Ticket) => void;
}

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  CRITIQUE: { label: 'Critique', color: 'text-[#B42332] font-semibold' },
  ELEVEE: { label: 'Élevée', color: 'text-[#A86412] font-semibold' },
  MOYENNE: { label: 'Moyenne', color: 'text-[#173B3F]' },
  BASSE: { label: 'Faible', color: 'text-[#66736F]' },
};

const STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  ROUVERT: 'Rouvert',
  DIAGNOSTIC_EN_COURS: 'En cours',
  ATTENTE_VALIDATION: 'Validation requise',
  RESOLU: 'Résolu',
  CLOTURE: 'Clôturé',
};

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  stats,
  events,
  tickets,
  categories,
  onNavigate,
  onQuickAddEmployee,
  onQuickAddResponsable,
  onQuickCreateDepartment,
  onReassignTicket,
}) => {
  // Tickets requiring administrative attention: unassigned open tickets or urgent/pending tickets
  const attentionTickets = tickets
    .filter(
      (t) =>
        t.status !== 'RESOLU' &&
        t.status !== 'CLOTURE' &&
        (!t.assignedTo ||
          t.assignedTo.trim() === '' ||
          t.priority === 'CRITIQUE' ||
          t.status === 'EN_ATTENTE' ||
          t.status === 'ROUVERT')
    )
    .slice(0, 6);

  const unassignedCategories = categories.filter(
    (c) => c.status === 'ACTIVE' && (!c.primaryManagerId || c.primaryManagerId.trim() === '')
  );

  return (
    <div className="flex flex-col gap-6 font-['DM_Sans']">
      {/* En-tête éditorial + Actions rapides */}
      <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="max-w-2xl">
          <h1 className="font-['DM_Serif_Display'] text-2xl lg:text-3xl text-[#202824] tracking-tight">
            Bonjour, bienvenue dans votre espace d’administration.
          </h1>
          <p className="text-sm text-[#66736F] mt-1.5 leading-relaxed">
            Gérez les utilisateurs, organisez les services et supervisez le traitement des préoccupations professionnelles.
          </p>
        </div>

        {/* 3 Actions rapides */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onQuickAddEmployee}
            className="px-4 py-2 rounded bg-[#173B3F] hover:bg-[#102B2E] text-white text-xs font-semibold transition-colors whitespace-nowrap"
          >
            + Ajouter un employé
          </button>
          <button
            type="button"
            onClick={onQuickAddResponsable}
            className="px-4 py-2 rounded bg-[#FFFFFF] hover:bg-[#F7F5F0] text-[#173B3F] border border-[#173B3F] text-xs font-semibold transition-colors whitespace-nowrap"
          >
            + Ajouter un responsable
          </button>
          <button
            type="button"
            onClick={onQuickCreateDepartment}
            className="px-4 py-2 rounded bg-[#F7F5F0] hover:bg-[#E5E0D8] text-[#202824] border border-[#E5E0D8] text-xs font-semibold transition-colors whitespace-nowrap"
          >
            + Créer un département
          </button>
        </div>
      </div>

      {/* 4 Indicateurs principaux (KPIs) — 100% cohérents avec la source commune */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => onNavigate('employees')}
          className="bg-[#FFFFFF] border border-[#E5E0D8] hover:border-[#173B3F] rounded-lg p-5 text-left transition-colors flex flex-col justify-between"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-[#66736F]">
              Employés actifs
            </span>
            <span className="font-['JetBrains_Mono'] text-xs font-semibold text-[#173B3F] tabular-nums">
              Total : {stats.totalEmployees}
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="font-['DM_Serif_Display'] text-3xl text-[#202824] tabular-nums">
              {stats.activeEmployees}
            </span>
            <span className="text-xs text-[#66736F] tabular-nums text-right">
              {stats.pendingEmployees} en attente · {stats.deactivatedEmployees} désactivé{stats.deactivatedEmployees > 1 ? 's' : ''}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('responsables')}
          className="bg-[#FFFFFF] border border-[#E5E0D8] hover:border-[#173B3F] rounded-lg p-5 text-left transition-colors flex flex-col justify-between"
        >
          <span className="text-xs font-semibold text-[#66736F]">
            Responsables actifs
          </span>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-['DM_Serif_Display'] text-3xl text-[#173B3F] tabular-nums">
              {stats.activeResponsables}
            </span>
            <span className="text-xs text-[#287A55] font-medium">
              Inclus dans l’effectif ({stats.totalEmployees})
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('signalements')}
          className="bg-[#FFFFFF] border border-[#E5E0D8] hover:border-[#173B3F] rounded-lg p-5 text-left transition-colors flex flex-col justify-between"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-[#66736F]">
              Signalements à traiter
            </span>
            <span className="font-['JetBrains_Mono'] text-xs text-[#B42332] font-semibold tabular-nums">
              {stats.unassignedTicketsCount} non attribué{stats.unassignedTicketsCount > 1 ? 's' : ''}
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="font-['DM_Serif_Display'] text-3xl text-[#A86412] tabular-nums">
              {stats.pendingTickets}
            </span>
            <span className="text-xs text-[#66736F] tabular-nums text-right">
              {stats.waitingTickets} en attente · {stats.reopenedTickets} rouvert{stats.reopenedTickets > 1 ? 's' : ''}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('signalements')}
          className="bg-[#FFFFFF] border border-[#E5E0D8] hover:border-[#173B3F] rounded-lg p-5 text-left transition-colors flex flex-col justify-between"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-[#66736F]">
              Signalements en cours
            </span>
            <span className="font-['JetBrains_Mono'] text-xs text-[#173B3F] font-semibold tabular-nums">
              Total : {stats.totalTickets}
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-['DM_Serif_Display'] text-3xl text-[#202824] tabular-nums">
              {stats.inProgressTickets}
            </span>
            <span className="text-xs text-[#66736F]">
              Traitement engagé
            </span>
          </div>
        </button>
      </div>

      {/* Bandeau synthèse secondaire : Répartition complète des 13 signalements + Alertes d'attribution */}
      <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px]">
        <div className="flex flex-wrap items-center gap-3.5 text-[#66736F]">
          <span>
            Total signalements :{' '}
            <strong className="text-[#202824] font-semibold tabular-nums">
              {stats.totalTickets}
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            En attente :{' '}
            <strong className="text-[#A86412] font-semibold tabular-nums">
              {stats.waitingTickets}
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Rouverts :{' '}
            <strong className="text-[#B42332] font-semibold tabular-nums">
              {stats.reopenedTickets}
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            En cours :{' '}
            <strong className="text-[#173B3F] font-semibold tabular-nums">
              {stats.inProgressTickets}
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Résolus :{' '}
            <strong className="text-[#287A55] font-semibold tabular-nums">
              {stats.resolvedTickets}
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Clôturés :{' '}
            <strong className="text-[#202824] font-semibold tabular-nums">
              {stats.closedTickets}
            </strong>
          </span>
          {unassignedCategories.length > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-[#B42332] font-medium">
                {unassignedCategories.length} catégorie sans responsable principal ({unassignedCategories[0].name})
              </span>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => onNavigate('reports')}
          className="text-[#173B3F] font-semibold hover:underline text-left sm:text-right whitespace-nowrap text-xs"
        >
          Consulter les rapports détaillés →
        </button>
      </div>

      {/* Deux sections principales : Signalements nécessitant une attention administrative (7 cols) & Activité récente (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Section 2 : Signalements nécessitant une attention administrative */}
        <section className="lg:col-span-7 bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E0D8] flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#202824]">
                Signalements nécessitant une attention administrative
              </h2>
              <p className="text-xs text-[#66736F] mt-0.5">
                Dossiers non attribués, en attente de prise en charge ou à priorité critique.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('signalements')}
              className="text-xs font-semibold text-[#173B3F] hover:underline whitespace-nowrap"
            >
              Voir tous les signalements ({stats.totalTickets})
            </button>
          </div>

          <div className="divide-y divide-[#E5E0D8]">
            {attentionTickets.map((ticket) => {
              const isUnassigned = !ticket.assignedTo || ticket.assignedTo.trim() === '';
              const isRestricted = isTicketConfidentialRestricted(ticket, categories);
              const prio = PRIORITY_LABELS[ticket.priority] || {
                label: ticket.priority,
                color: 'text-[#66736F]',
              };

              return (
                <div
                  key={ticket.id}
                  className="px-5 py-3.5 hover:bg-[#F7F5F0]/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#66736F]">
                      <span className="font-['JetBrains_Mono'] font-semibold text-[#173B3F]">
                        {ticket.reference}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{ticket.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className={prio.color}>Priorité {prio.label}</span>
                      <span aria-hidden="true">·</span>
                      <span>{STATUS_LABELS[ticket.status] || ticket.status}</span>
                    </div>

                    <p className="text-[13px] font-semibold text-[#202824] mt-1 truncate">
                      {isRestricted
                        ? 'Dossier confidentiel — Contenu protégé (accès réservé aux responsables habilités)'
                        : ticket.title}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#66736F] mt-1">
                      <span>{ticket.targetDepartment}</span>
                      <span aria-hidden="true">·</span>
                      {isUnassigned ? (
                        <span className="text-[#B42332] font-semibold">
                          Aucun responsable attribué
                        </span>
                      ) : (
                        <span>Responsable : {ticket.assignedTo}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onReassignTicket(ticket)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors whitespace-nowrap ${
                        isUnassigned
                          ? 'bg-[#173B3F] text-white hover:bg-[#102B2E]'
                          : 'bg-[#F7F5F0] text-[#202824] hover:bg-[#E5E0D8] border border-[#E5E0D8]'
                      }`}
                    >
                      {isUnassigned ? 'Attribuer un responsable' : 'Réattribuer'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 1 : Activité récente */}
        <section className="lg:col-span-5 bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E0D8]">
            <h2 className="text-base font-bold text-[#202824]">
              Activité récente
            </h2>
            <p className="text-xs text-[#66736F] mt-0.5">
              Derniers événements de gestion enregistrés sur la plateforme.
            </p>
          </div>

          <div className="divide-y divide-[#E5E0D8]">
            {events.slice(0, 6).map((ev) => (
              <div key={ev.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between text-xs text-[#66736F]">
                  <span className="font-['JetBrains_Mono'] tabular-nums">
                    {ev.date}
                  </span>
                  <span>{ev.actor}</span>
                </div>
                <p className="text-[13px] font-bold text-[#202824] mt-1">
                  {ev.title}
                </p>
                <p className="text-xs text-[#66736F] mt-0.5 leading-relaxed">
                  {ev.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
