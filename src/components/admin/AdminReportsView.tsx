import React, { useState, useMemo } from 'react';
import {
  CategoryAttribution,
  DepartmentRecord,
} from '../../types/admin';
import { Ticket } from '../../types/ticket';

interface AdminReportsViewProps {
  tickets: Ticket[];
  categories: CategoryAttribution[];
  departments: DepartmentRecord[];
}

const REFERENCE_DATE_MS = new Date('2026-10-24T23:59:59.000Z').getTime();

const PERIOD_LABELS: Record<'30D' | 'Q4' | 'YEAR', string> = {
  '30D': '30 derniers jours (24 Sept. – 24 Oct. 2026)',
  Q4: 'Trimestre en cours (T4 2026)',
  YEAR: 'Exercice 2026 (Mai – Octobre 2026)',
};

export const AdminReportsView: React.FC<AdminReportsViewProps> = ({
  tickets,
  categories,
  departments,
}) => {
  const [periodFilter, setPeriodFilter] = useState<'30D' | 'Q4' | 'YEAR'>('YEAR');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // 1. Period filter
      const createdMs = new Date(t.createdAt).getTime();
      if (!Number.isNaN(createdMs)) {
        if (periodFilter === '30D') {
          const thirtyDaysAgo = REFERENCE_DATE_MS - 30 * 24 * 60 * 60 * 1000;
          if (createdMs < thirtyDaysAgo) return false;
        } else if (periodFilter === 'Q4') {
          const q4Start = new Date('2026-10-01T00:00:00.000Z').getTime();
          if (createdMs < q4Start) return false;
        }
      }

      if (departmentFilter !== 'ALL' && t.targetDepartment !== departmentFilter) {
        return false;
      }
      if (categoryFilter !== 'ALL' && t.category !== categoryFilter) {
        return false;
      }
      if (statusFilter !== 'ALL' && t.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [tickets, periodFilter, departmentFilter, categoryFilter, statusFilter]);

  // Unified status counters — zero double counting
  const totalCount = filteredTickets.length;
  const waitingCount = filteredTickets.filter((t) => t.status === 'EN_ATTENTE').length;
  const reopenedCount = filteredTickets.filter((t) => t.status === 'ROUVERT').length;
  const inProgressCount = filteredTickets.filter(
    (t) => t.status === 'DIAGNOSTIC_EN_COURS' || t.status === 'ATTENTE_VALIDATION'
  ).length;
  const resolvedCount = filteredTickets.filter((t) => t.status === 'RESOLU').length;
  const closedCount = filteredTickets.filter((t) => t.status === 'CLOTURE').length;

  // Compute average resolution hours from resolved/closed tickets
  const avgResolutionHours = useMemo(() => {
    const completed = filteredTickets.filter(
      (t) => (t.status === 'RESOLU' || t.status === 'CLOTURE') && t.resolvedAt
    );
    if (completed.length === 0) return 0;
    const totalHours = completed.reduce((acc, t) => {
      const start = new Date(t.createdAt).getTime();
      const end = new Date(t.resolvedAt!).getTime();
      const diffHours = Math.max(1, (end - start) / (1000 * 60 * 60));
      return acc + diffHours;
    }, 0);
    return Math.round((totalHours / completed.length) * 10) / 10;
  }, [filteredTickets]);

  // 1. Evolution chart data — 100% computed from actual filteredTickets so sum of bars === totalCount
  const monthlySeries = useMemo(() => {
    const months = [
      { key: 4, month: 'Mai', count: 0 },
      { key: 5, month: 'Juin', count: 0 },
      { key: 6, month: 'Juil.', count: 0 },
      { key: 7, month: 'Août', count: 0 },
      { key: 8, month: 'Sept.', count: 0 },
      { key: 9, month: 'Oct.', count: 0 },
    ];

    filteredTickets.forEach((t) => {
      const d = new Date(t.createdAt);
      const m = d.getUTCMonth();
      const bucket = months.find((item) => item.key === m);
      if (bucket) {
        bucket.count += 1;
      } else {
        months[months.length - 1].count += 1;
      }
    });

    if (periodFilter === 'Q4') {
      return months.filter((m) => m.key === 9);
    }
    if (periodFilter === '30D') {
      return months.filter((m) => m.key === 8 || m.key === 9);
    }
    return months;
  }, [filteredTickets, periodFilter]);

  const sumSeries = monthlySeries.reduce((acc, item) => acc + item.count, 0);
  const maxMonthly = Math.max(1, ...monthlySeries.map((m) => m.count));

  // 2. Breakdown by category — exact percentages
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    filteredTickets.forEach((t) => {
      map.set(t.category, (map.get(t.category) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({
        name,
        count,
        pct: totalCount > 0 ? Math.round((count / totalCount) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredTickets, totalCount]);

  // 3 & 4. Breakdown and treatment performance by department
  const departmentPerformance = useMemo(() => {
    const deptNames = Array.from(
      new Set([
        ...departments.map((d) => d.name),
        ...filteredTickets.map((t) => t.targetDepartment),
      ])
    );

    return deptNames
      .map((deptName) => {
        const deptTickets = filteredTickets.filter((t) => t.targetDepartment === deptName);
        const total = deptTickets.length;
        const waiting = deptTickets.filter((t) => t.status === 'EN_ATTENTE').length;
        const reopened = deptTickets.filter((t) => t.status === 'ROUVERT').length;
        const inProg = deptTickets.filter(
          (t) => t.status === 'DIAGNOSTIC_EN_COURS' || t.status === 'ATTENTE_VALIDATION'
        ).length;
        const treated = deptTickets.filter(
          (t) => t.status === 'RESOLU' || t.status === 'CLOTURE'
        ).length;

        return {
          deptName,
          total,
          waiting,
          reopened,
          inProg,
          treated,
          resolutionRate: total > 0 ? Math.round((treated / total) * 100) : 0,
        };
      })
      .filter((d) => d.total > 0);
  }, [departments, filteredTickets]);

  return (
    <div className="flex flex-col gap-6 font-['DM_Sans']">
      {/* En-tête */}
      <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-['DM_Serif_Display'] text-2xl lg:text-3xl text-[#202824]">
            Rapports et statistiques
          </h1>
          <p className="text-sm text-[#66736F] mt-1">
            Analysez l’activité globale et le traitement des signalements ({PERIOD_LABELS[periodFilter]}).
          </p>
        </div>

        {/* Filtres : Période, Département, Catégorie, Statut */}
        <div className="flex flex-wrap items-center gap-2.5 text-[13px]">
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value as '30D' | 'Q4' | 'YEAR')}
            aria-label="Filtrer par période"
            className="px-3 py-2 rounded border border-[#E5E0D8] bg-white text-[#202824]"
          >
            <option value="YEAR">Exercice 2026 (Complet)</option>
            <option value="Q4">Trimestre en cours (T4 2026)</option>
            <option value="30D">30 derniers jours</option>
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filtrer par statut"
            className="px-3 py-2 rounded border border-[#E5E0D8] bg-white text-[#202824]"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="ROUVERT">Rouverts</option>
            <option value="DIAGNOSTIC_EN_COURS">En cours</option>
            <option value="RESOLU">Résolus</option>
            <option value="CLOTURE">Clôturés</option>
          </select>
        </div>
      </div>

      {/* 7 Indicateurs (KPIs) — Somme exacte sans double comptage */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5">
        <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg p-4">
          <span className="text-xs text-[#66736F] font-semibold block">
            Total signalements
          </span>
          <span className="font-['DM_Serif_Display'] text-2xl text-[#202824] tabular-nums mt-2 block">
            {totalCount}
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg p-4">
          <span className="text-xs text-[#66736F] font-semibold block">
            En attente
          </span>
          <span className="font-['DM_Serif_Display'] text-2xl text-[#A86412] tabular-nums mt-2 block">
            {waitingCount}
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg p-4">
          <span className="text-xs text-[#66736F] font-semibold block">
            Rouverts
          </span>
          <span className="font-['DM_Serif_Display'] text-2xl text-[#B42332] tabular-nums mt-2 block">
            {reopenedCount}
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg p-4">
          <span className="text-xs text-[#66736F] font-semibold block">
            En cours
          </span>
          <span className="font-['DM_Serif_Display'] text-2xl text-[#173B3F] tabular-nums mt-2 block">
            {inProgressCount}
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg p-4">
          <span className="text-xs text-[#66736F] font-semibold block">
            Résolus
          </span>
          <span className="font-['DM_Serif_Display'] text-2xl text-[#287A55] tabular-nums mt-2 block">
            {resolvedCount}
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg p-4">
          <span className="text-xs text-[#66736F] font-semibold block">
            Clôturés
          </span>
          <span className="font-['DM_Serif_Display'] text-2xl text-[#202824] tabular-nums mt-2 block">
            {closedCount}
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg p-4">
          <span className="text-xs text-[#66736F] font-semibold block">
            Délai moyen
          </span>
          <span className="font-['DM_Serif_Display'] text-2xl text-[#173B3F] tabular-nums mt-2 block">
            {avgResolutionHours > 0 ? `${avgResolutionHours} h` : '—'}
          </span>
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg p-10 text-center">
          <p className="text-sm font-semibold text-[#202824]">
            Aucun signalement enregistré pour les critères sélectionnés.
          </p>
          <p className="text-xs text-[#66736F] mt-1">
            Modifiez la période ou réinitialisez les filtres pour afficher les données statistiques.
          </p>
          <button
            type="button"
            onClick={() => {
              setPeriodFilter('YEAR');
              setDepartmentFilter('ALL');
              setCategoryFilter('ALL');
              setStatusFilter('ALL');
            }}
            className="mt-4 px-4 py-2 rounded bg-[#173B3F] text-white text-xs font-semibold"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <>
          {/* Graphiques 1 & 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 1. Évolution des signalements */}
            <section className="lg:col-span-6 bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg p-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-[#202824]">
                    1. Évolution des signalements
                  </h2>
                  <p className="text-xs text-[#66736F] mt-0.5">
                    Volume mensuel réel sur la période sélectionnée ({PERIOD_LABELS[periodFilter]}).
                  </p>
                </div>
                <span className="font-['JetBrains_Mono'] text-xs font-semibold text-[#173B3F] bg-[#F7F5F0] px-2.5 py-1 rounded border border-[#E5E0D8] tabular-nums shrink-0">
                  Total : {sumSeries}
                </span>
              </div>

              <div className="mt-6 h-44 flex items-end justify-between gap-4 pt-4 px-2 border-b border-[#E5E0D8]">
                {monthlySeries.map((item) => {
                  const heightPct =
                    item.count === 0
                      ? 4
                      : Math.max(16, Math.round((item.count / maxMonthly) * 100));
                  return (
                    <div
                      key={item.month}
                      className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
                    >
                      <span className="font-['JetBrains_Mono'] text-xs font-semibold text-[#173B3F] tabular-nums">
                        {item.count}
                      </span>
                      <div
                        className="w-full max-w-[44px] bg-[#173B3F] rounded-t transition-all"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between gap-4 px-2 pt-2 text-xs text-[#66736F]">
                {monthlySeries.map((item) => (
                  <span key={item.month} className="flex-1 text-center font-medium">
                    {item.month}
                  </span>
                ))}
              </div>
            </section>

            {/* 2. Répartition par catégorie */}
            <section className="lg:col-span-6 bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg p-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-[#202824]">
                    2. Répartition par catégorie
                  </h2>
                  <p className="text-xs text-[#66736F] mt-0.5">
                    Distribution exacte des {totalCount} signalement(s) par thématique.
                  </p>
                </div>
                <span className="font-['JetBrains_Mono'] text-xs font-semibold text-[#66736F] tabular-nums">
                  100% ({totalCount} dossier{totalCount > 1 ? 's' : ''})
                </span>
              </div>

              <div className="mt-4 space-y-3.5">
                {categoryBreakdown.map((item) => (
                  <div key={item.name} className="text-[13px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-[#202824]">{item.name}</span>
                      <span className="font-['JetBrains_Mono'] text-xs text-[#66736F] tabular-nums">
                        {item.count} dossier{item.count > 1 ? 's' : ''} ({item.pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#F7F5F0] rounded overflow-hidden">
                      <div
                        className="h-full bg-[#173B3F] rounded"
                        style={{ width: `${Math.max(6, item.pct)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Graphiques 3 & 4 : Répartition par département & Performance du traitement */}
          <section className="bg-[#FFFFFF] border border-[#E5E0D8] rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E0D8]">
              <h2 className="text-base font-bold text-[#202824]">
                3 & 4. Répartition par département et performance du traitement
              </h2>
              <p className="text-xs text-[#66736F] mt-0.5">
                Suivi comparatif des volumes reçus, des dossiers en attente, rouverts, en cours et du taux de résolution par service.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E0D8] bg-[#F7F5F0] text-xs font-bold text-[#66736F] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Département</th>
                    <th className="py-3.5 px-4 text-right">Total reçu</th>
                    <th className="py-3.5 px-4 text-right">En attente</th>
                    <th className="py-3.5 px-4 text-right">Rouverts</th>
                    <th className="py-3.5 px-4 text-right">En cours</th>
                    <th className="py-3.5 px-4 text-right">Résolus / Clôturés</th>
                    <th className="py-3.5 px-4 text-right">Taux de résolution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D8] text-[13px]">
                  {departmentPerformance.map((dept) => (
                    <tr key={dept.deptName} className="hover:bg-[#F7F5F0]/60">
                      <td className="py-3.5 px-4 font-semibold text-[#202824]">
                        {dept.deptName}
                      </td>
                      <td className="py-3.5 px-4 text-right font-['JetBrains_Mono'] tabular-nums font-semibold text-[#202824]">
                        {dept.total}
                      </td>
                      <td className="py-3.5 px-4 text-right font-['JetBrains_Mono'] tabular-nums text-[#A86412]">
                        {dept.waiting}
                      </td>
                      <td className="py-3.5 px-4 text-right font-['JetBrains_Mono'] tabular-nums text-[#B42332]">
                        {dept.reopened}
                      </td>
                      <td className="py-3.5 px-4 text-right font-['JetBrains_Mono'] tabular-nums text-[#173B3F]">
                        {dept.inProg}
                      </td>
                      <td className="py-3.5 px-4 text-right font-['JetBrains_Mono'] tabular-nums text-[#287A55] font-semibold">
                        {dept.treated}
                      </td>
                      <td className="py-3.5 px-4 text-right font-['JetBrains_Mono'] tabular-nums font-semibold text-[#173B3F]">
                        {dept.resolutionRate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
