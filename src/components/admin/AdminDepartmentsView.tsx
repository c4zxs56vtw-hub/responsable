import React, { useState } from 'react';
import {
  DepartmentRecord,
  EmployeeAccount,
  ResponsableAccount,
} from '../../types/admin';
import { Ticket } from '../../types/ticket';

interface AdminDepartmentsViewProps {
  departments: DepartmentRecord[];
  employees: EmployeeAccount[];
  responsables: ResponsableAccount[];
  tickets: Ticket[];
  onCreateDepartment: (dept: Omit<DepartmentRecord, 'id' | 'createdAt'>) => void;
  onUpdateDepartment: (dept: DepartmentRecord) => void;
  openCreateModalInitially?: boolean;
  onConsumeInitialModal?: () => void;
}

export const AdminDepartmentsView: React.FC<AdminDepartmentsViewProps> = ({
  departments,
  employees,
  responsables,
  tickets,
  onCreateDepartment,
  onUpdateDepartment,
  openCreateModalInitially = false,
  onConsumeInitialModal,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(openCreateModalInitially);
  const [editingDept, setEditingDept] = useState<DepartmentRecord | null>(null);
  const [viewingDeptEmployees, setViewingDeptEmployees] = useState<DepartmentRecord | null>(null);
  const [confirmingDeactivateDept, setConfirmingDeactivateDept] =
    useState<DepartmentRecord | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Create Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [headManagerId, setHeadManagerId] = useState(responsables[0]?.id || '');
  const [status, setStatus] = useState<'ACTIF' | 'INACTIF'>('ACTIF');

  React.useEffect(() => {
    if (openCreateModalInitially) {
      setIsCreateOpen(true);
      if (onConsumeInitialModal) onConsumeInitialModal();
    }
  }, [openCreateModalInitially, onConsumeInitialModal]);

  const activeResponsables = responsables.filter(
    (r) => r.roleActive && r.status !== 'DESACTIVE'
  );

  const handleOpenCreate = () => {
    setName('');
    setCode(`DIR-0${departments.length + 1}`);
    setDescription('');
    setHeadManagerId(activeResponsables[0]?.id || '');
    setStatus('ACTIF');
    setIsCreateOpen(true);
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const manager = responsables.find((r) => r.id === headManagerId);
    onCreateDepartment({
      name: name.trim(),
      code: code.trim() || `DIR-0${departments.length + 1}`,
      description: description.trim() || 'Service opérationnel de l’entreprise.',
      headManagerId,
      headManagerName: manager ? manager.fullName : 'Non assigné',
      status,
    });
    setIsCreateOpen(false);
    setFeedbackBanner(`Le département « ${name.trim()} » a été créé et ajouté aux listes de sélection.`);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    const manager = responsables.find((r) => r.id === editingDept.headManagerId);
    onUpdateDepartment({
      ...editingDept,
      headManagerName: manager ? manager.fullName : 'Non assigné',
    });
    setFeedbackBanner(
      `Le département « ${editingDept.name} » a été mis à jour dans toutes les rubriques.`
    );
    setEditingDept(null);
  };

  return (
    <div className="flex flex-col gap-5 font-['DM_Sans']">
      {/* En-tête */}
      <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['DM_Serif_Display'] text-2xl lg:text-3xl text-[#202824]">
            Gestion des départements
          </h1>
          <p className="text-sm text-[#66736F] mt-1">
            Organisez les services de l’entreprise et définissez leurs responsables principaux.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded bg-[#173B3F] hover:bg-[#102B2E] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          + Créer un département
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

      {/* Tableau des départements */}
      <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E0D8] bg-[#F7F5F0] text-xs font-bold text-[#66736F] uppercase tracking-wider">
                <th className="py-3.5 px-4">Nom du département</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Responsable principal</th>
                <th className="py-3.5 px-4 text-right">Employés</th>
                <th className="py-3.5 px-4 text-right">Signalements actifs</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8] text-[13px]">
              {departments.map((dept) => {
                const empCount = employees.filter((e) => e.departmentId === dept.id).length;
                const activeTicketsCount = tickets.filter(
                  (t) =>
                    t.targetDepartment === dept.name &&
                    t.status !== 'RESOLU' &&
                    t.status !== 'CLOTURE'
                ).length;

                return (
                  <tr
                    key={dept.id}
                    className="hover:bg-[#F7F5F0]/60 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-[#202824] whitespace-nowrap">
                      <div>{dept.name}</div>
                      <div className="font-['JetBrains_Mono'] text-xs text-[#66736F] font-normal">
                        {dept.code}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#66736F] max-w-sm">
                      {dept.description}
                    </td>
                    <td className="py-3.5 px-4 text-[#202824] font-medium whitespace-nowrap">
                      {dept.headManagerName || (
                        <span className="text-[#B42332]">Non assigné</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-['JetBrains_Mono'] tabular-nums font-semibold text-[#202824]">
                      {empCount}
                    </td>
                    <td className="py-3.5 px-4 text-right font-['JetBrains_Mono'] tabular-nums font-semibold text-[#173B3F]">
                      {activeTicketsCount}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {dept.status === 'ACTIF' ? (
                        <span className="text-[#287A55] font-semibold">Actif</span>
                      ) : (
                        <span className="text-[#B42332] font-semibold">Inactif</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setViewingDeptEmployees(dept)}
                          className="text-[#173B3F] hover:underline font-medium"
                        >
                          Voir les employés
                        </button>
                        <span className="text-[#E5E0D8]">|</span>
                        <button
                          type="button"
                          onClick={() => setEditingDept(dept)}
                          className="text-[#202824] hover:underline font-medium"
                        >
                          Modifier
                        </button>
                        <span className="text-[#E5E0D8]">|</span>
                        {dept.status === 'ACTIF' ? (
                          <button
                            type="button"
                            onClick={() => setConfirmingDeactivateDept(dept)}
                            className="text-[#B42332] hover:underline font-medium"
                          >
                            Désactiver
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateDepartment({ ...dept, status: 'ACTIF' });
                              setFeedbackBanner(
                                `Le département « ${dept.name} » a été réactivé.`
                              );
                            }}
                            className="text-[#287A55] hover:underline font-semibold"
                          >
                            Activer
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

      {/* MODALE : VÉRIFICATION PRÉALABLE AVANT DÉSACTIVATION D'UN DÉPARTEMENT */}
      {confirmingDeactivateDept && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-deactivate-dept-title"
            className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg max-w-md w-full p-6 shadow-xl text-xs"
          >
            {(() => {
              const empCount = employees.filter(
                (e) => e.departmentId === confirmingDeactivateDept.id
              ).length;
              const activeTicketsCount = tickets.filter(
                (t) =>
                  t.targetDepartment === confirmingDeactivateDept.name &&
                  t.status !== 'RESOLU' &&
                  t.status !== 'CLOTURE'
              ).length;

              return (
                <>
                  <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
                    <h2
                      id="modal-deactivate-dept-title"
                      className="font-['DM_Serif_Display'] text-xl text-[#202824]"
                    >
                      Vérification préalable — Désactivation
                    </h2>
                    <button
                      type="button"
                      onClick={() => setConfirmingDeactivateDept(null)}
                      className="text-[#66736F] hover:text-[#202824]"
                      aria-label="Fermer"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-4 space-y-3 text-[13px]">
                    <p className="text-[#202824]">
                      Vous êtes sur le point de passer le département{' '}
                      <strong>« {confirmingDeactivateDept.name} »</strong> au statut{' '}
                      <strong>Inactif</strong>.
                    </p>

                    {(empCount > 0 || activeTicketsCount > 0) && (
                      <div className="p-3.5 rounded bg-[#FFF8EB] border border-[#A86412]/40 text-[#202824] space-y-1 text-xs">
                        <p className="font-bold text-[#A86412]">
                          Données rattachées à ce département :
                        </p>
                        <p>
                          • <strong>{empCount}</strong> collaborateur{empCount > 1 ? 's' : ''} rattaché{empCount > 1 ? 's' : ''}
                        </p>
                        <p>
                          • <strong>{activeTicketsCount}</strong> signalement{activeTicketsCount > 1 ? 's' : ''} actif{activeTicketsCount > 1 ? 's' : ''}
                        </p>
                      </div>
                    )}

                    <div className="p-3 rounded bg-[#F7F5F0] border border-[#E5E0D8] text-xs text-[#66736F] leading-relaxed">
                      Conformément aux règles de gestion, la désactivation d’un département ne supprime ni les comptes employés ni les signalements existants.
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#E5E0D8] flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmingDeactivateDept(null)}
                      className="px-4 py-2 rounded border border-[#E5E0D8] text-[#202824] font-semibold"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateDepartment({
                          ...confirmingDeactivateDept,
                          status: 'INACTIF',
                        });
                        setFeedbackBanner(
                          `Le département « ${confirmingDeactivateDept.name} » a été désactivé (ses ${empCount} collaborateur(s) et dossiers restent préservés).`
                        );
                        setConfirmingDeactivateDept(null);
                      }}
                      className="px-4 py-2 rounded bg-[#B42332] hover:bg-[#93000A] text-white font-semibold"
                    >
                      Confirmer la désactivation
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODALE : CRÉER UN DÉPARTEMENT */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-create-dept-title"
            className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg max-w-md w-full p-6 shadow-xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
              <h2
                id="modal-create-dept-title"
                className="font-['DM_Serif_Display'] text-xl text-[#202824]"
              >
                Créer un département
              </h2>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-[#66736F] hover:text-[#202824]"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitCreate} className="mt-4 flex flex-col gap-3.5">
              <div>
                <label className="block font-semibold text-[#202824] mb-1">
                  Nom du département *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex. Logistique et Achats"
                  className="w-full px-3 py-2 rounded border border-[#E5E0D8]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202824] mb-1">
                  Code du département (optionnel)
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="DIR-LOG-07"
                  className="w-full px-3 py-2 rounded border border-[#E5E0D8] font-['JetBrains_Mono']"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202824] mb-1">
                  Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Missions et périmètre du service..."
                  className="w-full px-3 py-2 rounded border border-[#E5E0D8]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202824] mb-1">
                  Responsable principal
                </label>
                <select
                  value={headManagerId}
                  onChange={(e) => setHeadManagerId(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-[#E5E0D8] bg-white"
                >
                  <option value="">-- Aucun responsable assigné --</option>
                  {activeResponsables.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#202824] mb-1">
                  Statut
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'ACTIF' | 'INACTIF')}
                  className="w-full px-3 py-2 rounded border border-[#E5E0D8] bg-white"
                >
                  <option value="ACTIF">Actif</option>
                  <option value="INACTIF">Inactif</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E0D8]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded border border-[#E5E0D8] text-[#202824] font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#173B3F] text-white font-semibold"
                >
                  Créer le département
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE : MODIFIER UN DÉPARTEMENT */}
      {editingDept && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg max-w-md w-full p-6 shadow-xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
              <h2 className="font-['DM_Serif_Display'] text-xl text-[#202824]">
                Modifier le département
              </h2>
              <button
                type="button"
                onClick={() => setEditingDept(null)}
                className="text-[#66736F] hover:text-[#202824]"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="mt-4 flex flex-col gap-3.5">
              <div>
                <label className="block font-semibold text-[#202824] mb-1">
                  Nom du département
                </label>
                <input
                  type="text"
                  required
                  value={editingDept.name}
                  onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-[#E5E0D8]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202824] mb-1">
                  Code du département
                </label>
                <input
                  type="text"
                  value={editingDept.code}
                  onChange={(e) => setEditingDept({ ...editingDept, code: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-[#E5E0D8] font-['JetBrains_Mono']"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202824] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingDept.description}
                  onChange={(e) =>
                    setEditingDept({ ...editingDept, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded border border-[#E5E0D8]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202824] mb-1">
                  Responsable principal
                </label>
                <select
                  value={editingDept.headManagerId}
                  onChange={(e) =>
                    setEditingDept({ ...editingDept, headManagerId: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded border border-[#E5E0D8] bg-white"
                >
                  <option value="">-- Non assigné --</option>
                  {activeResponsables.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E0D8]">
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
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

      {/* MODALE : VOIR LES EMPLOYÉS DU DÉPARTEMENT */}
      {viewingDeptEmployees && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg max-w-lg w-full p-6 shadow-xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
              <div>
                <h2 className="font-['DM_Serif_Display'] text-xl text-[#202824]">
                  Collaborateurs — {viewingDeptEmployees.name}
                </h2>
                <p className="text-xs text-[#66736F]">
                  Responsable principal : {viewingDeptEmployees.headManagerName || 'Non assigné'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingDeptEmployees(null)}
                className="text-[#66736F] hover:text-[#202824]"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 divide-y divide-[#E5E0D8] max-h-64 overflow-y-auto text-[13px]">
              {employees
                .filter((e) => e.departmentId === viewingDeptEmployees.id)
                .map((emp) => (
                  <div key={emp.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[#202824]">{emp.fullName}</span>
                      <span className="text-[#66736F] ml-2">({emp.position})</span>
                    </div>
                    <span className="font-['JetBrains_Mono'] text-xs text-[#173B3F]">
                      {emp.matricule}
                    </span>
                  </div>
                ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[#E5E0D8] flex justify-end">
              <button
                type="button"
                onClick={() => setViewingDeptEmployees(null)}
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
