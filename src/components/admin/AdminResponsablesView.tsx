import React, { useState } from 'react';
import {
  EmployeeAccount,
  ResponsableAccount,
  DepartmentRecord,
  CategoryAttribution,
} from '../../types/admin';
import { Ticket } from '../../types/ticket';
import {
  countActiveTicketsForResponsable,
  listActiveTicketsForResponsable,
  isTicketConfidentialRestricted,
  PromoteEmployeeInput,
  CreateNewResponsableInput,
} from '../../utils/admin-logic';

interface AdminResponsablesViewProps {
  employees: EmployeeAccount[];
  responsables: ResponsableAccount[];
  departments: DepartmentRecord[];
  categories: CategoryAttribution[];
  tickets: Ticket[];
  onPromoteEmployee: (input: PromoteEmployeeInput) => { ok: boolean; error?: string };
  onCreateNewResponsable: (input: CreateNewResponsableInput) => { ok: boolean; error?: string };
  onUpdateResponsableAttributions: (updated: ResponsableAccount) => void;
  onDeactivateOrRemoveResponsable: (
    targetId: string,
    replacementId: string | undefined,
    mode: 'DEACTIVATE_ACCESS' | 'REMOVE_ROLE_KEEP_EMPLOYEE'
  ) => { ok: boolean; error?: string; reassignedCount?: number };
  onReactivateResponsable: (targetId: string) => void;
  openAddModalInitially?: boolean;
  onConsumeInitialModal?: () => void;
}

