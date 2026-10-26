import React from 'react';
import { Ticket } from '../types/ticket';

interface SocialClimateViewProps {
  tickets: Ticket[];
  onBackToDashboard: () => void;
  onSelectTicket: (ticket: Ticket) => void;
}

export const SocialClimateView: React.FC<SocialClimateViewProps> = ({
  tickets,
  onBackToDashboard,
  onSelectTicket,
}) => {
  const criticalCount = tickets.filter((t) => t.priority === 'CRITIQUE' || t.isCriticalSla).length;
  const inProgressCount = tickets.filter((t) => t.status === 'DIAGNOSTIC_EN_COURS').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLU' || t.status === 'CLOTURE').length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="font-['JetBrains_Mono'] text-xs font-semibold text-[#146C48] uppercase tracking-wider">
            Observatoire & Baromètre Opérationnel
          </span>
          <h2 className="font-['DM_Serif_Display'] text-2xl text-[#002529]">
            Climat Social, Alertes & Santé du Pôle
          </h2>
          <p className="text-xs text-[#66736F] mt-1">
            Indicateurs de charge, respect des SLA et répartition des sollicitations collaborateurs.
          </p>
        </div>
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-[#E5E0D8] text-xs font-semibold text-[#151D19] hover:bg-[#F3FBF5]"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Retour au Tableau de bord</span>
        </button>
      </div>

      {/* Grid of indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-white border border-[#E5E0D8] shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-[#66736F]">Indice de tension réseau</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-['DM_Serif_Display'] text-3xl text-[#BA1A1A]">Modéré (32%)</span>
            </div>
          </div>
          <p className="text-xs text-[#414849] mt-3">
            Lié aux micro-coupures de l'Étage 3 et de la prise Compta RJ-04.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-[#E5E0D8] shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-[#66736F]">Délai moyen de prise en charge</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-['DM_Serif_Display'] text-3xl text-[#146C48]">16 minutes</span>
            </div>
          </div>
          <p className="text-xs text-[#146C48] font-medium mt-3">
            Conforme à la cible conventionnelle (&lt; 30 minutes).
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-[#E5E0D8] shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-[#66736F]">Taux d'adhésion au protocole confidentiel</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-['DM_Serif_Display'] text-3xl text-[#002529]">100%</span>
            </div>
          </div>
          <p className="text-xs text-[#66736F] mt-3">
            Chiffrement de bout en bout appliqué sans fuite de métadonnées.
          </p>
        </div>
      </div>

      {/* Breakdown by Category */}
      <div className="p-5 rounded-lg bg-white border border-[#E5E0D8] shadow-sm flex flex-col gap-3">
        <h3 className="text-sm font-bold text-[#002529]">
          Répartition thématique des préoccupations au pôle
        </h3>
        <div className="space-y-3 pt-2">
          {[
            { label: 'Réseau et Accès Internet', count: 3, percentage: 40, color: 'bg-[#173B3F]' },
            { label: 'Matériel informatique & Équipements', count: 2, percentage: 25, color: 'bg-[#146C48]' },
            { label: 'Logiciels métier et licences ERP', count: 2, percentage: 25, color: 'bg-[#A86412]' },
            { label: 'Sécurité & Suspicion de phishing', count: 1, percentage: 10, color: 'bg-[#BA1A1A]' },
          ].map((cat, i) => (
            <div key={i} className="flex flex-col gap-1 text-xs">
              <div className="flex justify-between">
                <span className="font-medium text-[#151D19]">{cat.label}</span>
                <span className="text-[#66736F]">{cat.count} signalements ({cat.percentage}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#E7F0E9] overflow-hidden">
                <div
                  className={`h-full ${cat.color} rounded-full`}
                  style={{ width: `${cat.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
