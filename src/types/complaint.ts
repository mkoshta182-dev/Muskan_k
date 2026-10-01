export type ComplaintCategory =
  | 'Billing & Payments'
  | 'Technical & System'
  | 'Delivery & Logistics'
  | 'Product Quality'
  | 'Customer Support'
  | 'Account & Security'
  | 'Legal & Compliance'
  | 'Policy & Cancellation';

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ComplaintStatus = 'NEW' | 'TRIAGED' | 'IN_PROGRESS' | 'ACTION_TAKEN' | 'RESOLVED';

export type ChannelType = 'Email' | 'Twitter / X' | 'Live Chat' | 'Support Ticket' | 'App Store Review' | 'Phone Call';

export type CustomerTier = 'Enterprise' | 'VIP / Premium' | 'Standard' | 'Free';

export interface ActionChecklistItem {
  id: string;
  task: string;
  completed: boolean;
}

export interface SuggestedAction {
  title: string;
  primaryDepartment: string;
  secondaryDepartment?: string;
  slaTarget: string; // e.g. "Within 1 Hour", "< 4 Hours"
  recommendedImmediateAction: string;
  compensationSuggested?: string;
  checklist: string[];
  customerResponseDraft: string;
  internalEscalationNote: string;
}

export interface ClassificationResult {
  category: ComplaintCategory;
  subcategory: string;
  urgency: UrgencyLevel;
  urgencyReason: string;
  sentiment: 'Furious' | 'Frustrated' | 'Disappointed' | 'Neutral' | 'Concerned';
  sentimentScore: number; // -1.0 to 1.0
  churnRisk: 'High' | 'Medium' | 'Low';
  summary: string;
  rootCause: string;
  impactScore: number; // 1-10
  financialImpact?: string;
  extractedEntities: {
    orderNumber?: string;
    accountEmail?: string;
    productName?: string;
    amount?: string;
  };
  suggestedAction: SuggestedAction;
}

export interface Complaint {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  customerTier: CustomerTier;
  channel: ChannelType;
  rawText: string;
  submittedAt: string;
  status: ComplaintStatus;
  classification?: ClassificationResult;
  assignedTo?: string;
  actionItemsCompleted?: string[];
  customerReplySent?: boolean;
  customerReplyText?: string;
  resolvedAt?: string;
}
