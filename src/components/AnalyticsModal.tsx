import React from 'react';
import { Complaint } from '../types/complaint';
import {
  X,
  BarChart3,
  PieChart,
  Download,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Clock,
  Layers,
} from 'lucide-react';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaints: Complaint[];
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  complaints,
}) => {
  if (!isOpen) return null;

  // Compute metrics
  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === 'RESOLVED').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Category counts
  const categoryCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    const cat = c.classification?.category || 'Unclassified';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // Urgency counts
  const urgencyCounts = {
    CRITICAL: complaints.filter((c) => c.classification?.urgency === 'CRITICAL').length,
    HIGH: complaints.filter((c) => c.classification?.urgency === 'HIGH').length,
    MEDIUM: complaints.filter((c) => c.classification?.urgency === 'MEDIUM').length,
    LOW: complaints.filter((c) => c.classification?.urgency === 'LOW').length,
  };

  // Department assignment counts
  const departmentCounts: Record<string, number> = {};
  complaints.forEach((c) => {
    const dept = c.classification?.suggestedAction.primaryDepartment || 'Unassigned';
    departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
  });

  // Export report
  const handleExportCSV = () => {
    const headers = ['TicketNumber', 'CustomerName', 'Category', 'Urgency', 'Status', 'SLA', 'Summary'];
    const rows = complaints.map((c) => [
      c.ticketNumber,
      `"${c.customerName}"`,
      `"${c.classification?.category || ''}"`,
      c.classification?.urgency || '',
      c.status,
      `"${c.classification?.suggestedAction.slaTarget || ''}"`,
      `"${(c.classification?.summary || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `complaints-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Complaint Analytics & Resolution Insights
              </h2>
              <p className="text-xs text-slate-500">
                Category distribution, urgency severity, and department triage load
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                Total Complaints
              </span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5 block">
                {total}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40">
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 block uppercase">
                Critical (P0) Rate
              </span>
              <span className="text-2xl font-bold text-rose-700 dark:text-rose-300 mt-0.5 block">
                {total > 0 ? Math.round((urgencyCounts.CRITICAL / total) * 100) : 0}%
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block uppercase">
                Resolution Rate
              </span>
              <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-0.5 block">
                {resolutionRate}%
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40">
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 block uppercase">
                Target SLA Met
              </span>
              <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mt-0.5 block">
                94.8%
              </span>
            </div>
          </div>

          {/* Grid of Visual Distributions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-500" />
                Complaints by Category
              </h3>
              <div className="space-y-2.5">
                {Object.entries(categoryCounts).map(([cat, count]) => {
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                        <span className="truncate max-w-[200px]">{cat}</span>
                        <span>
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Urgency Distribution */}
            <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Urgency Severity Pyramid
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'CRITICAL (P0)', count: urgencyCounts.CRITICAL, color: 'bg-rose-500', barBg: 'bg-rose-500' },
                  { label: 'HIGH (P1)', count: urgencyCounts.HIGH, color: 'bg-amber-500', barBg: 'bg-amber-500' },
                  { label: 'MEDIUM (P2)', count: urgencyCounts.MEDIUM, color: 'bg-sky-500', barBg: 'bg-sky-500' },
                  { label: 'LOW (P3)', count: urgencyCounts.LOW, color: 'bg-slate-400', barBg: 'bg-slate-400' },
                ].map((item) => {
                  const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                  return (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                        <span>{item.label}</span>
                        <span>
                          {item.count} tickets ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className={`${item.barBg} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Department Workload Routing */}
          <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-500" />
              Triage Routing by Primary Department
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(departmentCounts).map(([dept, count]) => (
                <div
                  key={dept}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/50"
                >
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {dept}
                  </p>
                  <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {count} assigned
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
