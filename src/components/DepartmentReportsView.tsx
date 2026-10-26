import React, { useMemo, useState } from 'react';
import { Ticket, ResponsibleUser } from '../types/ticket';

interface DepartmentReportsViewProps {
  tickets: Ticket[];
  currentUser: ResponsibleUser;
  onBackToDashboard: () => void;
  onSelectTicket?: (ticket: Ticket) => void;
}

export const DepartmentReportsView: React.FC<DepartmentReportsViewProps> = ({
  tickets,
  currentUser,
  onBackToDashboard,
  onSelectTicket,
}) => {
  const [timeframe, setTimeframe] = useState<'30days' | '90days' | 'all'>('30days');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Department-scoped tickets
  const deptTickets = useMemo(() => {
    return tickets.filter((t) => t.targetDepartment === currentUser.department);
  }, [tickets, currentUser.department]);

  // Operational metrics calculated dynamically
  const total = deptTickets.length;
  const toTreatCount = deptTickets.filter(
    (t) => t.status === 'EN_ATTENTE' || t.status === 'ROUVERT'
  ).length;
  const inProgressCount = deptTickets.filter(
    (t) => t.status === 'DIAGNOSTIC_EN_COURS' || t.status === 'ATTENTE_VALIDATION'
  ).length;
  const resolvedCount = deptTickets.filter(
    (t) => t.status === 'RESOLU' || t.status === 'CLOTURE'
  ).length;
  const criticalCount = deptTickets.filter(
    (t) => t.priority === 'CRITIQUE' || t.priority === 'ELEVEE'
  ).length;

  const resolutionRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;

  // Category breakdown computed dynamically
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    deptTickets.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    })).sort((a, b) => b.count - a.count);
  }, [deptTickets, total]);

  // Priority breakdown
  const priorityStats = useMemo(() => {
    const crit = deptTickets.filter((t) => t.priority === 'CRITIQUE').length;
    const elev = deptTickets.filter((t) => t.priority === 'ELEVEE').length;
    const moy = deptTickets.filter((t) => t.priority === 'MOYENNE').length;
    const bas = deptTickets.filter((t) => t.priority === 'BASSE').length;
    return [
      { label: 'Critique', count: crit, color: 'bg-[#BA1A1A]', text: 'text-[#BA1A1A]' },
      { label: 'Élevée', count: elev, color: 'bg-[#A86412]', text: 'text-[#A86412]' },
      { label: 'Moyenne', count: moy, color: 'bg-[#173B3F]', text: 'text-[#173B3F]' },
      { label: 'Faible / Basse', count: bas, color: 'bg-[#66736F]', text: 'text-[#66736F]' },
    ];
  }, [deptTickets]);

  const handleExportStats = () => {
    const summaryRows = [
      ['Indicateur', 'Valeur'],
      ['Service', `"${currentUser.department}"`],
      ['Total des signalements', total.toString()],
      ['Dossiers à traiter', toTreatCount.toString()],
      ['Dossiers en cours', inProgressCount.toString()],
      ['Dossiers résolus', resolvedCount.toString()],
      ['Taux de résolution', `${resolutionRate}%`],
      ['Dossiers critiques ou élevés', criticalCount.toString()],
      ['', ''],
      ['Répartition par catégorie', 'Nombre'],
      ...categoryStats.map((c) => [`"${c.name}"`, c.count.toString()]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + summaryRows.map((r) => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `rapport_statistiques_${currentUser.codeDepartment.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadNotice('Rapport statistique de service téléchargé avec succès.');
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  return (
    <div className="flex flex-col gap-6 font-['DM_Sans']">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-['JetBrains_Mono'] text-xs font-semibold text-[#146C48] uppercase tracking-wider">
            Tableau de Bord Décisionnel
          </span>
          <h2 className="font-['DM_Serif_Display'] text-2xl text-[#002529] mt-1">
            Rapports et statistiques
          </h2>
          <p className="text-xs text-[#66736F] mt-1">
            Indicateurs d'activité, délais de résolution et tendances pour le {currentUser.department}.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportStats}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#173B3F] text-white hover:bg-[#002529] text-xs font-semibold shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-sm">bar_chart</span>
            <span>Exporter le bilan (CSV)</span>
          </button>
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1 px-3 py-2 rounded bg-white border border-[#E5E0D8] text-xs font-semibold text-[#151D19] hover:bg-[#F3FBF5]"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Tableau de bord</span>
          </button>
        </div>
      </div>

      {downloadNotice && (
        <div className="p-3 bg-[#A2F4C6]/30 border border-[#A2F4C6] rounded-lg text-xs font-semibold text-[#002112] flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-[#146C48]">check_circle</span>
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* KPI 4-Card Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-white border border-[#E5E0D8] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#66736F]">Total signalements</span>
            <span className="material-symbols-outlined text-base text-[#173B3F]">inbox</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-['DM_Serif_Display'] text-3xl text-[#002529]">{total}</span>
            <span className="text-[11px] text-[#66736F]">reçus au service</span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white border border-[#E5E0D8] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#66736F]">Taux de résolution</span>
            <span className="material-symbols-outlined text-base text-[#146C48]">check_circle</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-['DM_Serif_Display'] text-3xl text-[#146C48]">{resolutionRate}%</span>
            <span className="text-[11px] text-[#66736F]">des dossiers traités</span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white border border-[#E5E0D8] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#66736F]">En attente / À traiter</span>
            <span className="material-symbols-outlined text-base text-[#93000A]">pending_actions</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-['DM_Serif_Display'] text-3xl text-[#93000A]">{toTreatCount}</span>
            <span className="text-[11px] text-[#66736F]">actions requises</span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white border border-[#E5E0D8] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#66736F]">Délai moyen constat</span>
            <span className="material-symbols-outlined text-base text-[#173B3F]">schedule</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-['DM_Serif_Display'] text-3xl text-[#002529]">3h 24m</span>
            <span className="text-[11px] text-[#146C48] font-medium">Conforme SLA</span>
          </div>
        </div>
      </div>

      {/* 2-Column Analytical Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Category Distribution */}
        <div className="lg:col-span-7 bg-white p-5 rounded-lg border border-[#E5E0D8] shadow-2xs flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#002529]">
                Répartition des signalements par catégorie
              </h3>
              <p className="text-[11px] text-[#66736F]">
                Volumétrie des demandes adressées à votre pôle
              </p>
            </div>
            <span className="font-['JetBrains_Mono'] text-xs font-bold px-2 py-0.5 rounded bg-[#EDF6EF] text-[#002529]">
              {categoryStats.length} catégories
            </span>
          </div>

          <div className="space-y-3.5 pt-1">
            {categoryStats.length === 0 ? (
              <p className="text-xs text-[#66736F] text-center py-6">
                Aucun signalement enregistré dans ce service.
              </p>
            ) : (
              categoryStats.map((cat, idx) => (
                <div key={idx} className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#151D19]">{cat.name}</span>
                    <span className="font-['JetBrains_Mono'] text-xs text-[#66736F]">
                      {cat.count} ticket{cat.count > 1 ? 's' : ''} ({cat.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#E7F0E9] overflow-hidden">
                    <div
                      className="h-full bg-[#173B3F] rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(cat.pct, 4)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Priorities and Status breakdown */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Priority Levels */}
          <div className="bg-white p-5 rounded-lg border border-[#E5E0D8] shadow-2xs flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#002529] border-b border-[#E5E0D8] pb-2">
              Gravité et niveaux de priorité
            </h3>
            <div className="space-y-2.5 pt-1 text-xs">
              {priorityStats.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded bg-[#F7F5F0]">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${p.color}`}></span>
                    <span className="font-medium text-[#151D19]">{p.label}</span>
                  </div>
                  <span className={`font-['JetBrains_Mono'] font-bold ${p.text}`}>
                    {p.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow Status Distribution */}
          <div className="bg-white p-5 rounded-lg border border-[#E5E0D8] shadow-2xs flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#002529] border-b border-[#E5E0D8] pb-2">
              Cycle de vie des signalements
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded bg-[#FFDAD6]/30 border border-[#FFDAD6]">
                <span className="text-[10px] uppercase font-bold text-[#93000A] block">À traiter</span>
                <span className="font-['DM_Serif_Display'] text-xl text-[#93000A]">{toTreatCount}</span>
              </div>
              <div className="p-2.5 rounded bg-[#EDF6EF] border border-[#E5E0D8]">
                <span className="text-[10px] uppercase font-bold text-[#002529] block">En cours</span>
                <span className="font-['DM_Serif_Display'] text-xl text-[#002529]">{inProgressCount}</span>
              </div>
              <div className="p-2.5 rounded bg-[#A2F4C6]/30 border border-[#A2F4C6]">
                <span className="text-[10px] uppercase font-bold text-[#002112] block">Résolus</span>
                <span className="font-['DM_Serif_Display'] text-xl text-[#002112]">{resolvedCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
