import React, { useState } from 'react';
import { Complaint } from '../types/complaint';
import {
  X,
  Layers,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface BatchTriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaints: Complaint[];
  onBatchClassifyComplete: (updatedComplaints: Complaint[]) => void;
}

export const BatchTriageModal: React.FC<BatchTriageModalProps> = ({
  isOpen,
  onClose,
  complaints,
  onBatchClassifyComplete,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunBatch = async () => {
    setIsProcessing(true);
    setErrorText(null);
    setProgress(10);
    setStatusText('Sending complaints payload to Gemini API...');

    try {
      const payload = complaints.map((c) => ({
        id: c.id,
        text: c.rawText,
        customerName: c.customerName,
        customerTier: c.customerTier,
        channel: c.channel,
      }));

      const res = await fetch('/api/batch-classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payload }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Batch triage failed.');
      }

      setProgress(90);
      setStatusText('Updating local queue state...');

      const resultsMap = new Map();
      data.results.forEach((r: any) => {
        if (r.classification) {
          resultsMap.set(r.id, r.classification);
        }
      });

      const updated = complaints.map((c) => {
        if (resultsMap.has(c.id)) {
          return {
            ...c,
            classification: resultsMap.get(c.id),
            status: c.status === 'NEW' ? ('TRIAGED' as const) : c.status,
          };
        }
        return c;
      });

      setProgress(100);
      setStatusText('All complaints triaged successfully!');
      setTimeout(() => {
        onBatchClassifyComplete(updated);
        setIsProcessing(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setErrorText(err?.message || 'Failed to complete batch triage.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Batch AI Complaint Triage
              </h2>
              <p className="text-xs text-slate-500">
                Run Gemini classification across all {complaints.length} tickets in queue
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Batch triage uses <strong>Gemini 3.8 Flash</strong> to evaluate each complaint’s text, categorize it into primary & sub-categories, score urgency (CRITICAL to LOW), calculate churn risk, and synthesize tailored next-step actions.
          </p>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Queue Status:</span>
              <span>{complaints.length} Total Complaints</span>
            </div>
            <div className="text-xs text-slate-500">
              Model: <span className="font-mono text-indigo-600 dark:text-indigo-400">gemini-3.8-flash</span>
            </div>
          </div>

          {/* Progress Bar when running */}
          {isProcessing && (
            <div className="space-y-2 py-2">
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                <span>{statusText}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorText && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorText}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleRunBatch}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Batch...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start Batch Triage</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
