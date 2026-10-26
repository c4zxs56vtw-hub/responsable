import React, { useState, useMemo } from 'react';
import {
  EmployeeAccount,
  DepartmentRecord,
  AccountStatus,
} from '../../types/admin';
import { AddEmployeeInput } from '../../utils/admin-logic';

interface AdminEmployeesViewProps {
  employees: EmployeeAccount[];
  departments: DepartmentRecord[];
  onAddEmployee: (input: AddEmployeeInput) => { ok: boolean; error?: string };
  onUpdateEmployee: (updated: EmployeeAccount) => { ok: boolean; error?: string };
  onUpdateStatus: (employeeId: string, status: AccountStatus) => { ok: boolean; error?: string };
  openAddModalInitially?: boolean;
  onConsumeInitialModal?: () => void;
}

const STATUS_META: Record<AccountStatus, { label: string; textClass: string }> = {
  ACTIF: { label: 'Actif', textClass: 'text-[#287A55] font-semibold' },
  EN_ATTENTE_ACTIVATION: {
    label: 'En attente d’activation',
    textClass: 'text-[#A86412] font-semibold',
  },
  DESACTIVE: { label: 'Désactivé', textClass: 'text-[#B42332] font-semibold' },
};

export const AdminEmployeesView: React.FC<AdminEmployeesViewProps> = ({
  employees,
  departments,
  onAddEmployee,
  onUpdateEmployee,
  onUpdateStatus,
  openAddModalInitially = false,
  onConsumeInitialModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(openAddModalInitially);
  const [selectedProfile, setSelectedProfile] = useState<EmployeeAccount | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeAccount | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [confirmingDeactivateEmp, setConfirmingDeactivateEmp] =
    useState<EmployeeAccount | null>(null);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Add Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 'dept-it');
  const [position, setPosition] = useState('');
  const [matricule, setMatricule] = useState('');
  const [initialStatus, setInitialStatus] = useState<AccountStatus>('EN_ATTENTE_ACTIVATION');
  const [formError, setFormError] = useState<string | null>(null);

  React.useEffect(() => {
    if (openAddModalInitially) {
      setIsAddOpen(true);
      if (onConsumeInitialModal) onConsumeInitialModal();
    }
  }, [openAddModalInitially, onConsumeInitialModal]);

  const totalCount = employees.length;
  const activeCount = employees.filter((e) => e.status === 'ACTIF').length;
  const pendingCount = employees.filter((e) => e.status === 'EN_ATTENTE_ACTIVATION').length;
  const deactivatedCount = employees.filter((e) => e.status === 'DESACTIVE').length;

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (departmentFilter !== 'ALL' && emp.departmentId !== departmentFilter) {
        return false;
      }
      if (statusFilter !== 'ALL' && emp.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.trim().toLowerCase();
        const match =
          emp.fullName.toLowerCase().includes(q) ||
          emp.matricule.toLowerCase().includes(q) ||
          emp.email.toLowerCase().includes(q) ||
          emp.departmentName.toLowerCase().includes(q) ||
          emp.position.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [employees, departmentFilter, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenAddModal = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setDepartmentId(departments[0]?.id || 'dept-it');
    setPosition('');
    setMatricule('');
    setInitialStatus('EN_ATTENTE_ACTIVATION');
    setFormError(null);
    setIsAddOpen(true);
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const result = onAddEmployee({
      firstName,
      lastName,
      email,
      phone,
      departmentId,
      position,
      matricule,
      initialStatus,
    });

    if (!result.ok) {
      setFormError(result.error || 'Erreur lors de la création du compte.');
      return;
    }

    setIsAddOpen(false);
    setFeedbackBanner(
      `Le compte de ${firstName.trim()} ${lastName.trim()} (${email.trim()}) a été enregistré avec le rôle Employé et le statut « ${STATUS_META[initialStatus].label} ».`
    );
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    setEditError(null);

    const dept = departments.find((d) => d.id === editingEmployee.departmentId);
    const res = onUpdateEmployee({
      ...editingEmployee,
      fullName: `${editingEmployee.firstName.trim()} ${editingEmployee.lastName.trim()}`,
      departmentName: dept ? dept.name : editingEmployee.departmentName,
    });

    if (!res.ok) {
      setEditError(res.error || 'Impossible de modifier ce collaborateur.');
      return;
    }

    setFeedbackBanner(
      `Les informations de ${editingEmployee.firstName.trim()} ${editingEmployee.lastName.trim()} ont été mises à jour dans l'ensemble des rubriques.`
    );
    setEditingEmployee(null);
  };

  const handleConfirmDeactivate = () => {
    if (!confirmingDeactivateEmp) return;
    setDeactivateError(null);
    const res = onUpdateStatus(confirmingDeactivateEmp.id, 'DESACTIVE');
    if (!res.ok) {
      setDeactivateError(
        res.error || 'Impossible de désactiver ce compte tant que ses dossiers ouverts ne sont pas réattribués.'
      );
      return;
    }
    setFeedbackBanner(
      `Le compte de ${confirmingDeactivateEmp.fullName} a été désactivé. L'historique de ses interventions et signalements est conservé.`
    );
    setConfirmingDeactivateEmp(null);
  };

  return (
    <div className="flex flex-col gap-5 font-['DM_Sans']">
      {/* En-tête */}
      <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['DM_Serif_Display'] text-2xl lg:text-3xl text-[#202824]">
            Gestion des employés
          </h1>
          <p className="text-sm text-[#66736F] mt-1">
            Créez et gérez les comptes des collaborateurs de l’entreprise. Un responsable demeure comptabilisé comme un employé unique.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded bg-[#173B3F] hover:bg-[#102B2E] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          + Ajouter un employé
        </button>
      </div>

      {/* Synthèse cohérente des compteurs d'effectif */}
      <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 text-[13px]">
        <div className="flex flex-wrap items-center gap-4 text-[#66736F]">
          <span>
            Nombre total de collaborateurs :{' '}
            <strong className="text-[#202824] font-semibold tabular-nums">
              {totalCount}
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Employés actifs :{' '}
            <strong className="text-[#287A55] font-semibold tabular-nums">
              {activeCount}
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            En attente d’activation :{' '}
            <strong className="text-[#A86412] font-semibold tabular-nums">
              {pendingCount}
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Comptes désactivés :{' '}
            <strong className="text-[#B42332] font-semibold tabular-nums">
              {deactivatedCount}
            </strong>
          </span>
        </div>
        <span className="text-xs text-[#66736F]">
          Accès fermé · Création réservée à l’administration
        </span>
      </div>

      {/* Feedback Banner */}
      {feedbackBanner && (
        <div className="bg-[#EDF6EF] border border-[#287A55]/30 rounded-lg px-4 py-3 flex items-center justify-between gap-3 text-[13px] text-[#202824]">
          <span>{feedbackBanner}</span>
          <button
            type="button"
            onClick={() => setFeedbackBanner(null)}
            className="text-[#66736F] hover:text-[#202824] font-bold text-sm leading-none px-1"
            aria-label="Fermer la notification"
          >
            ×
          </button>
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Rechercher par matricule, nom, email ou fonction..."
              aria-label="Rechercher un employé"
              className="w-full pl-3.5 pr-3 py-2 rounded border border-[#E5E0D8] bg-[#F7F5F0]/50 text-[13px] text-[#202824] focus:outline-none focus:border-[#173B3F]"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filtrer par département"
            className="px-3 py-2 rounded border border-[#E5E0D8] bg-white text-[13px] text-[#202824] focus:outline-none focus:border-[#173B3F]"
          >
            <option value="ALL">Tous les départements</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filtrer par statut du compte"
            className="px-3 py-2 rounded border border-[#E5E0D8] bg-white text-[13px] text-[#202824] focus:outline-none focus:border-[#173B3F]"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIF">Actif ({activeCount})</option>
            <option value="EN_ATTENTE_ACTIVATION">En attente d’activation ({pendingCount})</option>
            <option value="DESACTIVE">Désactivé ({deactivatedCount})</option>
          </select>
        </div>

        <div className="text-[13px] text-[#66736F] tabular-nums">
          {filteredEmployees.length} sur {totalCount} collaborateur{totalCount > 1 ? 's' : ''}
        </div>
      </div>

      {/* Tableau des employés */}
      <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E0D8] bg-[#F7F5F0] text-xs font-bold text-[#66736F] uppercase tracking-wider">
                <th className="py-3.5 px-3.5">Matricule</th>
                <th className="py-3.5 px-3.5">Nom et prénom</th>
                <th className="py-3.5 px-3.5">Adresse email</th>
                <th className="py-3.5 px-3.5">Département</th>
                <th className="py-3.5 px-3.5">Rôle</th>
                <th className="py-3.5 px-3.5">Statut du compte</th>
                <th className="py-3.5 px-3.5">Création</th>
                <th className="py-3.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8] text-[13px]">
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#66736F]">
                    Aucun collaborateur ne correspond aux critères de recherche.
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => {
                  const statusMeta = STATUS_META[emp.status];
                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-[#F7F5F0]/60 transition-colors"
                    >
                      <td className="py-3.5 px-3.5 font-['JetBrains_Mono'] text-xs font-semibold text-[#173B3F] whitespace-nowrap">
                        {emp.matricule}
                      </td>
                      <td className="py-3.5 px-3.5 font-semibold text-[#202824] whitespace-nowrap">
                        <div>{emp.fullName}</div>
                        <div className="text-xs text-[#66736F] font-normal">
                          {emp.position}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-[#66736F] break-all max-w-[200px]">
                        {emp.email}
                      </td>
                      <td className="py-3.5 px-3 text-[#202824] max-w-[180px]">
                        {emp.departmentName}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap text-[#202824]">
                        {emp.roles.includes('RESPONSABLE')
                          ? 'Employé · Responsable'
                          : 'Employé'}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={statusMeta.textClass}>
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-['JetBrains_Mono'] text-xs text-[#66736F] tabular-nums whitespace-nowrap">
                        {emp.createdAt}
                      </td>
                      <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedProfile(emp)}
                            className="text-[#173B3F] hover:underline font-medium"
                          >
                            Fiche
                          </button>
                          <span className="text-[#E5E0D8]">|</span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditError(null);
                              setEditingEmployee(emp);
                            }}
                            className="text-[#202824] hover:underline font-medium"
                          >
                            Modifier
                          </button>
                          <span className="text-[#E5E0D8]">|</span>
                          {emp.status === 'DESACTIVE' ? (
                            <button
                              type="button"
                              onClick={() => {
                                const res = onUpdateStatus(emp.id, 'ACTIF');
                                if (res.ok) {
                                  setFeedbackBanner(`Le compte de ${emp.fullName} a été réactivé.`);
                                }
                              }}
                              className="text-[#287A55] hover:underline font-semibold"
                            >
                              Réactiver
                            </button>
                          ) : emp.status === 'EN_ATTENTE_ACTIVATION' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  const res = onUpdateStatus(emp.id, 'ACTIF');
                                  if (res.ok) {
                                    setFeedbackBanner(`Le compte de ${emp.fullName} a été activé.`);
                                  }
                                }}
                                className="text-[#287A55] hover:underline font-semibold"
                              >
                                Activer
                              </button>
                              <span className="text-[#E5E0D8]">|</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeactivateError(null);
                                  setConfirmingDeactivateEmp(emp);
                                }}
                                className="text-[#B42332] hover:underline font-medium"
                              >
                                Désactiver
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setDeactivateError(null);
                                setConfirmingDeactivateEmp(emp);
                              }}
                              className="text-[#B42332] hover:underline font-medium"
                            >
                              Désactiver
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-[#E5E0D8] bg-[#F7F5F0]/40 flex items-center justify-between text-xs text-[#66736F]">
          <span className="tabular-nums">
            Page {currentPage} sur {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded border border-[#E5E0D8] bg-white disabled:opacity-40 text-[#202824] font-medium"
            >
              Précédent
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded border border-[#E5E0D8] bg-white disabled:opacity-40 text-[#202824] font-medium"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* MODALE : AJOUTER UN EMPLOYÉ */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-add-employee-title"
            className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg max-w-lg w-full p-6 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
              <h2
                id="modal-add-employee-title"
                className="font-['DM_Serif_Display'] text-xl text-[#202824]"
              >
                Ajouter un employé
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

            <form onSubmit={handleSubmitAdd} className="mt-4 flex flex-col gap-3.5 text-xs">
              {formError && (
                <div className="p-3 rounded bg-[#FDECEC] border border-[#B42332]/30 text-[#B42332] font-medium">
                  {formError}
                </div>
              )}

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
                    placeholder="Ex. Lucas"
                    className="w-full px-3 py-2 rounded border border-[#E5E0D8] text-[#202824] focus:outline-none focus:border-[#173B3F]"
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
                    placeholder="Ex. Moreau"
                    className="w-full px-3 py-2 rounded border border-[#E5E0D8] text-[#202824] focus:outline-none focus:border-[#173B3F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#202824] mb-1">
                    Adresse email professionnelle *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="prenom.nom@entreprise.com"
                    className="w-full px-3 py-2 rounded border border-[#E5E0D8] text-[#202824] focus:outline-none focus:border-[#173B3F]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#202824] mb-1">
                    Téléphone professionnel
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+33 1 42 68 55 00"
                    className="w-full px-3 py-2 rounded border border-[#E5E0D8] text-[#202824] focus:outline-none focus:border-[#173B3F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#202824] mb-1">
                    Département *
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-[#E5E0D8] bg-white text-[#202824] focus:outline-none focus:border-[#173B3F]"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
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
                    placeholder="Ex. Comptable, Chargé RH..."
                    className="w-full px-3 py-2 rounded border border-[#E5E0D8] text-[#202824] focus:outline-none focus:border-[#173B3F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#202824] mb-1">
                    Matricule (auto si vide)
                  </label>
                  <input
                    type="text"
                    value={matricule}
                    onChange={(e) => setMatricule(e.target.value)}
                    placeholder="EMP-013"
                    className="w-full px-3 py-2 rounded border border-[#E5E0D8] font-['JetBrains_Mono'] text-[#202824] focus:outline-none focus:border-[#173B3F]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#202824] mb-1">
                    Statut initial du compte
                  </label>
                  <select
                    value={initialStatus}
                    onChange={(e) => setInitialStatus(e.target.value as AccountStatus)}
                    className="w-full px-3 py-2 rounded border border-[#E5E0D8] bg-white text-[#202824]"
                  >
                    <option value="EN_ATTENTE_ACTIVATION">
                      En attente d’activation (Recommandé)
                    </option>
                    <option value="ACTIF">Actif immédiatement</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded bg-[#F7F5F0] border border-[#E5E0D8] text-[11px] text-[#66736F] leading-relaxed">
                Conformément à la politique de sécurité, le rôle attribué par défaut est <strong>Employé</strong> et aucun mot de passe en clair n’est affiché. Une invitation d’activation sécurisée sera préparée pour l’adresse professionnelle du collaborateur.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E5E0D8]">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded border border-[#E5E0D8] text-[#202824] hover:bg-[#F7F5F0] font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#173B3F] hover:bg-[#102B2E] text-white font-semibold"
                >
                  Créer le compte employé
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE : CONFIRMATION DE DÉSACTIVATION D'UN EMPLOYÉ */}
      {confirmingDeactivateEmp && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-deactivate-emp-title"
            className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg max-w-md w-full p-6 shadow-xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
              <h2
                id="modal-deactivate-emp-title"
                className="font-['DM_Serif_Display'] text-xl text-[#202824]"
              >
                Confirmer la désactivation du compte
              </h2>
              <button
                type="button"
                onClick={() => setConfirmingDeactivateEmp(null)}
                className="text-[#66736F] hover:text-[#202824]"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {deactivateError && (
                <div className="p-3 rounded bg-[#FDECEC] border border-[#B42332]/30 text-[#B42332] font-medium">
                  {deactivateError}
                </div>
              )}

              <p className="text-[13px] text-[#202824] leading-relaxed">
                Souhaitez-vous désactiver le compte de{' '}
                <strong>{confirmingDeactivateEmp.fullName}</strong> ({confirmingDeactivateEmp.matricule} — {confirmingDeactivateEmp.departmentName}) ?
              </p>

              <div className="p-3 rounded bg-[#F7F5F0] border border-[#E5E0D8] text-[#66736F] space-y-1">
                <p>• Le compte passera au statut <strong>Désactivé</strong>.</p>
                <p>• L’utilisateur ne pourra plus se connecter à la plateforme.</p>
                <p>• Les données nécessaires à l’historique des signalements sont intégralement conservées.</p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#E5E0D8] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDeactivateEmp(null)}
                className="px-4 py-2 rounded border border-[#E5E0D8] text-[#202824] font-semibold"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDeactivate}
                className="px-4 py-2 rounded bg-[#B42332] hover:bg-[#93000A] text-white font-semibold"
              >
                Confirmer la désactivation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE : FICHE EMPLOYÉ */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg max-w-md w-full p-6 shadow-xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
              <div>
                <span className="font-['JetBrains_Mono'] text-[11px] font-semibold text-[#173B3F]">
                  {selectedProfile.matricule}
                </span>
                <h2 className="font-['DM_Serif_Display'] text-xl text-[#202824]">
                  {selectedProfile.fullName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className="text-[#66736F] hover:text-[#202824]"
                aria-label="Fermer la fiche"
              >
                ×
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-[13px]">
              <div className="flex justify-between py-1.5 border-b border-[#E5E0D8]/60">
                <span className="text-[#66736F]">Fonction :</span>
                <span className="font-semibold text-[#202824]">{selectedProfile.position}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E5E0D8]/60">
                <span className="text-[#66736F]">Département :</span>
                <span className="font-semibold text-[#202824]">{selectedProfile.departmentName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E5E0D8]/60">
                <span className="text-[#66736F]">Email professionnel :</span>
                <span className="font-semibold text-[#202824]">{selectedProfile.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E5E0D8]/60">
                <span className="text-[#66736F]">Téléphone :</span>
                <span className="font-semibold text-[#202824]">{selectedProfile.phone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E5E0D8]/60">
                <span className="text-[#66736F]">Habilitations :</span>
                <span className="font-semibold text-[#202824]">
                  {selectedProfile.roles.join(' · ')}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E5E0D8]/60">
                <span className="text-[#66736F]">Statut du compte :</span>
                <span className={STATUS_META[selectedProfile.status].textClass}>
                  {STATUS_META[selectedProfile.status].label}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#66736F]">Date de création :</span>
                <span className="font-['JetBrains_Mono'] text-[#202824]">
                  {selectedProfile.createdAt}
                </span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#E5E0D8] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className="px-4 py-2 rounded bg-[#173B3F] text-white font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE : MODIFIER UN EMPLOYÉ */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg max-w-lg w-full p-6 shadow-xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
              <h2 className="font-['DM_Serif_Display'] text-xl text-[#202824]">
                Modifier le collaborateur ({editingEmployee.matricule})
              </h2>
              <button
                type="button"
                onClick={() => setEditingEmployee(null)}
                className="text-[#66736F] hover:text-[#202824]"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="mt-4 flex flex-col gap-3">
              {editError && (
                <div className="p-3 rounded bg-[#FDECEC] border border-[#B42332]/30 text-[#B42332] font-medium">
                  {editError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#202824] mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.firstName}
                    onChange={(e) =>
                      setEditingEmployee({ ...editingEmployee, firstName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded border border-[#E5E0D8]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#202824] mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.lastName}
                    onChange={(e) =>
                      setEditingEmployee({ ...editingEmployee, lastName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded border border-[#E5E0D8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#202824] mb-1">
                    Adresse email professionnelle *
                  </label>
                  <input
                    type="email"
                    required
                    value={editingEmployee.email}
                    onChange={(e) =>
                      setEditingEmployee({ ...editingEmployee, email: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded border border-[#E5E0D8]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#202824] mb-1">
                    Téléphone professionnel
                  </label>
                  <input
                    type="text"
                    value={editingEmployee.phone}
                    onChange={(e) =>
                      setEditingEmployee({ ...editingEmployee, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded border border-[#E5E0D8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#202824] mb-1">Département *</label>
                  <select
                    value={editingEmployee.departmentId}
                    onChange={(e) =>
                      setEditingEmployee({ ...editingEmployee, departmentId: e.target.value })
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
                  <label className="block font-semibold text-[#202824] mb-1">
                    Fonction *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.position}
                    onChange={(e) =>
                      setEditingEmployee({ ...editingEmployee, position: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded border border-[#E5E0D8]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E0D8]">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 rounded border border-[#E5E0D8] text-[#202824] font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#173B3F] text-white font-semibold"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
