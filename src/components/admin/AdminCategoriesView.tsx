import React, { useState } from 'react';
import {
  CategoryAttribution,
  DepartmentRecord,
  ResponsableAccount,
} from '../../types/admin';
import { TicketPriority } from '../../types/ticket';

interface AdminCategoriesViewProps {
  categories: CategoryAttribution[];
  departments: DepartmentRecord[];
  responsables: ResponsableAccount[];
  onCreateCategory: (cat: Omit<CategoryAttribution, 'id'>) => void;
  onUpdateCategory: (cat: CategoryAttribution) => void;
}

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  BASSE: 'Faible',
  MOYENNE: 'Moyenne',
  ELEVEE: 'Élevée',
  CRITIQUE: 'Critique',
};

export const AdminCategoriesView: React.FC<AdminCategoriesViewProps> = ({
  categories,
  departments,
  responsables,
  onCreateCategory,
  onUpdateCategory,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryAttribution | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Create Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 'dept-it');
  const [primaryManagerId, setPrimaryManagerId] = useState(responsables[0]?.id || '');
  const [secondaryManagerId, setSecondaryManagerId] = useState('');
  const [defaultPriority, setDefaultPriority] = useState<TicketPriority>('MOYENNE');
  const [isSensitiveConfidential, setIsSensitiveConfidential] = useState(false);

  const activeResponsables = responsables.filter(
    (r) => r.roleActive && r.status !== 'DESACTIVE'
  );
  const unassignedCategories = categories.filter(
    (c) => c.status === 'ACTIVE' && (!c.primaryManagerId || c.primaryManagerId.trim() === '')
  );

  const handleOpenCreate = () => {
    setName('');
    setDescription('');
    setDepartmentId(departments[0]?.id || 'dept-it');
    setPrimaryManagerId(activeResponsables[0]?.id || '');
    setSecondaryManagerId('');
    setDefaultPriority('MOYENNE');
    setIsSensitiveConfidential(false);
    setIsCreateOpen(true);
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const dept = departments.find((d) => d.id === departmentId);
    const primaryMgr = responsables.find((r) => r.id === primaryManagerId);
    const secondaryMgr = responsables.find((r) => r.id === secondaryManagerId);

    onCreateCategory({
      name: name.trim(),
      description: description.trim() || 'Catégorie de signalement professionnel.',
      departmentId,
      departmentName: dept ? dept.name : 'Service Général',
      primaryManagerId,
      primaryManagerName: primaryMgr ? primaryMgr.fullName : '',
      secondaryManagerId: secondaryMgr ? secondaryMgr.id : undefined,
      secondaryManagerName: secondaryMgr ? secondaryMgr.fullName : undefined,
      defaultPriority,
      isSensitiveConfidential,
      restrictedHandlerIds: isSensitiveConfidential && primaryMgr ? [primaryMgr.id] : [],
      status: 'ACTIVE',
    });

    setIsCreateOpen(false);
    setFeedbackBanner(
      `La catégorie « ${name.trim()} » et ses règles d’attribution ont été enregistrées.`
    );
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat) return;
    const dept = departments.find((d) => d.id === editingCat.departmentId);
    const primaryMgr = responsables.find((r) => r.id === editingCat.primaryManagerId);
    const secondaryMgr = responsables.find((r) => r.id === editingCat.secondaryManagerId);

    onUpdateCategory({
      ...editingCat,
      name: editingCat.name.trim(),
      description: editingCat.description.trim(),
      departmentName: dept ? dept.name : editingCat.departmentName,
      primaryManagerName: primaryMgr ? primaryMgr.fullName : '',
      secondaryManagerId: secondaryMgr ? secondaryMgr.id : undefined,
      secondaryManagerName: secondaryMgr ? secondaryMgr.fullName : undefined,
      restrictedHandlerIds:
        editingCat.isSensitiveConfidential && primaryMgr ? [primaryMgr.id] : [],
    });

    setFeedbackBanner(
      `La catégorie « ${editingCat.name.trim()} » et ses attributions ont été mises à jour et synchronisées avec les responsables.`
    );
    setEditingCat(null);
  };

  return (
    <div className="flex flex-col gap-5 font-['DM_Sans']">
      {/* En-tête */}
      <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['DM_Serif_Display'] text-2xl lg:text-3xl text-[#202824]">
            Catégories et attributions
          </h1>
          <p className="text-sm text-[#66736F] mt-1">
            Définissez quel département et quel responsable reçoivent chaque type de signalement.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded bg-[#173B3F] hover:bg-[#102B2E] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          + Créer une catégorie
        </button>
      </div>

      {/* Avertissement visible si une catégorie n'a aucun responsable affecté */}
      {unassignedCategories.length > 0 && (
        <div className="bg-[#FFF8EB] border border-[#A86412]/40 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px]">
          <div>
            <p className="font-bold text-[#A86412]">
              Aucun responsable n’est actuellement affecté à cette catégorie.
            </p>
            <p className="text-[#202824] mt-0.5 text-xs">
              Catégorie(s) concernée(s) :{' '}
              <strong>{unassignedCategories.map((c) => c.name).join(', ')}</strong>. Les nouveaux signalements de cette catégorie nécessiteront une orientation manuelle tant qu’un responsable principal n’aura pas été désigné.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditingCat(unassignedCategories[0])}
            className="px-3.5 py-2 rounded bg-[#173B3F] text-white text-xs font-semibold whitespace-nowrap shrink-0"
          >
            Affecter un responsable
          </button>
        </div>
      )}

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

      {/* Tableau des catégories et attributions */}
      <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E0D8] bg-[#F7F5F0] text-xs font-bold text-[#66736F] uppercase tracking-wider">
                <th className="py-3.5 px-4">Nom de la catégorie</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Service responsable</th>
                <th className="py-3.5 px-4">Responsable principal</th>
                <th className="py-3.5 px-4">Responsable secondaire</th>
                <th className="py-3.5 px-4">Priorité défaut</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8] text-[13px]">
              {categories.map((cat) => {
                const hasNoManager = !cat.primaryManagerId || cat.primaryManagerId.trim() === '';
                return (
                  <tr
                    key={cat.id}
                    className="hover:bg-[#F7F5F0]/60 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-[#202824] whitespace-nowrap">
                      <div>{cat.name}</div>
                      {cat.isSensitiveConfidential && (
                        <div className="text-xs text-[#173B3F] font-normal">
                          Confidentiel · Groupe habilité restreint
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#66736F] max-w-xs">
                      {cat.description}
                    </td>
                    <td className="py-3.5 px-4 text-[#202824]">
                      {cat.departmentName}
                    </td>
                    <td className="py-3.5 px-4 max-w-[220px]">
                      {hasNoManager ? (
                        <span className="text-[#B42332] font-semibold">
                          Aucun responsable n’est actuellement affecté à cette catégorie.
                        </span>
                      ) : (
                        <span className="font-semibold text-[#202824]">
                          {cat.primaryManagerName}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#66736F] whitespace-nowrap">
                      {cat.secondaryManagerName || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-[#202824] whitespace-nowrap">
                      {PRIORITY_LABELS[cat.defaultPriority] || cat.defaultPriority}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {cat.status === 'ACTIVE' ? (
                        <span className="text-[#287A55] font-semibold">Active</span>
                      ) : (
                        <span className="text-[#66736F] font-semibold">Inactive</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingCat(cat)}
                          className="text-[#173B3F] hover:underline font-semibold"
                        >
                          Modifier
                        </button>
                        <span className="text-[#E5E0D8]">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            const nextStatus = cat.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                            onUpdateCategory({ ...cat, status: nextStatus });
                            setFeedbackBanner(
                              `La catégorie « ${cat.name} » est désormais ${nextStatus === 'ACTIVE' ? 'Active' : 'Inactive'}.`
                            );
                          }}
                          className="text-[#66736F] hover:text-[#202824] hover:underline font-medium"
                        >
                          {cat.status === 'ACTIVE' ? 'Désactiver' : 'Activer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Encadré explicatif : Signalements sensibles ou confidentiels */}
      <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg p-5 text-[13px]">
        <h2 className="text-sm font-bold text-[#202824]">
          Politique de traitement des signalements sensibles ou confidentiels
        </h2>
        <p className="text-[#66736F] mt-1 leading-relaxed text-xs">
          Les catégories marquées comme sensibles (harcèlement, conflits graves, alertes éthiques ou plaintes contre un supérieur) sont routées exclusivement vers le groupe restreint de personnes habilitées. Le contenu détaillé et les métadonnées identifiantes du déclarant ne sont exposés ni aux autres responsables du service, ni à l’administrateur technique de la plateforme.
        </p>
      </div>

      {/* MODALE : CRÉER UNE CATÉGORIE */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg max-w-lg w-full p-6 shadow-xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
              <h2 className="font-['DM_Serif_Display'] text-xl text-[#202824]">
                Créer une catégorie et définir son attribution
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
                  Nom de la catégorie *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex. Administration et Paie"
                  className="w-full px-3 py-2 rounded border border-[#E5E0D8]"
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
                  placeholder="Précisez les types de demandes couvertes par cette catégorie..."
                  className="w-full px-3 py-2 rounded border border-[#E5E0D8]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#202824] mb-1">
                    Département responsable *
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
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
                    Priorité par défaut
                  </label>
                  <select
                    value={defaultPriority}
                    onChange={(e) => setDefaultPriority(e.target.value as TicketPriority)}
                    className="w-full px-3 py-2 rounded border border-[#E5E0D8] bg-white"
                  >
                    <option value="BASSE">Faible</option>
                    <option value="MOYENNE">Moyenne</option>
                    <option value="ELEVEE">Élevée</option>
                    <option value="CRITIQUE">Critique</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#202824] mb-1">
                    Responsable principal
                  </label>
                  <select
                    value={primaryManagerId}
                    onChange={(e) => setPrimaryManagerId(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-[#E5E0D8] bg-white"
                  >
                    <option value="">-- Aucun responsable --</option>
                    {activeResponsables.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#202824] mb-1">
                    Responsable secondaire (optionnel)
                  </label>
                  <select
                    value={secondaryManagerId}
                    onChange={(e) => setSecondaryManagerId(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-[#E5E0D8] bg-white"
                  >
                    <option value="">-- Aucun --</option>
                    {activeResponsables.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-[#202824] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isSensitiveConfidential}
                  onChange={(e) => setIsSensitiveConfidential(e.target.checked)}
                  className="accent-[#173B3F]"
                />
                <span>
                  Catégorie sensible / confidentielle (accès restreint au référent habilité, contenu masqué pour l’administration)
                </span>
              </label>

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
                  Créer la catégorie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE : MODIFIER UNE CATÉGORIE ET SON ATTRIBUTION (TOUS LES CHAMPS) */}
      {editingCat && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg max-w-lg w-full p-6 shadow-xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
              <h2 className="font-['DM_Serif_Display'] text-xl text-[#202824]">
                Modifier la catégorie et son attribution
              </h2>
              <button
                type="button"
                onClick={() => setEditingCat(null)}
                className="text-[#66736F] hover:text-[#202824]"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="mt-4 flex flex-col gap-3.5">
              <div>
                <label className="block font-semibold text-[#202824] mb-1">
                  Nom de la catégorie *
                </label>
                <input
                  type="text"
                  required
                  value={editingCat.name}
                  onChange={(e) =>
                    setEditingCat({ ...editingCat, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded border border-[#E5E0D8]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202824] mb-1">
                  Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingCat.description}
                  onChange={(e) =>
                    setEditingCat({ ...editingCat, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded border border-[#E5E0D8]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#202824] mb-1">
                    Service responsable
                  </label>
                  <select
                    value={editingCat.departmentId}
                    onChange={(e) =>
                      setEditingCat({ ...editingCat, departmentId: e.target.value })
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
                    Priorité par défaut
                  </label>
                  <select
                    value={editingCat.defaultPriority}
                    onChange={(e) =>
                      setEditingCat({
                        ...editingCat,
                        defaultPriority: e.target.value as TicketPriority,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-[#E5E0D8] bg-white"
                  >
                    <option value="BASSE">Faible</option>
                    <option value="MOYENNE">Moyenne</option>
                    <option value="ELEVEE">Élevée</option>
                    <option value="CRITIQUE">Critique</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#202824] mb-1">
                    Responsable principal
                  </label>
                  <select
                    value={editingCat.primaryManagerId}
                    onChange={(e) =>
                      setEditingCat({ ...editingCat, primaryManagerId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded border border-[#E5E0D8] bg-white"
                  >
                    <option value="">-- Aucun responsable --</option>
                    {activeResponsables.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#202824] mb-1">
                    Responsable secondaire
                  </label>
                  <select
                    value={editingCat.secondaryManagerId || ''}
                    onChange={(e) =>
                      setEditingCat({
                        ...editingCat,
                        secondaryManagerId: e.target.value || undefined,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-[#E5E0D8] bg-white"
                  >
                    <option value="">-- Aucun --</option>
                    {activeResponsables.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-[#202824] cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingCat.isSensitiveConfidential}
                  onChange={(e) =>
                    setEditingCat({
                      ...editingCat,
                      isSensitiveConfidential: e.target.checked,
                    })
                  }
                  className="accent-[#173B3F]"
                />
                <span>
                  Protection confidentielle restreinte (contenu masqué aux non-habilités)
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E0D8]">
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
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