export const AdminResponsablesView: React.FC<AdminResponsablesViewProps> = ({
  employees,
  responsables,
  departments,
  categories,
  tickets,
  onPromoteEmployee,
  onCreateNewResponsable,
  onUpdateResponsableAttributions,
  onDeactivateOrRemoveResponsable,
  onReactivateResponsable,
  openAddModalInitially = false,
  onConsumeInitialModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Add Modal State (Possibilité 1 vs Possibilité 2)
  const [isAddOpen, setIsAddOpen] = useState(openAddModalInitially);
  const [addMode, setAddMode] = useState<'PROMOTE' | 'CREATE_NEW'>('PROMOTE');
  const [formError, setFormError] = useState<string | null>(null);

  // Eligible employees for Possibilité 1 (active employees not currently active responsables)
  const eligibleEmployees = employees.filter(
    (e) =>
      e.status !== 'DESACTIVE' &&
      !responsables.some((r) => r.employeeId === e.id && r.roleActive)
  );

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    eligibleEmployees[0]?.id || 'emp-001'
  );
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('Responsable de Service');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 'dept-it');
  const [selectedCats, setSelectedCats] = useState<string[]>(['Réseau et Internet']);
  const [canReceiveUncategorized, setCanReceiveUncategorized] = useState(true);
  const [isConfidentialHab, setIsConfidentialHab] = useState(false);

  // Edit Attributions Modal State
  const [editingResp, setEditingResp] = useState<ResponsableAccount | null>(null);

  // View Details Modal State
  const [viewingResp, setViewingResp] = useState<ResponsableAccount | null>(null);

  // Safe Removal vs Deactivation Modal State (Section 8)
  const [removingResp, setRemovingResp] = useState<ResponsableAccount | null>(null);
  const [removalMode, setRemovalMode] = useState<'REMOVE_ROLE_KEEP_EMPLOYEE' | 'DEACTIVATE_ACCESS'>(
    'REMOVE_ROLE_KEEP_EMPLOYEE'
  );
  const [replacementRespId, setReplacementRespId] = useState<string>('');
  const [removalError, setRemovalError] = useState<string | null>(null);

  React.useEffect(() => {
    if (openAddModalInitially) {
      setIsAddOpen(true);
      if (onConsumeInitialModal) onConsumeInitialModal();
    }
  }, [openAddModalInitially, onConsumeInitialModal]);

  const filteredResponsables = responsables.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      r.fullName.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.departmentName.toLowerCase().includes(q) ||
      r.assignedCategories.some((c) => c.toLowerCase().includes(q))
    );
  });

  const activeResponsablesCount = responsables.filter(
    (r) => r.roleActive && r.status !== 'DESACTIVE'
  ).length;

  const toggleCategoryChoice = (
    catName: string,
    currentList: string[],
    setter: (v: string[]) => void
  ) => {
    if (currentList.includes(catName)) {
      setter(currentList.filter((c) => c !== catName));
    } else {
      setter([...currentList, catName]);
    }
  };

  const handleOpenAddModal = () => {
    setFormError(null);
    const firstEligible = eligibleEmployees[0];
    if (firstEligible) {
      setSelectedEmployeeId(firstEligible.id);
      setDepartmentId(firstEligible.departmentId);
    }
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setPosition('Responsable de Service');
    setSelectedCats([categories[0]?.name || 'Réseau et Internet']);
    setIsAddOpen(true);
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (selectedCats.length === 0) {
      setFormError('Veuillez sélectionner au moins une catégorie prise en charge.');
      return;
    }

    if (addMode === 'PROMOTE') {
      const res = onPromoteEmployee({
        employeeId: selectedEmployeeId,
        departmentId,
        assignedCategories: selectedCats,
        canReceiveUncategorized,
        isConfidentialHab,
      });
      if (!res.ok) {
        setFormError(res.error || 'Impossible de promouvoir ce collaborateur.');
        return;
      }
      const emp = employees.find((item) => item.id === selectedEmployeeId);
      setIsAddOpen(false);
      setFeedbackBanner(
        `${emp?.fullName || 'Le collaborateur'} a été promu Responsable sans création de doublon. Il conserve son compte Employé et le compteur des responsables a été actualisé.`
      );
    } else {
      const res = onCreateNewResponsable({
        firstName,
        lastName,
        email,
        phone,
        departmentId,
        position,
        assignedCategories: selectedCats,
        canReceiveUncategorized,
        isConfidentialHab,
      });
      if (!res.ok) {
        setFormError(res.error || 'Erreur lors de la création du responsable.');
        return;
      }
      setIsAddOpen(false);
      setFeedbackBanner(
        `Le compte Responsable de ${firstName.trim()} ${lastName.trim()} a été créé avec le statut « En attente d'activation » et ses catégories ont été affectées.`
      );
    }
  };

  const handleOpenRemovalModal = (
    resp: ResponsableAccount,
    initialMode: 'REMOVE_ROLE_KEEP_EMPLOYEE' | 'DEACTIVATE_ACCESS'
  ) => {
    setRemovingResp(resp);
    setRemovalMode(initialMode);
    setReplacementRespId('');
    setRemovalError(null);
  };

  const handleConfirmRemoval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!removingResp) return;
    setRemovalError(null);

    const res = onDeactivateOrRemoveResponsable(
      removingResp.id,
      replacementRespId || undefined,
      removalMode
    );

    if (!res.ok) {
      setRemovalError(res.error || 'Veuillez réattribuer les signalements en cours.');
      return;
    }

    const replacementName =
      replacementRespId === 'ADMIN_FALLBACK_UNASSIGNED'
        ? 'la file de supervision administrative'
        : responsables.find((r) => r.id === replacementRespId)?.fullName;

    const actionText =
      removalMode === 'REMOVE_ROLE_KEEP_EMPLOYEE'
        ? `Le rôle Responsable de ${removingResp.fullName} a été retiré (son compte Employé reste actif).`
        : `Le compte utilisateur de ${removingResp.fullName} a été désactivé.`;

    setFeedbackBanner(
      res.reassignedCount && res.reassignedCount > 0
        ? `${actionText} ${res.reassignedCount} signalement(s) ouvert(s) ont été réattribués à ${replacementName}. L'historique de ses interventions passées est conservé.`
        : `${actionText} Les compteurs ont été mis à jour.`
    );
    setRemovingResp(null);
  };

  return (
    <div className="flex flex-col gap-5 font-['DM_Sans']">
      {/* En-tête */}
      <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['DM_Serif_Display'] text-2xl lg:text-3xl text-[#202824]">
            Gestion des responsables
          </h1>
          <p className="text-sm text-[#66736F] mt-1">
            Promouvez des collaborateurs existants, créez de nouveaux responsables et gérez leurs périmètres de traitement.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded bg-[#173B3F] hover:bg-[#102B2E] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          + Ajouter un responsable
        </button>
      </div>

      {/* Feedback Banner */}
      {feedbackBanner && (
        <div className="bg-[#EDF6EF] border border-[#287A55]/30 rounded-lg px-4 py-3 flex items-center justify-between gap-3 text-[13px] text-[#202824]">
          <span>{feedbackBanner}</span>
          <button
            type="button"
            onClick={() => setFeedbackBanner(null)}
            className="text-[#66736F] hover:text-[#202824] font-bold"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
      )}

      {/* Recherche & Compteur de responsables actifs */}
      <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un responsable par nom, email, département ou catégorie..."
          aria-label="Rechercher un responsable"
          className="w-full sm:max-w-md px-3.5 py-2 rounded border border-[#E5E0D8] bg-[#F7F5F0]/50 text-[13px] text-[#202824] focus:outline-none focus:border-[#173B3F]"
        />
        <div className="flex items-center gap-3 text-[13px] text-[#66736F] tabular-nums">
          <span>
            Responsables actifs :{' '}
            <strong className="text-[#173B3F] font-semibold">
              {activeResponsablesCount}
            </strong>
          </span>
        </div>
      </div>

      {/* Tableau des responsables */}
      <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E0D8] bg-[#F7F5F0] text-xs font-bold text-[#66736F] uppercase tracking-wider">
                <th className="py-3.5 px-3">Nom et prénom</th>
                <th className="py-3.5 px-3">Adresse email</th>
                <th className="py-3.5 px-3">Département</th>
                <th className="py-3.5 px-3">Catégories prises en charge</th>
                <th className="py-3.5 px-3 text-right">Dossiers ouverts</th>
                <th className="py-3.5 px-3">Statut</th>
                <th className="py-3.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8] text-[13px]">
              {filteredResponsables.map((resp) => {
                const activeTicketsCount = countActiveTicketsForResponsable(
                  tickets,
                  resp.fullName
                );
                return (
                  <tr
                    key={resp.id}
                    className="hover:bg-[#F7F5F0]/60 transition-colors"
                  >
                    <td className="py-3.5 px-3 font-semibold text-[#202824] whitespace-nowrap">
                      <div>{resp.fullName}</div>
                      {resp.isConfidentialHab && (
                        <div className="text-xs text-[#173B3F] font-normal">
                          Habilité dossiers sensibles
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-[#66736F] whitespace-nowrap">
                      {resp.email}
                    </td>
                    <td className="py-3.5 px-3 text-[#202824]">
                      {resp.departmentName}
                    </td>
                    <td className="py-3.5 px-3 text-[#66736F] max-w-[210px]">
                      {resp.assignedCategories.length > 0
                        ? resp.assignedCategories.join(' · ')
                        : 'Aucune catégorie assignée'}
                    </td>
                    <td className="py-3.5 px-3 text-right font-['JetBrains_Mono'] tabular-nums font-semibold text-[#202824]">
                      {activeTicketsCount}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {resp.status === 'DESACTIVE' ? (
                        <span className="text-[#B42332] font-semibold">
                          Compte désactivé
                        </span>
                      ) : !resp.roleActive ? (
                        <span className="text-[#A86412] font-semibold">
                          Rôle retiré (Employé actif)
                        </span>
                      ) : resp.status === 'EN_ATTENTE_ACTIVATION' ? (
                        <span className="text-[#A86412] font-semibold">
                          En attente d’activation
                        </span>
                      ) : (
                        <span className="text-[#287A55] font-semibold">
                          Actif
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingResp(resp)}
                          className="text-[#173B3F] hover:underline font-medium"
                        >
                          Consulter
                        </button>
                        <span className="text-[#E5E0D8]">|</span>
                        <button
                          type="button"
                          onClick={() => setEditingResp(resp)}
                          className="text-[#202824] hover:underline font-medium"
                        >
                          Attributions
                        </button>
                        <span className="text-[#E5E0D8]">|</span>
                        {resp.roleActive ? (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenRemovalModal(resp, 'REMOVE_ROLE_KEEP_EMPLOYEE')
                              }
                              className="text-[#A86412] hover:underline font-semibold"
                              title="Retirer uniquement le rôle Responsable (conserve le compte Employé)"
                            >
                              Retirer le rôle
                            </button>
                            <span className="text-[#E5E0D8]">|</span>
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenRemovalModal(resp, 'DEACTIVATE_ACCESS')
                              }
                              className="text-[#B42332] hover:underline font-semibold"
                              title="Désactiver complètement le compte utilisateur"
                            >
                              Désactiver
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              onReactivateResponsable(resp.id);
                              setFeedbackBanner(
                                `L'accès Responsable de ${resp.fullName} a été réactivé.`
                              );
                            }}
                            className="text-[#287A55] hover:underline font-semibold"
                          >
                            Réactiver le rôle
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALE : AJOUTER UN RESPONSABLE (POSSIBILITÉ 1 & POSSIBILITÉ 2) */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-add-resp-title"
            className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg max-w-xl w-full p-6 shadow-xl text-xs my-8"
          >
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
              <h2
                id="modal-add-resp-title"
                className="font-['DM_Serif_Display'] text-xl text-[#202824]"
              >
                Ajouter un responsable
              </h2>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-[#66736F] hover:text-[#202824]"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            {/* Sélecteur Possibilité 1 / Possibilité 2 */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 bg-[#F7F5F0] rounded border border-[#E5E0D8]">
              <button
                type="button"
                onClick={() => {
                  setAddMode('PROMOTE');
                  setFormError(null);
                }}
                className={`py-2 px-3 rounded text-xs font-semibold transition-colors ${
                  addMode === 'PROMOTE'
                    ? 'bg-[#173B3F] text-white'
                    : 'text-[#66736F] hover:text-[#202824]'
                }`}
              >
                Possibilité 1 — Promouvoir un employé existant
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddMode('CREATE_NEW');
                  setFormError(null);
                }}
                className={`py-2 px-3 rounded text-xs font-semibold transition-colors ${
                  addMode === 'CREATE_NEW'
                    ? 'bg-[#173B3F] text-white'
                    : 'text-[#66736F] hover:text-[#202824]'
                }`}
              >
                Possibilité 2 — Créer un nouveau responsable
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="mt-4 flex flex-col gap-3.5">
              {formError && (
                <div className="p-3 rounded bg-[#FDECEC] border border-[#B42332]/30 text-[#B42332] font-medium">
                  {formError}
                </div>
              )}

              {addMode === 'PROMOTE' ? (
                <div className="space-y-3">
                  <div className="p-3 rounded bg-[#F7F5F0] border border-[#E5E0D8] text-[#66736F]">
                    L’employé sélectionné conservera son compte unique existant et obtiendra le rôle Responsable en plus de son espace Employé.
                  </div>
                  <div>
                    <label className="block font-semibold text-[#202824] mb-1">
                      Sélectionner un employé existant *
                    </label>
                    <select
                      value={selectedEmployeeId}
                      onChange={(e) => {
                        setSelectedEmployeeId(e.target.value);
                        const found = employees.find((emp) => emp.id === e.target.value);
                        if (found) setDepartmentId(found.departmentId);
                      }}
                      className="w-full px-3 py-2 rounded border border-[#E5E0D8] bg-white text-[#202824]"
                    >
                      {eligibleEmployees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.fullName} ({emp.matricule} — {emp.departmentName})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#202824] mb-1">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Ex. Nadia"
                        className="w-full px-3 py-2 rounded border border-[#E5E0D8]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#202824] mb-1">
                        Nom *
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Ex. Khelifi"
                        className="w-full px-3 py-2 rounded border border-[#E5E0D8]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#202824] mb-1">
                        Email professionnel *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nadia.khelifi@entreprise.com"
                        className="w-full px-3 py-2 rounded border border-[#E5E0D8]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#202824] mb-1">
                        Fonction *
                      </label>
                      <input
                        type="text"
                        required
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        placeholder="Responsable de Service"
                        className="w-full px-3 py-2 rounded border border-[#E5E0D8]"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#202824] mb-1">
                  Département attribué *
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-[#E5E0D8] bg-white text-[#202824]"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#202824] mb-1.5">
                  Catégories de signalements prises en charge *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded border border-[#E5E0D8] bg-[#F7F5F0]/50 max-h-40 overflow-y-auto">
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2 text-xs text-[#202824] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCats.includes(cat.name)}
                        onChange={() =>
                          toggleCategoryChoice(cat.name, selectedCats, setSelectedCats)
                        }
                        className="accent-[#173B3F]"
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="block font-semibold text-[#202824]">
                  Périmètre de responsabilité :
                </label>
                <label className="flex items-center gap-2 text-xs text-[#202824] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canReceiveUncategorized}
                    onChange={(e) => setCanReceiveUncategorized(e.target.checked)}
                    className="accent-[#173B3F]"
                  />
                  <span>
                    Autoriser la réception des signalements non classés de ce département
                  </span>
                </label>

                <label className="flex items-center gap-2 text-xs text-[#202824] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isConfidentialHab}
                    onChange={(e) => setIsConfidentialHab(e.target.checked)}
                    className="accent-[#173B3F]"
                  />
                  <span>
                    Habilitation restreinte : traitement des signalements sensibles ou confidentiels
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E0D8]">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded border border-[#E5E0D8] text-[#202824] font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#173B3F] hover:bg-[#102B2E] text-white font-semibold"
                >
                  {addMode === 'PROMOTE'
                    ? 'Promouvoir comme Responsable'
                    : 'Créer le compte Responsable'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE : RETRAIT DU RÔLE OU DÉSACTIVATION DU COMPTE RESPONSABLE (SECTION 8) */}
      {removingResp && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-remove-resp-title"
            className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg max-w-xl w-full p-6 shadow-xl text-xs my-8"
          >
            {(() => {
              const openTickets = listActiveTicketsForResponsable(
                tickets,
                removingResp.fullName
              );
              const activeTicketsCount = openTickets.length;
              const otherActiveResponsables = responsables.filter(
                (r) => r.id !== removingResp.id && r.roleActive && r.status !== 'DESACTIVE'
              );
              const actionPhrase =
                removalMode === 'REMOVE_ROLE_KEEP_EMPLOYEE'
                  ? 'retirer ses responsabilités'
                  : 'désactiver son compte';

              return (
                <>
                  <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
                    <h2
                      id="modal-remove-resp-title"
                      className="font-['DM_Serif_Display'] text-xl text-[#202824]"
                    >
                      {removalMode === 'REMOVE_ROLE_KEEP_EMPLOYEE'
                        ? `Retirer le rôle Responsable — ${removingResp.fullName}`
                        : `Désactiver le compte utilisateur — ${removingResp.fullName}`}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setRemovingResp(null)}
                      className="text-[#66736F] hover:text-[#202824]"
                      aria-label="Fermer"
                    >
                      ×
                    </button>
                  </div>

                  <form onSubmit={handleConfirmRemoval} className="mt-4 flex flex-col gap-4">
                    {/* Avertissement + Liste des dossiers ouverts si activeTicketsCount > 0 */}
                    {activeTicketsCount > 0 && (
                      <div className="p-4 rounded bg-[#FFF8EB] border border-[#A86412]/40 text-[#202824] space-y-2.5">
                        <p className="font-bold text-[#A86412] text-[13px]">
                          Continuité de traitement obligatoire
                        </p>
                        <p className="text-[13px] leading-relaxed font-medium">
                          « {removingResp.fullName} possède actuellement {activeTicketsCount}{' '}
                          signalement{activeTicketsCount > 1 ? 's' : ''} ouvert
                          {activeTicketsCount > 1 ? 's' : ''}. Veuillez les réattribuer avant de{' '}
                          {actionPhrase}. »
                        </p>

                        {/* Liste des dossiers concernés */}
                        <div className="mt-2 bg-white border border-[#E5E0D8] rounded divide-y divide-[#E5E0D8] max-h-40 overflow-y-auto">
                          {openTickets.map((t) => {
                            const restricted = isTicketConfidentialRestricted(t, categories);
                            return (
                              <div
                                key={t.id}
                                className="px-3 py-2 flex items-center justify-between gap-2 text-xs"
                              >
                                <div className="min-w-0">
                                  <span className="font-['JetBrains_Mono'] font-semibold text-[#173B3F] mr-2">
                                    {t.reference}
                                  </span>
                                  <span className="font-medium text-[#202824]">
                                    {restricted
                                      ? 'Signalement confidentiel protégé'
                                      : t.title}
                                  </span>
                                </div>
                                <span className="text-[11px] text-[#66736F] shrink-0">
                                  {t.category}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {removalError && (
                      <div className="p-3 rounded bg-[#FDECEC] border border-[#B42332]/30 text-[#B42332] font-medium">
                        {removalError}
                      </div>
                    )}

                    {/* Choix explicite entre Action 1 (Retirer le rôle) et Action 2 (Désactiver le compte) */}
                    <div className="space-y-2">
                      <label className="block font-semibold text-[#202824]">
                        Opération souhaitée :
                      </label>
                      <label className="flex items-start gap-2.5 p-2.5 rounded border border-[#E5E0D8] cursor-pointer hover:bg-[#F7F5F0]">
                        <input
                          type="radio"
                          name="removalMode"
                          checked={removalMode === 'REMOVE_ROLE_KEEP_EMPLOYEE'}
                          onChange={() => setRemovalMode('REMOVE_ROLE_KEEP_EMPLOYEE')}
                          className="mt-0.5 accent-[#173B3F]"
                        />
                        <div>
                          <span className="font-semibold text-[#202824] block">
                            Action 1 — Retirer le rôle Responsable
                          </span>
                          <span className="text-[#66736F] text-xs">
                            Retire uniquement les permissions de traitement. L’utilisateur conserve son compte Employé actif et ne peut plus accéder à l’espace Responsable.
                          </span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 p-2.5 rounded border border-[#E5E0D8] cursor-pointer hover:bg-[#F7F5F0]">
                        <input
                          type="radio"
                          name="removalMode"
                          checked={removalMode === 'DEACTIVATE_ACCESS'}
                          onChange={() => setRemovalMode('DEACTIVATE_ACCESS')}
                          className="mt-0.5 accent-[#173B3F]"
                        />
                        <div>
                          <span className="font-semibold text-[#202824] block">
                            Action 2 — Désactiver le compte utilisateur
                          </span>
                          <span className="text-[#66736F] text-xs">
                            Empêche l’utilisateur de se connecter (départ de l’entreprise ou suspension du compte).
                          </span>
                        </div>
                      </label>
                    </div>

                    {/* Sélection du responsable remplaçant habilité */}
                    <div>
                      <label className="block font-semibold text-[#202824] mb-1">
                        Sélectionner un autre responsable habilité {activeTicketsCount > 0 ? '*' : '(optionnel)'} :
                      </label>
                      <select
                        value={replacementRespId}
                        onChange={(e) => setReplacementRespId(e.target.value)}
                        aria-label="Sélectionner un responsable remplaçant"
                        className="w-full px-3 py-2 rounded border border-[#E5E0D8] bg-white text-[#202824]"
                      >
                        <option value="">
                          -- Sélectionner un responsable destinataire --
                        </option>
                        {otherActiveResponsables.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.fullName} ({r.departmentName}
                            {r.isConfidentialHab ? ' · Habilité confidentiel' : ''})
                          </option>
                        ))}
                        {otherActiveResponsables.length === 0 && (
                          <option value="ADMIN_FALLBACK_UNASSIGNED">
                            Procédure administrative : Placer en file d’attente sous supervision directe
                          </option>
                        )}
                      </select>
                    </div>

                    <div className="p-3 rounded bg-[#F7F5F0] border border-[#E5E0D8] text-xs text-[#66736F]">
                      L’historique des actions passées réalisées par {removingResp.fullName} restera intégralement conservé sur les dossiers traités.
                    </div>

                    <div className="flex justify-end gap-2.5 pt-2 border-t border-[#E5E0D8]">
                      <button
                        type="button"
                        onClick={() => setRemovingResp(null)}
                        className="px-4 py-2 rounded border border-[#E5E0D8] text-[#202824] font-semibold"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded bg-[#B42332] hover:bg-[#93000A] text-white font-semibold"
                      >
                        {removalMode === 'REMOVE_ROLE_KEEP_EMPLOYEE'
                          ? 'Valider le retrait du rôle'
                          : 'Valider la désactivation du compte'}
                      </button>
                    </div>
                  </form>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODALE : MODIFIER LES ATTRIBUTIONS */}
      {editingResp && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg max-w-md w-full p-6 shadow-xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
              <h2 className="font-['DM_Serif_Display'] text-xl text-[#202824]">
                Modifier les attributions — {editingResp.fullName}
              </h2>
              <button
                type="button"
                onClick={() => setEditingResp(null)}
                className="text-[#66736F] hover:text-[#202824]"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const dept = departments.find((d) => d.id === editingResp.departmentId);
                onUpdateResponsableAttributions({
                  ...editingResp,
                  departmentName: dept ? dept.name : editingResp.departmentName,
                });
                setFeedbackBanner(
                  `Les attributions de ${editingResp.fullName} ont été enregistrées et synchronisées.`
                );
                setEditingResp(null);
              }}
              className="mt-4 flex flex-col gap-3.5"
            >
              <div>
                <label className="block font-semibold text-[#202824] mb-1">
                  Département de rattachement
                </label>
                <select
                  value={editingResp.departmentId}
                  onChange={(e) =>
                    setEditingResp({ ...editingResp, departmentId: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded border border-[#E5E0D8] bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#202824] mb-1.5">
                  Catégories prises en charge
                </label>
                <div className="space-y-1.5 p-3 rounded border border-[#E5E0D8] bg-[#F7F5F0]/50 max-h-44 overflow-y-auto">
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2 text-xs text-[#202824] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={editingResp.assignedCategories.includes(cat.name)}
                        onChange={() => {
                          const exists = editingResp.assignedCategories.includes(cat.name);
                          setEditingResp({
                            ...editingResp,
                            assignedCategories: exists
                              ? editingResp.assignedCategories.filter((c) => c !== cat.name)
                              : [...editingResp.assignedCategories, cat.name],
                          });
                        }}
                        className="accent-[#173B3F]"
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-[#202824] cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingResp.isConfidentialHab}
                  onChange={(e) =>
                    setEditingResp({
                      ...editingResp,
                      isConfidentialHab: e.target.checked,
                    })
                  }
                  className="accent-[#173B3F]"
                />
                <span>Habilité aux dossiers sensibles / confidentiels</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E0D8]">
                <button
                  type="button"
                  onClick={() => setEditingResp(null)}
                  className="px-4 py-2 rounded border border-[#E5E0D8] text-[#202824] font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#173B3F] text-white font-semibold"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE : CONSULTER LE RESPONSABLE */}
      {viewingResp && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg max-w-md w-full p-6 shadow-xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
              <h2 className="font-['DM_Serif_Display'] text-xl text-[#202824]">
                {viewingResp.fullName}
              </h2>
              <button
                type="button"
                onClick={() => setViewingResp(null)}
                className="text-[#66736F] hover:text-[#202824]"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-2.5 text-[13px]">
              <div className="flex justify-between py-1 border-b border-[#E5E0D8]/60">
                <span className="text-[#66736F]">Département :</span>
                <span className="font-semibold text-[#202824]">{viewingResp.departmentName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E5E0D8]/60">
                <span className="text-[#66736F]">Email :</span>
                <span className="font-semibold text-[#202824]">{viewingResp.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E5E0D8]/60">
                <span className="text-[#66736F]">Dossiers ouverts :</span>
                <span className="font-['JetBrains_Mono'] font-semibold text-[#173B3F]">
                  {countActiveTicketsForResponsable(tickets, viewingResp.fullName)}
                </span>
              </div>
              <div className="py-1">
                <span className="text-[#66736F] block mb-1">Catégories attribuées :</span>
                <span className="font-semibold text-[#202824]">
                  {viewingResp.assignedCategories.join(' · ') || 'Aucune'}
                </span>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-[#E5E0D8] flex justify-end">
              <button
                type="button"
                onClick={() => setViewingResp(null)}
                className="px-4 py-2 rounded bg-[#173B3F] text-white font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
