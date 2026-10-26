import React, { useState } from 'react';
import { ResponsibleUser } from '../types/ticket';

interface ResponsibleSettingsViewProps {
  currentUser: ResponsibleUser;
  onBackToDashboard: () => void;
}

export const ResponsibleSettingsView: React.FC<ResponsibleSettingsViewProps> = ({
  currentUser,
  onBackToDashboard,
}) => {
  const [notifyCritical, setNotifyCritical] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [notifyOnCollabReply, setNotifyOnCollabReply] = useState(true);
  const [slaAlertThreshold, setSlaAlertThreshold] = useState('45');
  const [defaultView, setDefaultView] = useState('dashboard');
  const [autoArchiveClosed, setAutoArchiveClosed] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-['JetBrains_Mono'] text-xs font-semibold text-[#146C48] uppercase tracking-wider">
            Configuration
          </span>
          <h2 className="font-['DM_Serif_Display'] text-2xl text-[#002529] mt-1">
            Paramètres de l'espace Responsable
          </h2>
          <p className="text-xs text-[#66736F] mt-1 font-['DM_Sans']">
            Gérez vos préférences d'alerte, de suivi des délais et d'affichage pour le service {currentUser.department}.
          </p>
        </div>

        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-[#E5E0D8] text-xs font-semibold text-[#151D19] hover:bg-[#F3FBF5] self-start sm:self-auto shadow-2xs font-['DM_Sans']"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Retour au Tableau de bord</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-[#A2F4C6]/30 border border-[#A2F4C6] rounded-lg text-xs font-semibold text-[#002112] flex items-center gap-2 font-['DM_Sans']">
          <span className="material-symbols-outlined text-base text-[#146C48]">check_circle</span>
          <span>Vos préférences ont été enregistrées avec succès.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-5">
        {/* Profile and department identification */}
        <div className="p-5 bg-white border border-[#E5E0D8] rounded-lg shadow-2xs flex flex-col gap-4 font-['DM_Sans']">
          <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full object-cover border border-[#E5E0D8]"
              />
              <div>
                <h3 className="text-sm font-bold text-[#151D19]">{currentUser.name}</h3>
                <p className="text-xs text-[#66736F]">{currentUser.role}</p>
                <span className="text-[11px] text-[#146C48] font-medium">{currentUser.department}</span>
              </div>
            </div>
            <span className="font-['JetBrains_Mono'] text-xs font-bold px-2.5 py-1 rounded bg-[#EDF6EF] text-[#002529] border border-[#E5E0D8]">
              {currentUser.codeDepartment}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#66736F] block text-[11px] font-semibold mb-1">Périmètre d'habilitation</span>
              <p className="font-medium text-[#151D19] p-2 bg-[#F7F5F0] rounded border border-[#E5E0D8]">
                {currentUser.clearanceLevel}
              </p>
            </div>
            <div>
              <span className="text-[#66736F] block text-[11px] font-semibold mb-1">Rôle de supervision</span>
              <p className="font-medium text-[#151D19] p-2 bg-[#F7F5F0] rounded border border-[#E5E0D8]">
                Responsable de service (Prise en charge, délégation et résolution)
              </p>
            </div>
          </div>
        </div>

        {/* Notifications and Alerts */}
        <div className="p-5 bg-white border border-[#E5E0D8] rounded-lg shadow-2xs flex flex-col gap-3 font-['DM_Sans']">
          <h3 className="text-sm font-bold text-[#002529] border-b border-[#E5E0D8] pb-2">
            Alertes et notifications de service
          </h3>

          <div className="space-y-3 pt-1">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyCritical}
                onChange={(e) => setNotifyCritical(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#E5E0D8] text-[#173B3F] focus:ring-[#173B3F]"
              />
              <div>
                <span className="text-xs font-bold text-[#151D19] block">
                  Alertes immédiates pour signalements critiques ou urgents
                </span>
                <span className="text-[11px] text-[#66736F] block">
                  Recevoir un rappel instantané dans la barre d'outils et par email dès qu'un incident à fort impact est déposé.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={dailyDigest}
                onChange={(e) => setDailyDigest(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#E5E0D8] text-[#173B3F] focus:ring-[#173B3F]"
              />
              <div>
                <span className="text-xs font-bold text-[#151D19] block">
                  Synthèse quotidienne des dossiers en attente (8h30)
                </span>
                <span className="text-[11px] text-[#66736F] block">
                  Récapitulatif des signalements à traiter et des interventions programmées pour la journée.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyOnCollabReply}
                onChange={(e) => setNotifyOnCollabReply(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#E5E0D8] text-[#173B3F] focus:ring-[#173B3F]"
              />
              <div>
                <span className="text-xs font-bold text-[#151D19] block">
                  Notification lors des réponses d'employés
                </span>
                <span className="text-[11px] text-[#66736F] block">
                  Être averti quand un collaborateur apporte des précisions à une demande en cours.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* SLA and Delays */}
        <div className="p-5 bg-white border border-[#E5E0D8] rounded-lg shadow-2xs flex flex-col gap-3 font-['DM_Sans']">
          <h3 className="text-sm font-bold text-[#002529] border-b border-[#E5E0D8] pb-2">
            Engagement de service & Objectifs de traitement (SLA)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
            <div>
              <label className="text-[#66736F] block text-[11px] font-semibold mb-1">
                Seuil d'alerte pour prise en charge d'urgence
              </label>
              <select
                value={slaAlertThreshold}
                onChange={(e) => setSlaAlertThreshold(e.target.value)}
                className="w-full p-2 rounded border border-[#E5E0D8] bg-[#F7F5F0] text-xs font-medium"
              >
                <option value="30">30 minutes (Recommandé pour incidents bloquants)</option>
                <option value="45">45 minutes (Standard département)</option>
                <option value="60">1 heure</option>
                <option value="120">2 heures</option>
              </select>
            </div>

            <div>
              <label className="text-[#66736F] block text-[11px] font-semibold mb-1">
                Vue de démarrage par défaut
              </label>
              <select
                value={defaultView}
                onChange={(e) => setDefaultView(e.target.value)}
                className="w-full p-2 rounded border border-[#E5E0D8] bg-[#F7F5F0] text-xs font-medium"
              >
                <option value="dashboard">Tableau de bord opérationnel</option>
                <option value="received">Signalements reçus (File complète)</option>
                <option value="to_treat">Dossiers à traiter en priorité</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoArchiveClosed}
                onChange={(e) => setAutoArchiveClosed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#E5E0D8] text-[#173B3F] focus:ring-[#173B3F]"
              />
              <div>
                <span className="text-xs font-bold text-[#151D19] block">
                  Filtrer automatiquement les signalements clôturés depuis plus de 30 jours
                </span>
                <span className="text-[11px] text-[#66736F] block">
                  Garde la vue principale concentrée sur les dossiers actifs tout en conservant l'historique complet.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="px-4 py-2 rounded bg-white border border-[#E5E0D8] text-xs font-semibold text-[#151D19] hover:bg-[#F3FBF5] transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded bg-[#173B3F] text-white hover:bg-[#002529] text-xs font-semibold shadow-xs transition-colors"
          >
            Enregistrer les préférences
          </button>
        </div>
      </form>
    </div>
  );
};
