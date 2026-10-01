import React, { useState, useMemo } from 'react';
import { Complaint, ComplaintCategory, UrgencyLevel, ComplaintStatus } from '../types/complaint';
import {
  getUrgencyBadgeStyle,
  getCategoryBadgeStyle,
  getStatusBadgeStyle,
  timeAgo,
} from '../utils/urgencyUtils';
import {
  Search,
  Filter,
  Mail,
  Twitter,
  MessageSquare,
  FileText,
  Smartphone,
  PhoneCall,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface ComplaintQueueProps {
  complaints: Complaint[];
  selectedComplaintId: string | null;
  onSelectComplaint: (id: string) => void;
  activeFilterUrgency: string | null;
  onClearUrgencyFilter: () => void;
}

export const ComplaintQueue: React.FC<ComplaintQueueProps> = ({
  complaints,
  selectedComplaintId,
  onSelectComplaint,
  activeFilterUrgency,
  onClearUrgencyFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ACTIVE'); // 'ALL', 'ACTIVE', 'RESOLVED'

  const channelIcon = (channel: string) => {
    switch (channel) {
      case 'Twitter / X':
        return <Twitter className="w-3.5 h-3.5 text-sky-400" />;
      case 'Live Chat':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />;
      case 'Support Ticket':
        return <FileText className="w-3.5 h-3.5 text-indigo-500" />;
      case 'App Store Review':
        return <Smartphone className="w-3.5 h-3.5 text-purple-500" />;
      case 'Phone Call':
        return <PhoneCall className="w-3.5 h-3.5 text-amber-500" />;
      case 'Email':
      default:
        return <Mail className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // Urgency filter
      if (activeFilterUrgency && c.classification?.urgency !== activeFilterUrgency) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && c.classification?.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus === 'ACTIVE' && c.status === 'RESOLVED') {
        return false;
      }
      if (selectedStatus === 'RESOLVED' && c.status !== 'RESOLVED') {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = c.customerName.toLowerCase().includes(query);
        const matchesTicket = c.ticketNumber.toLowerCase().includes(query);
        const matchesText = c.rawText.toLowerCase().includes(query);
        const matchesSummary = c.classification?.summary.toLowerCase().includes(query);
        const matchesSubcat = c.classification?.subcategory.toLowerCase().includes(query);
        return matchesName || matchesTicket || matchesText || matchesSummary || matchesSubcat;
      }

      return true;
    });
  }, [complaints, activeFilterUrgency, selectedCategory, selectedStatus, searchTerm]);

  const categories: ComplaintCategory[] = [
    'Billing & Payments',
    'Technical & System',
    'Delivery & Logistics',
    'Product Quality',
    'Customer Support',
    'Account & Security',
    'Legal & Compliance',
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Search & Filter Header */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search ticket, customer, keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        {/* Filter Controls Row */}
        <div className="flex items-center gap-2">
          {/* Category Dropdown */}
          <div className="flex-1 relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md py-1.5 px-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setSelectedStatus('ACTIVE')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                selectedStatus === 'ACTIVE'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setSelectedStatus('RESOLVED')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                selectedStatus === 'RESOLVED'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Resolved
            </button>
            <button
              onClick={() => setSelectedStatus('ALL')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                selectedStatus === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* Active Urgency Filter Notice */}
        {activeFilterUrgency && (
          <div className="flex items-center justify-between text-xs px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">
            <span>Filtered by Urgency: <strong>{activeFilterUrgency}</strong></span>
            <button
              onClick={onClearUrgencyFilter}
              className="font-medium hover:underline text-indigo-600 dark:text-indigo-400"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Ticket List Count */}
      <div className="px-4 py-2 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-500 flex items-center justify-between">
        <span>Showing {filteredComplaints.length} tickets</span>
        <span>Sorted by recency</span>
      </div>

      {/* Complaint List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
        {filteredComplaints.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto stroke-1" />
            <p className="text-sm font-medium">No complaints match your filters.</p>
            <p className="text-xs text-slate-400">Try changing category, search term, or clearing urgency filter.</p>
          </div>
        ) : (
          filteredComplaints.map((complaint) => {
            const isSelected = complaint.id === selectedComplaintId;
            const urgency = complaint.classification?.urgency || 'MEDIUM';
            const urgencyStyle = getUrgencyBadgeStyle(urgency);
            const category = complaint.classification?.category || 'Customer Support';
            const categoryStyle = getCategoryBadgeStyle(category);
            const statusStyle = getStatusBadgeStyle(complaint.status);

            return (
              <button
                key={complaint.id}
                onClick={() => onSelectComplaint(complaint.id)}
                className={`w-full p-3.5 text-left transition-all relative flex flex-col gap-2 ${
                  isSelected
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/30 ring-1 ring-inset ring-indigo-500/40'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                {/* Active Indicator Bar */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r" />
                )}

                {/* Top Row: Ticket Number, Tier, Time */}
                <div className="flex items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono font-semibold text-slate-900 dark:text-white truncate">
                      {complaint.ticketNumber}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 dark:text-slate-400 truncate font-medium">
                      {complaint.customerName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-slate-400 text-[11px]">
                    {channelIcon(complaint.channel)}
                    <span>{timeAgo(complaint.submittedAt)}</span>
                  </div>
                </div>

                {/* Middle: Category & Urgency Badges */}
                <div className="flex items-center flex-wrap gap-1.5">
                  {/* Urgency Badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${urgencyStyle.bg} ${urgencyStyle.border}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${urgencyStyle.dot}`} />
                    <span>{urgencyStyle.label}</span>
                  </span>

                  {/* Category Badge */}
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border} truncate max-w-[170px]`}
                  >
                    {category}
                  </span>

                  {/* Tier indicator */}
                  {complaint.customerTier === 'Enterprise' && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      Enterprise
                    </span>
                  )}
                </div>

                {/* Issue Summary Snippet */}
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {complaint.classification?.summary || complaint.rawText}
                </p>

                {/* Bottom row: Recommended action preview & Status */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800/60 text-slate-500">
                  <span className="truncate max-w-[200px] flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="w-3 h-3 shrink-0" />
                    {complaint.classification?.suggestedAction.title || 'Action ready'}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded font-medium text-[10px] ${statusStyle.bg} ${statusStyle.text}`}
                  >
                    {statusStyle.label}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
