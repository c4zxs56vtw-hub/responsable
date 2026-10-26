import React, { useState, useMemo } from 'react';
import {
  CategoryAttribution,
  DepartmentRecord,
  ResponsableAccount,
} from '../../types/admin';
import { Ticket, TicketPriority } from '../../types/ticket';
import { isTicketConfidentialRestricted } from '../../utils/admin-logic';

interface AdminSignalementsViewProps {
  tickets: Ticket[];
  categories: CategoryAttribution[];
  departments: DepartmentRecord[];
  responsables: ResponsableAccount[];
  onReassignTicket: (
    ticket: Ticket,
    newResponsable: ResponsableAccount,
    newPriority?: TicketPriority
  ) => void;
  initialReassignTicket?: Ticket | null;
  onConsumeInitialReassign?: () => void;
}

const PRIORITY_META: Record<string, { label: string; textClass: string }> = {
  CRITIQUE: { label: 'Critique', textClass: 'text-[#B42332] font-bold' },
  ELEVEE: { label: 'Élevée', textClass: 'text-[#A86412] font-semibold' },
  MOYENNE: { label: 'Moyenne', textClass: 'text-[#173B3F] font-medium' },
  BASSE: { label: 'Faible', textClass: 'text-[#66736F]' },
};

const STATUS_META: Record<string, { label: string; textClass: string }> = {
  EN_ATTENTE: { label: 'En attente', textClass: 'text-[#A86412] font-semibold' },
  ROUVERT: { label: 'Rouvert', textClass: 'text-[#B42332] font-semibold' },
  DIAGNOSTIC_EN_COURS: { label: 'En cours', textClass: 'text-[#173B3F] font-semibold' },
  ATTENTE_VALIDATION: { label: 'En cours (validation)', textClass: 'text-[#173B3F] font-semibold' },
  RESOLU: { label: 'Résolu', textClass: 'text-[#287A55] font-semibold' },
  CLOTURE: { label: 'Clôturé', textClass: 'text-[#66736F] font-medium' },
};

