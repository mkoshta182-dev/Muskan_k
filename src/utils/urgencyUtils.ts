import { UrgencyLevel, ComplaintCategory, ComplaintStatus } from '../types/complaint';

export function getUrgencyBadgeStyle(urgency: UrgencyLevel): {
  bg: string;
  text: string;
  border: string;
  dot: string;
  label: string;
} {
  switch (urgency) {
    case 'CRITICAL':
      return {
        bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
        text: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-500/30 dark:border-rose-500/40',
        dot: 'bg-rose-500 animate-ping',
        label: 'CRITICAL (P0)',
      };
    case 'HIGH':
      return {
        bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-500/30',
        dot: 'bg-amber-500',
        label: 'HIGH (P1)',
      };
    case 'MEDIUM':
      return {
        bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
        text: 'text-sky-600 dark:text-sky-400',
        border: 'border-sky-500/30',
        dot: 'bg-sky-500',
        label: 'MEDIUM (P2)',
      };
    case 'LOW':
    default:
      return {
        bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-500/30',
        dot: 'bg-slate-400',
        label: 'LOW (P3)',
      };
  }
}

export function getCategoryBadgeStyle(category: ComplaintCategory): {
  bg: string;
  text: string;
  border: string;
} {
  switch (category) {
    case 'Billing & Payments':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-500/20' };
    case 'Technical & System':
      return { bg: 'bg-violet-500/10', text: 'text-violet-700 dark:text-violet-400', border: 'border-violet-500/20' };
    case 'Delivery & Logistics':
      return { bg: 'bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-500/20' };
    case 'Product Quality':
      return { bg: 'bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-500/20' };
    case 'Customer Support':
      return { bg: 'bg-pink-500/10', text: 'text-pink-700 dark:text-pink-400', border: 'border-pink-500/20' };
    case 'Account & Security':
    case 'Legal & Compliance':
      return { bg: 'bg-red-500/10', text: 'text-red-700 dark:text-red-400', border: 'border-red-500/20' };
    default:
      return { bg: 'bg-slate-500/10', text: 'text-slate-700 dark:text-slate-400', border: 'border-slate-500/20' };
  }
}

export function getStatusBadgeStyle(status: ComplaintStatus): {
  bg: string;
  text: string;
  label: string;
} {
  switch (status) {
    case 'NEW':
      return { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', label: 'New' };
    case 'TRIAGED':
      return { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', label: 'Triaged' };
    case 'IN_PROGRESS':
      return { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', label: 'In Progress' };
    case 'ACTION_TAKEN':
      return { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', label: 'Action Taken' };
    case 'RESOLVED':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', label: 'Resolved' };
    default:
      return { bg: 'bg-slate-500/10', text: 'text-slate-600', label: status };
  }
}

export function timeAgo(dateString: string): string {
  const past = new Date(dateString).getTime();
  const diffMs = Date.now() - past;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
