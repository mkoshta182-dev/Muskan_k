import React, { useState } from 'react';
import { Complaint, ComplaintStatus } from '../types/complaint';
import {
  getUrgencyBadgeStyle,
  getCategoryBadgeStyle,
  getStatusBadgeStyle,
  timeAgo,
} from '../utils/urgencyUtils';
import {
  Sparkles,
  AlertTriangle,
  Clock,
  Building,
  CheckCircle,
  Copy,
  Check,
  Send,
  RefreshCw,
  TrendingDown,
  UserCheck,
  Share2,
  DollarSign,
  FileCheck2,
  ExternalLink,
  ChevronRight,
  Shield,
  MessageCircle,
  ArrowLeft,
} from 'lucide-react';

interface ComplaintDetailProps {
  complaint: Complaint;
  onUpdateComplaint: (updated: Complaint) => void;
  onReclassifyWithGemini: (complaint: Complaint) => Promise<void>;
  isReclassifying: boolean;
  onBackToQueue?: () => void;
}

export const ComplaintDetail: React.FC<ComplaintDetailProps> = ({
  complaint,
  onUpdateComplaint,
  onReclassifyWithGemini,
  isReclassifying,
  onBackToQueue,
}) => {
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [customReplyText, setCustomReplyText] = useState(
    complaint.customerReplyText || complaint.classification?.suggestedAction.customerResponseDraft || ''
  );
  const [isRefiningTone, setIsRefiningTone] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Sync if complaint changes
  React.useEffect(() => {
    setCustomReplyText(
      complaint.customerReplyText || complaint.classification?.suggestedAction.customerResponseDraft || ''
    );
    setActionSuccessMessage(null);
  }, [complaint.id]);

  const classification = complaint.classification;
  const suggestedAction = classification?.suggestedAction;

  const urgencyStyle = getUrgencyBadgeStyle(classification?.urgency || 'MEDIUM');
  const categoryStyle = getCategoryBadgeStyle(classification?.category || 'Customer Support');
  const statusStyle = getStatusBadgeStyle(complaint.status);

  // Toggle checklist item
  const handleToggleChecklist = (taskText: string) => {
    const currentCompleted = complaint.actionItemsCompleted || [];
    const isCompleted = currentCompleted.includes(taskText);
    const updatedCompleted = isCompleted
      ? currentCompleted.filter((t) => t !== taskText)
      : [...currentCompleted, taskText];

    const updated = {
      ...complaint,
      actionItemsCompleted: updatedCompleted,
      status:
        updatedCompleted.length === (suggestedAction?.checklist.length || 0) &&
        suggestedAction?.checklist.length! > 0
          ? ('ACTION_TAKEN' as ComplaintStatus)
          : complaint.status === 'NEW'
          ? ('IN_PROGRESS' as ComplaintStatus)
          : complaint.status,
    };
    onUpdateComplaint(updated);
  };

  // Copy customer draft
  const handleCopyDraft = () => {
    navigator.clipboard.writeText(customReplyText);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  // Copy internal memo
  const handleCopyMemo = () => {
    if (suggestedAction?.internalEscalationNote) {
      navigator.clipboard.writeText(suggestedAction.internalEscalationNote);
      setCopiedMemo(true);
      setTimeout(() => setCopiedMemo(false), 2000);
    }
  };

  // Execute Recommended Action button
  const handleExecuteAction = () => {
    // Check all checklist items
    const allTasks = suggestedAction?.checklist || [];
    const updated: Complaint = {
      ...complaint,
      actionItemsCompleted: allTasks,
      status: 'ACTION_TAKEN',
    };
    onUpdateComplaint(updated);
    setActionSuccessMessage(
      `Workflow triggered: "${suggestedAction?.title}" successfully executed for ${complaint.customerName}.`
    );
    setTimeout(() => setActionSuccessMessage(null), 5000);
  };

  // Mark status
  const handleSetStatus = (newStatus: ComplaintStatus) => {
    const updated: Complaint = {
      ...complaint,
      status: newStatus,
      resolvedAt: newStatus === 'RESOLVED' ? new Date().toISOString() : undefined,
    };
    onUpdateComplaint(updated);
  };

  // Send customer response
  const handleSendResponse = () => {
    const updated: Complaint = {
      ...complaint,
      customerReplySent: true,
      customerReplyText: customReplyText,
      status: complaint.status === 'RESOLVED' ? 'RESOLVED' : 'IN_PROGRESS',
    };
    onUpdateComplaint(updated);
    setActionSuccessMessage(`Customer response sent to ${complaint.customerEmail}!`);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  // Refine reply with Gemini API
  const handleRefineTone = async (tone: string) => {
    if (isRefiningTone) return;
    setIsRefiningTone(true);
    try {
      const response = await fetch('/api/refine-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft: customReplyText,
          tone: tone,
          customerName: complaint.customerName,
          complaintSummary: classification?.summary,
        }),
      });
      const data = await response.json();
      if (data.success && data.refinedDraft) {
        setCustomReplyText(data.refinedDraft);
        onUpdateComplaint({
          ...complaint,
          customerReplyText: data.refinedDraft,
        });
      }
    } catch (err) {
      console.error('Failed to refine reply:', err);
    } finally {
      setIsRefiningTone(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Mobile Back Button */}
      {onBackToQueue && (
        <div className="md:hidden">
          <button
            onClick={onBackToQueue}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs hover:bg-slate-50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Complaints Queue</span>
          </button>
        </div>
      )}

      {/* Top Banner Alert if Action Success */}
      {actionSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-between shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button
            onClick={() => setActionSuccessMessage(null)}
            className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Ticket Header & Metadata */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
                {complaint.ticketNumber}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${urgencyStyle.bg} ${urgencyStyle.border}`}
              >
                <span className={`w-2 h-2 rounded-full ${urgencyStyle.dot}`} />
                <span>{urgencyStyle.label}</span>
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
              >
                {classification?.category}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
              >
                Status: {statusStyle.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Received via {complaint.channel} • {timeAgo(complaint.submittedAt)} ({new Date(complaint.submittedAt).toLocaleTimeString()})
            </p>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onReclassifyWithGemini(complaint)}
              disabled={isReclassifying}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-500 ${isReclassifying ? 'animate-spin' : ''}`} />
              <span>{isReclassifying ? 'Re-analyzing with Gemini...' : 'Re-classify'}</span>
            </button>

            {complaint.status !== 'RESOLVED' ? (
              <button
                onClick={() => handleSetStatus('RESOLVED')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark Resolved</span>
              </button>
            ) : (
              <button
                onClick={() => handleSetStatus('IN_PROGRESS')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <span>Re-open Ticket</span>
              </button>
            )}
          </div>
        </div>

        {/* Customer Information Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Customer Name</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              {complaint.customerName}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Customer Email</span>
            <span className="font-medium text-slate-700 dark:text-slate-300 break-all">
              {complaint.customerEmail}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Account Tier</span>
            <span className="inline-block mt-0.5 font-semibold text-slate-800 dark:text-slate-200">
              {complaint.customerTier}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Resolution SLA</span>
            <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
              <Clock className="w-3 h-3" />
              {suggestedAction?.slaTarget || 'Standard'}
            </span>
          </div>
        </div>
      </div>

      {/* Raw Customer Voice Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 text-slate-500" />
            Inbound Customer Voice (Verbatim)
          </h2>
          <span className="text-[11px] font-medium text-slate-400">
            Channel: {complaint.channel}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans italic relative">
          "{complaint.rawText}"
        </div>

        {/* Extracted Entities Row */}
        {classification?.extractedEntities && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 font-medium">Extracted Entities:</span>
            {classification.extractedEntities.orderNumber && (
              <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-mono">
                Ref: {classification.extractedEntities.orderNumber}
              </span>
            )}
            {classification.extractedEntities.amount && (
              <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold">
                Amount: {classification.extractedEntities.amount}
              </span>
            )}
            {classification.extractedEntities.productName && (
              <span className="px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                Product: {classification.extractedEntities.productName}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Gemini Classification & Triage Intelligence Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Gemini AI Triage Assessment
              </h2>
              <p className="text-xs text-slate-500">
                Category, Urgency Level & Emotional Sentiment Model
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            gemini-3.8-flash
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category & Subcategory Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Classified Category
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {classification?.category}
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              Subcategory: {classification?.subcategory}
            </p>
          </div>

          {/* Urgency & Rationale Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Urgency Assessment
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold ${urgencyStyle.bg}`}
              >
                <span className={`w-2 h-2 rounded-full ${urgencyStyle.dot}`} />
                {classification?.urgency}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Impact: {classification?.impactScore}/10
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
              {classification?.urgencyReason}
            </p>
          </div>

          {/* Sentiment & Churn Risk Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Sentiment & Churn Risk
            </span>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Mood: {classification?.sentiment}
              </span>
              <span
                className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                  classification?.churnRisk === 'High'
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                    : classification?.churnRisk === 'Medium'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {classification?.churnRisk} Churn Risk
              </span>
            </div>

            {/* Sentiment Meter Bar */}
            <div className="space-y-1 pt-1">
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden flex">
                <div
                  className="bg-rose-500 h-full transition-all duration-500"
                  style={{
                    width: `${Math.max(0, Math.min(100, ((- (classification?.sentimentScore || 0) + 1) / 2) * 100))}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Distressed (-1.0)</span>
                <span>Calm (+1.0)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Root Cause Identification */}
        <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Inferred Root Cause & Breakdown Point
          </span>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {classification?.rootCause}
          </p>
        </div>
      </div>

      {/* Suggested Next Action Matrix (Primary Highlight) */}
      <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500/40 rounded-2xl p-5 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Suggested Next Action
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Target SLA: {suggestedAction?.slaTarget}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Assigned Team: <strong className="text-slate-700 dark:text-slate-300">{suggestedAction?.primaryDepartment}</strong>
                {suggestedAction?.secondaryDepartment && ` • Loop in: ${suggestedAction.secondaryDepartment}`}
              </p>
            </div>
          </div>

          <button
            onClick={handleExecuteAction}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Execute Recommended Action</span>
          </button>
        </div>

        {/* Primary Recommended Headline */}
        <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 space-y-2">
          <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
            {suggestedAction?.title}
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {suggestedAction?.recommendedImmediateAction}
          </p>

          {suggestedAction?.compensationSuggested && (
            <div className="pt-1.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
              <span>Recommended Remedy / Compensation: {suggestedAction.compensationSuggested}</span>
            </div>
          )}
        </div>

        {/* Action Checklist Items */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Action Checklist (Execute & Mark Complete)</span>
            <span>
              {(complaint.actionItemsCompleted || []).length} / {suggestedAction?.checklist.length || 0} completed
            </span>
          </div>

          <div className="space-y-2">
            {suggestedAction?.checklist.map((task, idx) => {
              const isChecked = (complaint.actionItemsCompleted || []).includes(task);
              return (
                <label
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleChecklist(task)}
                    className="mt-0.5 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                  />
                  <span
                    className={`text-xs sm:text-sm font-medium leading-tight ${
                      isChecked ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {task}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Customer Response Drafter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              AI-Generated Customer Response
            </h2>
            <p className="text-xs text-slate-500">
              High-empathy, customized draft addressing all complaint nuances
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyDraft}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              {copiedDraft ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Draft</span>
                </>
              )}
            </button>

            <button
              onClick={handleSendResponse}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{complaint.customerReplySent ? 'Re-send Response' : 'Send to Customer'}</span>
            </button>
          </div>
        </div>

        {/* Tone Refinement Pills (Calling Gemini API) */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <span className="text-slate-400 font-medium">Gemini Tone Adjuster:</span>
          {[
            { label: 'Deep Empathy & Apology', tone: 'Deeply empathetic, sincere apology, warm and reassuring' },
            { label: 'Direct & Technical', tone: 'Concise, clear, highly technical explanation with operational timeline' },
            { label: 'Executive Concierge', tone: 'Formal executive letter from Senior Leadership with personal direct contact' },
            { label: 'Add Compensation Offer', tone: 'Include clear goodwill remedy, voucher discount, and expedite delivery' },
            { label: 'Hindi / Hinglish Friendly', tone: 'Warm, respectful bilingual Hindi/English tone suitable for Indian customer service' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => handleRefineTone(item.tone)}
              disabled={isRefiningTone}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              {item.label}
            </button>
          ))}
          {isRefiningTone && (
            <span className="text-[11px] text-indigo-500 font-medium animate-pulse">
              Rewriting with Gemini...
            </span>
          )}
        </div>

        {/* Textarea for editing draft */}
        <textarea
          rows={7}
          value={customReplyText}
          onChange={(e) => setCustomReplyText(e.target.value)}
          className="w-full p-3.5 text-xs sm:text-sm font-sans bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 leading-relaxed resize-y"
          placeholder="Customer reply text..."
        />

        {complaint.customerReplySent && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            <span>Response dispatched to customer email ({complaint.customerEmail})</span>
          </div>
        )}
      </div>

      {/* Internal Handover Memo */}
      {suggestedAction?.internalEscalationNote && (
        <div className="bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Internal Team Memo / Handover Note
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-mono">
              {suggestedAction.internalEscalationNote}
            </p>
          </div>
          <button
            onClick={handleCopyMemo}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0"
            title="Copy internal note"
          >
            {copiedMemo ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
};
