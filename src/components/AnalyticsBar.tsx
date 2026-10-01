import React from 'react';
import { Complaint } from '../types/complaint';
import {
  AlertOctagon,
  Flame,
  CheckCircle2,
  Clock,
  TrendingDown,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';

interface AnalyticsBarProps {
  complaints: Complaint[];
  activeFilterUrgency: string | null;
  onSelectUrgencyFilter: (urgency: string | null) => void;
}

export const AnalyticsBar: React.FC<AnalyticsBarProps> = ({
  complaints,
  activeFilterUrgency,
  onSelectUrgencyFilter,
}) => {
  const total = complaints.length;
  const critical = complaints.filter(
    (c) => c.classification?.urgency === 'CRITICAL' && c.status !== 'RESOLVED'
  ).length;
  const high = complaints.filter(
    (c) => c.classification?.urgency === 'HIGH' && c.status !== 'RESOLVED'
  ).length;
  const medium = complaints.filter(
    (c) => c.classification?.urgency === 'MEDIUM' && c.status !== 'RESOLVED'
  ).length;
  const low = complaints.filter(
    (c) => c.classification?.urgency === 'LOW' && c.status !== 'RESOLVED'
  ).length;
  const resolved = complaints.filter((c) => c.status === 'RESOLVED').length;

  // Calculate most frequent category
  const categoryCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    if (c.classification?.category) {
      categoryCounts[c.classification.category] =
        (categoryCounts[c.classification.category] || 0) + 1;
    }
  });
  const topCategory =
    Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Billing & Payments';

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Card 1: Total Queue */}
          <button
            onClick={() => onSelectUrgencyFilter(null)}
            className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
              activeFilterUrgency === null
                ? 'bg-white dark:bg-slate-800 border-indigo-400 dark:border-indigo-500 shadow-sm ring-1 ring-indigo-500/20'
                : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                Active Queue
              </p>
              <p className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {total - resolved} <span className="text-xs text-slate-400 font-normal">/ {total}</span>
              </p>
            </div>
          </button>

          {/* Card 2: Critical P0 */}
          <button
            onClick={() => onSelectUrgencyFilter(activeFilterUrgency === 'CRITICAL' ? null : 'CRITICAL')}
            className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
              activeFilterUrgency === 'CRITICAL'
                ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-500 shadow-sm ring-1 ring-rose-500/30'
                : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-rose-300'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 relative">
              <AlertOctagon className="w-4 h-4" />
              {critical > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 truncate">
                  Critical (P0)
                </p>
              </div>
              <p className="text-base font-bold text-rose-700 dark:text-rose-300 leading-tight">
                {critical}
              </p>
            </div>
          </button>

          {/* Card 3: High P1 */}
          <button
            onClick={() => onSelectUrgencyFilter(activeFilterUrgency === 'HIGH' ? null : 'HIGH')}
            className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
              activeFilterUrgency === 'HIGH'
                ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500 shadow-sm ring-1 ring-amber-500/30'
                : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-amber-300'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400 truncate">
                High Urgency (P1)
              </p>
              <p className="text-base font-bold text-amber-700 dark:text-amber-300 leading-tight">
                {high}
              </p>
            </div>
          </button>

          {/* Card 4: Medium / Low */}
          <button
            onClick={() =>
              onSelectUrgencyFilter(
                activeFilterUrgency === 'MEDIUM' ? 'LOW' : activeFilterUrgency === 'LOW' ? null : 'MEDIUM'
              )
            }
            className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
              activeFilterUrgency === 'MEDIUM' || activeFilterUrgency === 'LOW'
                ? 'bg-sky-50/80 dark:bg-sky-950/40 border-sky-500 shadow-sm ring-1 ring-sky-500/30'
                : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-sky-300'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-sky-600 dark:text-sky-400 truncate">
                P2 / P3 Backlog
              </p>
              <p className="text-base font-bold text-sky-700 dark:text-sky-300 leading-tight">
                {medium + low}
              </p>
            </div>
          </button>

          {/* Card 5: Top Issue Driver */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-800/60">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                Top Category
              </p>
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
                {topCategory}
              </p>
            </div>
          </div>

          {/* Card 6: Resolved */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-800/60">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                Resolved
              </p>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
                {resolved}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
