import React, { useState } from 'react';
import { Complaint, CustomerTier, ChannelType } from '../types/complaint';
import { PRESET_COMPLAINT_TEMPLATES } from '../data/sampleComplaints';
import {
  X,
  Sparkles,
  Zap,
  User,
  Mail,
  Shield,
  Send,
  Loader2,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface NewComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitNewComplaint: (
    newComplaintData: {
      customerName: string;
      customerEmail: string;
      customerTier: CustomerTier;
      channel: ChannelType;
      rawText: string;
    }
  ) => Promise<boolean>;
}

export const NewComplaintModal: React.FC<NewComplaintModalProps> = ({
  isOpen,
  onClose,
  onSubmitNewComplaint,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerTier, setCustomerTier] = useState<CustomerTier>('Standard');
  const [channel, setChannel] = useState<ChannelType>('Email');
  const [rawText, setRawText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: (typeof PRESET_COMPLAINT_TEMPLATES)[0]) => {
    setCustomerName(preset.customerName);
    setCustomerEmail(preset.customerEmail);
    setCustomerTier(preset.customerTier);
    setChannel(preset.channel);
    setRawText(preset.text);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) {
      setErrorMessage('Please enter the customer complaint text.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const success = await onSubmitNewComplaint({
        customerName: customerName.trim() || 'Valued Customer',
        customerEmail: customerEmail.trim() || 'customer@example.com',
        customerTier,
        channel,
        rawText: rawText.trim(),
      });

      if (success) {
        // Reset
        setCustomerName('');
        setCustomerEmail('');
        setRawText('');
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to triage complaint with Gemini API.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Triage New Complaint with Gemini AI
              </h2>
              <p className="text-xs text-slate-500">
                Classify category & urgency, extract entities, and formulate resolution
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Quick Preset Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Quick-Load Real-World Scenarios
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_COMPLAINT_TEMPLATES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="p-2 text-left rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all text-xs group cursor-pointer"
                >
                  <p className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                    {preset.title}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{preset.customerName}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Customer Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Customer Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Vikram Malhotra"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Customer Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="e.g. v.malhotra@company.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account Tier
              </label>
              <select
                value={customerTier}
                onChange={(e) => setCustomerTier(e.target.value as CustomerTier)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Enterprise">Enterprise ($100k+ ARR)</option>
                <option value="VIP / Premium">VIP / Premium</option>
                <option value="Standard">Standard Paid</option>
                <option value="Free">Free Tier</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Inbound Channel
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as ChannelType)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Email">Email</option>
                <option value="Twitter / X">Twitter / X</option>
                <option value="Live Chat">Live Chat</option>
                <option value="Support Ticket">Support Ticket</option>
                <option value="App Store Review">App Store Review</option>
                <option value="Phone Call">Phone Call Transcript</option>
              </select>
            </div>
          </div>

          {/* Raw Complaint Textarea */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Customer Complaint (Verbatim) *
              </label>
              <span className="text-[10px] text-slate-400">
                Supports English, Hindi, Hinglish, & other languages
              </span>
            </div>
            <textarea
              rows={5}
              required
              placeholder="Paste or write the customer's complaint here (e.g. 'I was charged twice yesterday for invoice #9012 and your app keeps crashing on checkout...')"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full p-3.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
            />
          </div>

          {/* Error Message if any */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !rawText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Classify & Formulate Next Action</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
