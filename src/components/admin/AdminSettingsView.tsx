import React, { useState } from 'react';
import { AdminCompanySettings } from '../../types/admin';
import { TicketPriority } from '../../types/ticket';

interface AdminSettingsViewProps {
  settings: AdminCompanySettings;
  onUpdateSettings: (newSettings: AdminCompanySettings) => void;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [formState, setFormState] = useState<AdminCompanySettings>(settings);
  const [savedBanner, setSavedBanner] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formState);
    setSavedBanner(true);
  };

  return (
    <div className="flex flex-col gap-6 font-['DM_Sans']">
      {/* En-tête */}
      <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg p-6">
        <h1 className="font-['DM_Serif_Display'] text-2xl lg:text-3xl text-[#202824]">
          Paramètres
        </h1>
        <p className="text-sm text-[#66736F] mt-1">
          Configurez les règles générales de la plateforme EmployeeCare.
        </p>
      </div>

      {savedBanner && (
        <div className="bg-[#EDF6EF] border border-[#287A55]/30 rounded-lg px-4 py-3 flex items-center justify-between text-xs text-[#202824]">
          <span>
            Les paramètres généraux d’EmployeeCare ont été enregistrés et appliqués à l’ensemble des espaces.
          </span>
          <button
            type="button"
            onClick={() => setSavedBanner(false)}
            className="text-[#66736F] hover:text-[#202824] font-bold"
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* 1. Informations de l'entreprise */}
        <section className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg p-5 flex flex-col gap-4">
          <div className="border-b border-[#E5E0D8] pb-3">
            <h2 className="text-base font-bold text-[#202824]">
              1. Informations de l’entreprise
            </h2>
            <p className="text-[#66736F] mt-0.5">
              Identité institutionnelle affichée sur les portails Employé et Responsable.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-[#202824] mb-1">
              Nom de l’entreprise
            </label>
            <input
              type="text"
              required
              value={formState.companyName}
              onChange={(e) =>
                setFormState({ ...formState, companyName: e.target.value })
              }
              className="w-full px-3 py-2 rounded border border-[#E5E0D8] text-[#202824]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#202824] mb-1">
              Intitulé de l’espace de dialogue
            </label>
            <input
              type="text"
              value={formState.companySubtitle}
              onChange={(e) =>
                setFormState({ ...formState, companySubtitle: e.target.value })
              }
              className="w-full px-3 py-2 rounded border border-[#E5E0D8] text-[#202824]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#202824] mb-1">
              Adresse email de contact administratif
            </label>
            <input
              type="email"
              required
              value={formState.contactEmail}
              onChange={(e) =>
                setFormState({ ...formState, contactEmail: e.target.value })
              }
              className="w-full px-3 py-2 rounded border border-[#E5E0D8] text-[#202824]"
            />
          </div>
        </section>

        {/* 2. Gestion des comptes */}
        <section className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg p-5 flex flex-col gap-4">
          <div className="border-b border-[#E5E0D8] pb-3">
            <h2 className="text-base font-bold text-[#202824]">
              2. Gestion des comptes
            </h2>
            <p className="text-[#66736F] mt-0.5">
              Politique d’accès fermé (aucune inscription publique autorisée).
            </p>
          </div>

          <div>
            <label className="block font-semibold text-[#202824] mb-1">
              Durée de validité des invitations d’activation (heures)
            </label>
            <input
              type="number"
              min={12}
              max={720}
              value={formState.invitationValidityHours}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  invitationValidityHours: Number(e.target.value) || 72,
                })
              }
              className="w-full px-3 py-2 rounded border border-[#E5E0D8] font-['JetBrains_Mono'] tabular-nums text-[#202824]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#202824] mb-1">
              Conservation des comptes désactivés (jours)
            </label>
            <input
              type="number"
              min={30}
              max={3650}
              value={formState.archiveDeactivatedAccountsDays}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  archiveDeactivatedAccountsDays: Number(e.target.value) || 365,
                })
              }
              className="w-full px-3 py-2 rounded border border-[#E5E0D8] font-['JetBrains_Mono'] tabular-nums text-[#202824]"
            />
          </div>

          <label className="flex items-center gap-2 text-[#202824] cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={formState.requireManualActivation}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  requireManualActivation: e.target.checked,
                })
              }
              className="accent-[#173B3F]"
            />
            <span>
              Exiger l’activation par lien personnel à la première connexion (statut initial « En attente d’activation »)
            </span>
          </label>
        </section>

        {/* 3. Signalements */}
        <section className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg p-5 flex flex-col gap-4">
          <div className="border-b border-[#E5E0D8] pb-3">
            <h2 className="text-base font-bold text-[#202824]">
              3. Signalements
            </h2>
            <p className="text-[#66736F] mt-0.5">
              Règles d’attribution automatique et priorités par défaut.
            </p>
          </div>

          <label className="flex items-center gap-2 text-[#202824] cursor-pointer">
            <input
              type="checkbox"
              checked={formState.autoAssignByCategory}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  autoAssignByCategory: e.target.checked,
                })
              }
              className="accent-[#173B3F]"
            />
            <span>
              Activer l’orientation automatique des signalements selon la table « Catégories et attributions »
            </span>
          </label>

          <div>
            <label className="block font-semibold text-[#202824] mb-1">
              Niveau de priorité par défaut (si non spécifié)
            </label>
            <select
              value={formState.defaultFallbackPriority}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  defaultFallbackPriority: e.target.value as TicketPriority,
                })
              }
              className="w-full px-3 py-2 rounded border border-[#E5E0D8] bg-white text-[#202824]"
            >
              <option value="BASSE">Faible</option>
              <option value="MOYENNE">Moyenne</option>
              <option value="ELEVEE">Élevée</option>
              <option value="CRITIQUE">Critique</option>
            </select>
          </div>
        </section>

        {/* 4. Notifications par email */}
        <section className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg p-5 flex flex-col gap-4">
          <div className="border-b border-[#E5E0D8] pb-3">
            <h2 className="text-base font-bold text-[#202824]">
              4. Notifications par email
            </h2>
            <p className="text-[#66736F] mt-0.5">
              Alertes opérationnelles envoyées aux profils concernés.
            </p>
          </div>

          <label className="flex items-center gap-2 text-[#202824] cursor-pointer">
            <input
              type="checkbox"
              checked={formState.notifyAdminOnUnassignedTicket}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  notifyAdminOnUnassignedTicket: e.target.checked,
                })
              }
              className="accent-[#173B3F]"
            />
            <span>
              Alerter l’administrateur lorsqu’un signalement arrive sur une catégorie sans responsable
            </span>
          </label>

          <label className="flex items-center gap-2 text-[#202824] cursor-pointer">
            <input
              type="checkbox"
              checked={formState.notifyManagerOnAssignment}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  notifyManagerOnAssignment: e.target.checked,
                })
              }
              className="accent-[#173B3F]"
            />
            <span>
              Notifier le responsable de service à chaque nouveau signalement ou réattribution
            </span>
          </label>

          <label className="flex items-center gap-2 text-[#202824] cursor-pointer">
            <input
              type="checkbox"
              checked={formState.notifyEmployeeOnStatusChange}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  notifyEmployeeOnStatusChange: e.target.checked,
                })
              }
              className="accent-[#173B3F]"
            />
            <span>
              Informer l’employé lors de la prise en charge et de la proposition de résolution
            </span>
          </label>
        </section>

        <div className="lg:col-span-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded bg-[#173B3F] hover:bg-[#102B2E] text-white font-semibold"
          >
            Enregistrer les paramètres
          </button>
        </div>
      </form>
    </div>
  );
};
