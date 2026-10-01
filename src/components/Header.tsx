import React from 'react';
import {
  Sparkles,
  PlusCircle,
  BarChart3,
  Layers,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';

interface HeaderProps {
  onOpenNewComplaintModal: () => void;
  onOpenBatchModal: () => void;
  onOpenAnalyticsModal: () => void;
  onResetSampleData: () => void;
  apiConnected: boolean;
  criticalCount: number;
  totalComplaints: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewComplaintModal,
  onOpenBatchModal,
  onOpenAnalyticsModal,
  onResetSampleData,
  apiConnected,
  criticalCount,
  totalComplaints,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight truncate">
                  ComplaintPulse AI
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                  gemini-3.8-flash
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate hidden md:block">
                AI Category & Urgency Classification • Automated Next-Action Resolution Hub
              </p>
            </div>
          </div>

          {/* Center Badges & Status */}
          <div className="hidden lg:flex items-center gap-3">
            {criticalCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{criticalCount} Critical (P0) Requires Action</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <span
                className={`w-2 h-2 rounded-full ${
                  apiConnected ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-amber-500'
                }`}
              />
              <span>{apiConnected ? 'Gemini API Online' : 'API Connecting...'}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <button
              onClick={onResetSampleData}
              title="Reset to default sample data"
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenAnalyticsModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-all"
            >
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              <span className="hidden sm:inline">Analytics</span>
            </button>

            <button
              onClick={onOpenBatchModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-all"
            >
              <Layers className="w-4 h-4 text-sky-500" />
              <span className="hidden sm:inline">Batch Triage</span>
            </button>

            <button
              onClick={onOpenNewComplaintModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm shadow-indigo-500/30 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Triage Complaint</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