export const AdminSignalementsView: React.FC<AdminSignalementsViewProps> = ({
  tickets,
  categories,
  departments,
  responsables,
  onReassignTicket,
  initialReassignTicket,
  onConsumeInitialReassign,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [managerFilter, setManagerFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [onlyUnassigned, setOnlyUnassigned] = useState(false);

  const [reassigningTicket, setReassigningTicket] = useState<Ticket | null>(
    initialReassignTicket || null
  );
  const [selectedManagerId, setSelectedManagerId] = useState<string>(
    responsables.find((r) => r.roleActive && r.status !== 'DESACTIVE')?.id || ''
  );
  const [selectedPriority, setSelectedPriority] = useState<TicketPriority>('MOYENNE');
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  const activeResponsables = responsables.filter(
    (r) => r.roleActive && r.status !== 'DESACTIVE'
  );

  React.useEffect(() => {
    if (initialReassignTicket) {
      setReassigningTicket(initialReassignTicket);
      setSelectedPriority(initialReassignTicket.priority);
      if (onConsumeInitialReassign) onConsumeInitialReassign();
    }
  }, [initialReassignTicket, onConsumeInitialReassign]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (onlyUnassigned && t.assignedTo && t.assignedTo.trim() !== '') {
        return false;
      }
      if (categoryFilter !== 'ALL' && t.category !== categoryFilter) {
        return false;
      }
      if (departmentFilter !== 'ALL' && t.targetDepartment !== departmentFilter) {
        return false;
      }
      if (managerFilter !== 'ALL') {
        if (managerFilter === 'UNASSIGNED') {
          if (t.assignedTo && t.assignedTo.trim() !== '') return false;
        } else if (!t.assignedTo?.toLowerCase().includes(managerFilter.toLowerCase())) {
          return false;
        }
      }
      if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) {
        return false;
      }
      if (statusFilter !== 'ALL' && t.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.trim().toLowerCase();
        const match =
          t.reference.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.targetDepartment.toLowerCase().includes(q) ||
          (t.assignedTo && t.assignedTo.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [
    tickets,
    onlyUnassigned,
    categoryFilter,
    departmentFilter,
    managerFilter,
    priorityFilter,
    statusFilter,
    searchQuery,
  ]);

  const unassignedCount = tickets.filter(
    (t) =>
      (!t.assignedTo || t.assignedTo.trim() === '') &&
      t.status !== 'RESOLU' &&
      t.status !== 'CLOTURE'
  ).length;

  const formatShortDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return iso;
    }
  };

  const handleConfirmReassign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassigningTicket) return;
    const mgr = activeResponsables.find((r) => r.id === selectedManagerId);
    if (!mgr) return;

    onReassignTicket(reassigningTicket, mgr, selectedPriority);
    setFeedbackBanner(
      `Le signalement ${reassigningTicket.reference} a été attribué à ${mgr.fullName} (${mgr.departmentName}). L'événement a été consigné dans l'historique.`
    );
    setReassigningTicket(null);
  };

  return (
    <div className="flex flex-col gap-5 font-['DM_Sans']">
      {/* En-tête */}
      <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['DM_Serif_Display'] text-2xl lg:text-3xl text-[#202824]">
            Suivi des signalements
          </h1>
          <p className="text-sm text-[#66736F] mt-1">
            Supervisez le traitement des préoccupations au sein de l’entreprise et réattribuez les dossiers si nécessaire.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOnlyUnassigned(!onlyUnassigned)}
          className={`px-4 py-2 rounded text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
            onlyUnassigned
              ? 'bg-[#173B3F] text-white border-[#173B3F]'
              : 'bg-[#FFF8EB] text-[#A86412] border-[#A86412]/40 hover:bg-[#F7F5F0]'
          }`}
        >
          {onlyUnassigned
            ? `Afficher tous les signalements (${tickets.length})`
            : `Signalements non attribués (${unassignedCount})`}
        </button>
      </div>

      {feedbackBanner && (
        <div className="bg-[#EDF6EF] border border-[#287A55]/30 rounded-lg px-4 py-3 flex items-center justify-between gap-3 text-[13px] text-[#202824]">
          <span>{feedbackBanner}</span>
          <button
            type="button"
            onClick={() => setFeedbackBanner(null)}
            className="text-[#66736F] hover:text-[#202824] font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Filtres multicritères : Référence, Catégorie, Département, Responsable, Priorité, Statut */}
      <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-[13px]">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Référence (#EC-...), mot-clé..."
          aria-label="Rechercher par référence"
          className="px-3 py-2 rounded border border-[#E5E0D8] bg-[#F7F5F0]/50 text-[#202824] focus:outline-none focus:border-[#173B3F]"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filtrer par catégorie"
          className="px-3 py-2 rounded border border-[#E5E0D8] bg-white text-[#202824]"
        >
          <option value="ALL">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          aria-label="Filtrer par département"
          className="px-3 py-2 rounded border border-[#E5E0D8] bg-white text-[#202824]"
        >
          <option value="ALL">Tous les départements</option>
          {departments.map((d) => (
            <option key={d.id} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={managerFilter}
          onChange={(e) => setManagerFilter(e.target.value)}
          aria-label="Filtrer par responsable"
          className="px-3 py-2 rounded border border-[#E5E0D8] bg-white text-[#202824]"
        >
          <option value="ALL">Tous les responsables</option>
          <option value="UNASSIGNED">Non attribués uniquement</option>
          {activeResponsables.map((r) => (
            <option key={r.id} value={r.fullName}>
              {r.fullName}
            </option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          aria-label="Filtrer par priorité"
          className="px-3 py-2 rounded border border-[#E5E0D8] bg-white text-[#202824]"
        >
          <option value="ALL">Toutes les priorités</option>
          <option value="CRITIQUE">Priorité Critique</option>
          <option value="ELEVEE">Priorité Élevée</option>
          <option value="MOYENNE">Priorité Moyenne</option>
          <option value="BASSE">Priorité Faible</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filtrer par statut"
          className="px-3 py-2 rounded border border-[#E5E0D8] bg-white text-[#202824]"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="ROUVERT">Rouvert</option>
          <option value="DIAGNOSTIC_EN_COURS">En cours</option>
          <option value="ATTENTE_VALIDATION">Validation requise</option>
          <option value="RESOLU">Résolu</option>
          <option value="CLOTURE">Clôturé</option>
        </select>
      </div>

      {/* Tableau de supervision */}
      <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E0D8] bg-[#F7F5F0] text-xs font-bold text-[#66736F] uppercase tracking-wider">
                <th className="py-3.5 px-4">Référence</th>
                <th className="py-3.5 px-4">Catégorie</th>
                <th className="py-3.5 px-4">Département concerné</th>
                <th className="py-3.5 px-4">Responsable attribué</th>
                <th className="py-3.5 px-4">Priorité</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4">Date de création</th>
                <th className="py-3.5 px-4">Dernière mise à jour</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8] text-[13px]">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#66736F]">
                    Aucun signalement ne correspond aux filtres sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => {
                  const isUnassigned = !ticket.assignedTo || ticket.assignedTo.trim() === '';
                  const isRestricted = isTicketConfidentialRestricted(ticket, categories);
                  const prio = PRIORITY_META[ticket.priority] || {
                    label: ticket.priority,
                    textClass: 'text-[#66736F]',
                  };
                  const st = STATUS_META[ticket.status] || {
                    label: ticket.status,
                    textClass: 'text-[#66736F]',
                  };

                  return (
                    <tr
                      key={ticket.id}
                      className="hover:bg-[#F7F5F0]/60 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-['JetBrains_Mono'] text-xs font-semibold text-[#173B3F] whitespace-nowrap">
                        {ticket.reference}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#202824] whitespace-nowrap">
                        <div>{ticket.category}</div>
                        {isRestricted && (
                          <div className="text-xs text-[#66736F] font-normal">
                            Contenu & identité protégés
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#202824]">
                        {ticket.targetDepartment}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isUnassigned ? (
                          <span className="text-[#B42332] font-semibold">
                            Non attribué
                          </span>
                        ) : (
                          <span className="text-[#202824] font-medium">
                            {ticket.assignedTo}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={prio.textClass}>{prio.label}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={st.textClass}>{st.label}</span>
                      </td>
                      <td className="py-3.5 px-4 font-['JetBrains_Mono'] text-xs text-[#66736F] tabular-nums whitespace-nowrap">
                        {formatShortDate(ticket.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 font-['JetBrains_Mono'] text-xs text-[#66736F] tabular-nums whitespace-nowrap">
                        {formatShortDate(ticket.updatedAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setViewingTicket(ticket)}
                            className="text-[#173B3F] hover:underline font-medium"
                          >
                            Superviser
                          </button>
                          <span className="text-[#E5E0D8]">|</span>
                          <button
                            type="button"
                            onClick={() => {
                              setReassigningTicket(ticket);
                              setSelectedPriority(ticket.priority);
                            }}
                            className="text-[#202824] hover:underline font-semibold"
                          >
                            Réattribuer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALE : RÉATTRIBUER UN SIGNALEMENT */}
      {reassigningTicket && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg max-w-md w-full p-6 shadow-xl text-xs"
          >
            {(() => {
              const isRestricted = isTicketConfidentialRestricted(
                reassigningTicket,
                categories
              );
              const candidateManagers = isRestricted
                ? activeResponsables.filter((r) => r.isConfidentialHab)
                : activeResponsables;
              const managersToShow =
                candidateManagers.length > 0 ? candidateManagers : activeResponsables;

              return (
                <>
                  <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
                    <div>
                      <span className="font-['JetBrains_Mono'] text-[11px] font-semibold text-[#173B3F]">
                        {reassigningTicket.reference}
                      </span>
                      <h2 className="font-['DM_Serif_Display'] text-xl text-[#202824]">
                        Attribuer ou réattribuer le signalement
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReassigningTicket(null)}
                      className="text-[#66736F] hover:text-[#202824]"
                    >
                      ×
                    </button>
                  </div>

                  <form onSubmit={handleConfirmReassign} className="mt-4 flex flex-col gap-3.5">
                    <div className="p-3 rounded bg-[#F7F5F0] border border-[#E5E0D8]">
                      <span className="text-[#66736F] block">Catégorie :</span>
                      <span className="font-semibold text-[#202824]">
                        {reassigningTicket.category}
                      </span>
                      {isRestricted && (
                        <span className="text-[11px] text-[#173B3F] block mt-1">
                          Dossier confidentiel : seuls les responsables habilités sont proposés en priorité.
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block font-semibold text-[#202824] mb-1">
                        Responsable destinataire *
                      </label>
                      <select
                        value={selectedManagerId}
                        onChange={(e) => setSelectedManagerId(e.target.value)}
                        className="w-full px-3 py-2 rounded border border-[#E5E0D8] bg-white"
                      >
                        {managersToShow.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.fullName} — {r.departmentName}
                            {r.isConfidentialHab ? ' (Habilité confidentiel)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#202824] mb-1">
                        Niveau de priorité
                      </label>
                      <select
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value as TicketPriority)}
                        className="w-full px-3 py-2 rounded border border-[#E5E0D8] bg-white"
                      >
                        <option value="BASSE">Faible</option>
                        <option value="MOYENNE">Moyenne</option>
                        <option value="ELEVEE">Élevée</option>
                        <option value="CRITIQUE">Critique</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E0D8]">
                      <button
                        type="button"
                        onClick={() => setReassigningTicket(null)}
                        className="px-4 py-2 rounded border border-[#E5E0D8] text-[#202824] font-semibold"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded bg-[#173B3F] text-white font-semibold"
                      >
                        Confirmer l’attribution
                      </button>
                    </div>
                  </form>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODALE : SUPERVISION ADMINISTRATIVE (RESPECT DE LA CONFIDENTIALITÉ ET MASQUAGE DES MÉTADONNÉES IDENTIFIANTES) */}
      {viewingTicket && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg max-w-lg w-full p-6 shadow-xl text-xs"
          >
            {(() => {
              const isRestricted = isTicketConfidentialRestricted(viewingTicket, categories);
              return (
                <>
                  <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
                    <div>
                      <span className="font-['JetBrains_Mono'] text-[11px] font-semibold text-[#173B3F]">
                        {viewingTicket.reference}
                      </span>
                      <h2 className="font-['DM_Serif_Display'] text-xl text-[#202824]">
                        Fiche de supervision administrative
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setViewingTicket(null)}
                      className="text-[#66736F] hover:text-[#202824]"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-4 space-y-2.5 text-[13px]">
                    <div className="flex justify-between py-1 border-b border-[#E5E0D8]/60">
                      <span className="text-[#66736F]">Catégorie :</span>
                      <span className="font-semibold text-[#202824]">{viewingTicket.category}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#E5E0D8]/60">
                      <span className="text-[#66736F]">Département concerné :</span>
                      <span className="font-semibold text-[#202824]">
                        {viewingTicket.targetDepartment}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#E5E0D8]/60">
                      <span className="text-[#66736F]">Déclarant / Localisation :</span>
                      <span className="font-semibold text-[#202824]">
                        {isRestricted
                          ? 'Identité et bureau masqués (Protection confidentialité)'
                          : `${viewingTicket.requesterName} · ${viewingTicket.requesterLocation}`}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#E5E0D8]/60">
                      <span className="text-[#66736F]">Responsable attribué :</span>
                      <span className="font-semibold text-[#202824]">
                        {viewingTicket.assignedTo || 'Non attribué'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#E5E0D8]/60">
                      <span className="text-[#66736F]">Statut :</span>
                      <span className={STATUS_META[viewingTicket.status]?.textClass}>
                        {STATUS_META[viewingTicket.status]?.label || viewingTicket.status}
                      </span>
                    </div>

                    {isRestricted ? (
                      <div className="p-3.5 rounded bg-[#F7F5F0] border border-[#E5E0D8] text-[#202824] mt-3 text-xs">
                        <p className="font-bold text-[#173B3F]">
                          Protection des signalements sensibles et confidentiels
                        </p>
                        <p className="text-[#66736F] mt-1 leading-relaxed">
                          Conformément aux règles de gouvernance d’EmployeeCare, l’administrateur supervise l’attribution et l’avancement de ce dossier sans accéder au contenu détaillé, aux messages échangés ni aux métadonnées permettant d’identifier indirectement le déclarant.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded bg-[#F7F5F0] border border-[#E5E0D8] mt-3 text-xs">
                        <p className="font-semibold text-[#202824] text-[13px]">
                          {viewingTicket.title}
                        </p>
                        <p className="text-[#66736F] mt-1 leading-relaxed">
                          {viewingTicket.description}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#E5E0D8] flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const t = viewingTicket;
                        setViewingTicket(null);
                        setReassigningTicket(t);
                        setSelectedPriority(t.priority);
                      }}
                      className="px-4 py-2 rounded border border-[#173B3F] text-[#173B3F] font-semibold"
                    >
                      Réattribuer ce dossier
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewingTicket(null)}
                      className="px-4 py-2 rounded bg-[#173B3F] text-white font-semibold"
                    >
                      Fermer
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
