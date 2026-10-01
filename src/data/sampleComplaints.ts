import { Complaint } from '../types/complaint';

export const SAMPLE_COMPLAINTS: Complaint[] = [
  {
    id: 'cmp-001',
    ticketNumber: 'TKT-84920',
    customerName: 'Marcus Vance',
    customerEmail: 'm.vance@apexlogistics.io',
    customerTier: 'Enterprise',
    channel: 'Email',
    rawText:
      "URGENT: Our production warehouse API integration has been throwing HTTP 500 errors since 04:30 EST today. Over 4,200 shipping labels have failed to generate, and our morning dispatch trucks are sitting completely stalled at the loading bay. This is directly costing us roughly $14,000 per hour in penalty fees and SLA breaches with our retail partners. If this is not resolved within 60 minutes, we will be forced to pause our contract and seek immediate legal arbitration.",
    submittedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
    status: 'IN_PROGRESS',
    classification: {
      category: 'Technical & System',
      subcategory: 'API 500 Outage / Production Incident',
      urgency: 'CRITICAL',
      urgencyReason:
        'Active enterprise production outage stalling 4,200+ shipments with accrued financial loss of $14k/hr and explicit breach of SLA legal threat.',
      sentiment: 'Furious',
      sentimentScore: -0.92,
      churnRisk: 'High',
      summary:
        'Warehouse shipping API failing with 500 errors since 04:30 EST, stalling loading dock dispatches and threatening $14k/hr contract breach.',
      rootCause:
        'Downstream microservice connection timeout or rate-limit saturation on enterprise label generation cluster.',
      impactScore: 10,
      financialImpact: '$14,000 / hour',
      extractedEntities: {
        orderNumber: 'API-500-DISPATCH',
        accountEmail: 'm.vance@apexlogistics.io',
        productName: 'Enterprise Shipping API v2',
        amount: '$14,000/hr',
      },
      suggestedAction: {
        title: 'Activate P0 Incident Command & Provision Failover Gateway',
        primaryDepartment: 'DevOps / SRE',
        secondaryDepartment: 'Customer Escalations',
        slaTarget: 'Within 30 Minutes',
        recommendedImmediateAction:
          'Page on-call SRE lead immediately via PagerDuty. Route Marcus Vance’s warehouse endpoint to secondary redundant gateway cluster. Dispatch an urgent incident acknowledgement call to their VP of Logistics.',
        compensationSuggested: 'Full monthly enterprise credit + formal post-mortem RCA report within 24 hours.',
        checklist: [
          'Page Tier-3 SRE on-call lead & spin up war room',
          'Reroute traffic to redundant API worker nodes',
          'Verify label generation latency drops below 250ms',
          'Send executive status update email with incident tracking link',
        ],
        customerResponseDraft: `Dear Marcus,

I am writing directly from our Senior Incident Response team. We have identified the severe issue affecting your shipping label generation and have immediately declared this a P0 Critical Incident.

Our Principal Infrastructure Engineers are actively routing your warehouse traffic to our isolated standby cluster right now to restore label printing immediately. I am personally monitoring this until your 4,200 queued dispatches clear.

You will receive an operational update within the next 20 minutes, followed by a direct phone call from our Director of Infrastructure. We sincerely apologize for this unacceptable disruption to your fleet.

Warm regards,
Senior Technical Response Lead`,
        internalEscalationNote:
          'P0 Alert: Apex Logistics ($120k ARR) warehouse blocked. Ingest queue overloaded. Check Redis cache cluster node 4.',
      },
    },
  },
  {
    id: 'cmp-002',
    ticketNumber: 'TKT-84921',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma91@gmail.com',
    customerTier: 'VIP / Premium',
    channel: 'Twitter / X',
    rawText:
      "@ComplaintPulse I was charged ₹24,999 twice for my Annual Pro renewal on my HDFC credit card yesterday (Trans ID #TXN-902319), but my account is still showing as 'Expired Free Plan'! Your chatbot keeps looping me in circles. Please reverse the duplicate charge immediately and activate my plan, or I'm filing a grievance with consumer forum.",
    submittedAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(), // 75 mins ago
    status: 'NEW',
    classification: {
      category: 'Billing & Payments',
      subcategory: 'Unauthorized Duplicate Charge & Entitlement Lock',
      urgency: 'HIGH',
      urgencyReason:
        'Double debit of significant amount (₹24,999 x 2) coupled with unprovisioned service and public social media escalation.',
      sentiment: 'Frustrated',
      sentimentScore: -0.78,
      churnRisk: 'High',
      summary:
        'Customer was billed twice for Annual Pro subscription (₹24,999 x 2) with transaction #TXN-902319, but tier failed to activate and chatbot was unresponsive.',
      rootCause:
        'Payment gateway webhook desynchronization: payment captured twice by merchant acquirer without triggering entitlement provisioning listener.',
      impactScore: 8,
      financialImpact: '₹24,999 (Duplicate Debit)',
      extractedEntities: {
        orderNumber: 'TXN-902319',
        accountEmail: 'priya.sharma91@gmail.com',
        productName: 'Annual Pro Renewal',
        amount: '₹24,999 (x2)',
      },
      suggestedAction: {
        title: 'Initiate Instant Duplicate Refund & Manual Pro Tier Activation',
        primaryDepartment: 'Billing Ops',
        secondaryDepartment: 'Social Media Care',
        slaTarget: 'Within 1 Hour',
        recommendedImmediateAction:
          'Look up transaction TXN-902319 in Stripe/Razorpay dashboard. Void the duplicate ₹24,999 charge immediately. Manually upgrade Priya’s account to Annual Pro and append 2 complimentary bonus months.',
        compensationSuggested: '2 bonus months added to Pro plan + waiver of renewal fees.',
        checklist: [
          'Verify double capture in payment gateway console',
          'Process immediate refund of duplicate ₹24,999 debit',
          'Manually activate Annual Pro entitlement flag in user table',
          'Reply to public Twitter thread and DM confirmation with ARN receipt',
        ],
        customerResponseDraft: `Hi Priya,

Thank you for bringing this to our attention, and please accept our sincere apologies for the frustration caused by the duplicate debit and the chatbot loop.

We have thoroughly verified transaction #TXN-902319:
1. The duplicate charge of ₹24,999 has been refunded in full to your HDFC card (Refund ARN #RFD-481023). It typically reflects in 2-4 business days.
2. Your Annual Pro plan has been manually activated right now.
3. As an apology for the hassle, we have credited an additional 2 months to your subscription at no charge.

Please log in and check your updated account. We are here if you need anything further!

Best regards,
Billing Operations Specialist`,
        internalEscalationNote:
          'Double capture reported via Twitter. Refund initiated. Check Razorpay webhook idempotency handler.',
      },
    },
  },
  {
    id: 'cmp-003',
    ticketNumber: 'TKT-84922',
    customerName: 'David K. O’Connor',
    customerEmail: 'd.oconnor@skylineeng.com',
    customerTier: 'Standard',
    channel: 'Support Ticket',
    rawText:
      "My order #ORD-77401 for the Precision Calibration Kit arrived yesterday, but the package was clearly crushed during transit. The outer carton was torn and the glass optical sensor inside is shattered into pieces. We have an inspection scheduled with our client on Thursday and cannot operate without this kit. I need a replacement unit air-shipped with Saturday delivery guaranteed.",
    submittedAt: new Date(Date.now() - 1000 * 60 * 160).toISOString(),
    status: 'NEW',
    classification: {
      category: 'Delivery & Logistics',
      subcategory: 'Transit Damage / Defective Glass Sensor',
      urgency: 'HIGH',
      urgencyReason:
        'Damaged vital hardware with imminent project deadline on Thursday. Timely air-freight replacement is required to prevent customer project delay.',
      sentiment: 'Disappointed',
      sentimentScore: -0.65,
      churnRisk: 'Medium',
      summary:
        'Order #ORD-77401 arrived with crushed packaging and shattered optical sensor; customer urgently needs Saturday air-shipped replacement.',
      rootCause:
        'Inadequate internal foam dunnage combined with rough courier parcel handling.',
      impactScore: 7,
      financialImpact: '$450 (Kit Value)',
      extractedEntities: {
        orderNumber: 'ORD-77401',
        accountEmail: 'd.oconnor@skylineeng.com',
        productName: 'Precision Calibration Kit',
        amount: '$450',
      },
      suggestedAction: {
        title: 'Authorize Priority Express Replacement & Carrier Damage Claim',
        primaryDepartment: 'Logistics & Warehouse',
        secondaryDepartment: 'Quality Assurance',
        slaTarget: 'Within 2 Hours',
        recommendedImmediateAction:
          'Generate expedited zero-dollar replacement order with Next-Day Air freight. Issue a pre-paid FedEx return label for the damaged sensor inspection. File courier claim with FedEx Freight.',
        compensationSuggested: 'Free Priority Overnight Saturday shipping + 20% discount code on replacement spares.',
        checklist: [
          'Create replacement order #ORD-77401-R in warehouse ERP',
          'Assign Saturday delivery flag with Priority Courier',
          'Email customer tracking number and pre-paid return slip',
          'File damage compensation claim with carrier',
        ],
        customerResponseDraft: `Dear David,

Thank you for reaching out and sharing the details regarding order #ORD-77401. I am very sorry to hear that your Precision Calibration Kit arrived damaged in transit. We understand how critical your Thursday inspection deadline is.

We have approved an expedited replacement unit immediately (Order #ORD-77401-R). It is being double-cushioned and prioritized for Next-Day Priority Air dispatch with guaranteed Saturday delivery. 

You will receive an automated tracking link as soon as the courier scans the package at 4 PM today. A pre-paid return label is also attached so you can return the damaged unit at your convenience.

Best regards,
Logistics Care Coordinator`,
        internalEscalationNote:
          'Flag warehouse packaging team regarding foam density on optical sensor line. Claim filed with FedEx.',
      },
    },
  },
  {
    id: 'cmp-004',
    ticketNumber: 'TKT-84923',
    customerName: 'Elena Rostova',
    customerEmail: 'erostova@fintechbridge.eu',
    customerTier: 'Enterprise',
    channel: 'Email',
    rawText:
      "Subject: Formal GDPR Article 17 Data Erasure Request & Privacy Non-Compliance Notice. We submitted our written data deletion request for former employee records 32 days ago (Case ref: #SEC-1092). We have received zero confirmation and your data export tool still lists active user profiles. This exceeds the statutory 30-day GDPR compliance window. If we do not receive a certified Data Deletion Certificate within 48 hours, our Data Protection Officer will lodge an official report with the Irish DPC.",
    submittedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    status: 'IN_PROGRESS',
    classification: {
      category: 'Legal & Compliance',
      subcategory: 'GDPR Article 17 Right to Erasure / Regulatory Non-Compliance',
      urgency: 'CRITICAL',
      urgencyReason:
        'Breach of statutory 30-day GDPR timeline with imminent threat of formal regulatory filing with the Irish Data Protection Commission (DPC).',
      sentiment: 'Concerned',
      sentimentScore: -0.85,
      churnRisk: 'High',
      summary:
        'Customer reports overdue GDPR Article 17 erasure request exceeding 30-day statutory window with threat of formal Irish DPC regulatory filing within 48 hours.',
      rootCause:
        'Backlog in manual data purger pipeline and lack of automated alerting on compliance ticket age.',
      impactScore: 9,
      financialImpact: 'Potential Regulatory Fines (up to 4% global turnover)',
      extractedEntities: {
        orderNumber: 'SEC-1092',
        accountEmail: 'erostova@fintechbridge.eu',
        productName: 'Enterprise Data Platform',
      },
      suggestedAction: {
        title: 'Expedite Database Tombstone Purge & Issue Certified Erasure Letter',
        primaryDepartment: 'Legal & Compliance',
        secondaryDepartment: 'Security Engineering',
        slaTarget: 'Within 2 Hours',
        recommendedImmediateAction:
          'Immediately notify Chief Compliance Officer & Lead Security Engineer. Trigger automated database soft-delete tombstone sweep for tenant #SEC-1092. Generate cryptographic Certificate of Erasure and transmit via encrypted channel.',
        compensationSuggested: 'Direct executive call from Head of Trust & Safety.',
        checklist: [
          'Alert DPO & Compliance Lead of regulatory escalation',
          'Execute cryptographic shredding of specified tenant records',
          'Verify secondary backups are queued for tombstone expiration',
          'Issue signed Data Deletion Certificate under EU GDPR Art 17',
        ],
        customerResponseDraft: `Dear Elena,

Thank you for your follow-up regarding data erasure request #SEC-1092. I am writing to you directly on behalf of our Office of the Data Protection Officer.

We take our regulatory obligations under the GDPR with the highest priority. We apologize sincerely for the delay beyond our standard turnaround window. 

Our engineering team has processed the cryptographic erasure of all specified records from our primary data stores today. Attached to this message is your official Certificate of Data Deletion, signed by our Chief Information Security Officer.

Please let us know if your DPO requires any supplementary documentation.

Sincerely,
Office of the Data Protection Officer`,
        internalEscalationNote:
          'High risk: DPC escalation risk. Audit log of erasure attached to Jira ticket COMP-4401.',
      },
    },
  },
  {
    id: 'cmp-005',
    ticketNumber: 'TKT-84924',
    customerName: 'Samir Patel',
    customerEmail: 'samir.p@patelcrafts.com',
    customerTier: 'Standard',
    channel: 'Live Chat',
    rawText:
      "Hello, I was trying to change my billing currency from USD to INR, but the dropdown only lists EUR and GBP. Can someone guide me on how to do this or if INR is supported for local bank transfer?",
    submittedAt: new Date(Date.now() - 1000 * 60 * 310).toISOString(),
    status: 'TRIAGED',
    classification: {
      category: 'Billing & Payments',
      subcategory: 'Currency Support & Payment Methods Inquiry',
      urgency: 'LOW',
      urgencyReason:
        'Polite informational inquiry about currency settings with no financial loss, system defect, or anger detected.',
      sentiment: 'Neutral',
      sentimentScore: 0.1,
      churnRisk: 'Low',
      summary:
        'Customer inquiring about changing billing currency to INR and whether local bank transfers are supported.',
      rootCause:
        'Account is currently mapped to international billing merchant gateway rather than regional localization switch.',
      impactScore: 2,
      financialImpact: 'None',
      extractedEntities: {
        accountEmail: 'samir.p@patelcrafts.com',
        productName: 'Billing Currency Settings',
      },
      suggestedAction: {
        title: 'Provide Currency Switch Guide & Enable Regional Payment Gateway',
        primaryDepartment: 'Customer Support',
        slaTarget: 'Within 24 Hours',
        recommendedImmediateAction:
          'Send customer direct link to regional billing portal setup and provide standard instructions for INR UPI / NetBanking setup.',
        checklist: [
          'Verify if tenant qualifies for localized INR merchant profile',
          'Provide step-by-step instructions for currency switch',
          'Confirm resolution and offer follow-up assistance',
        ],
        customerResponseDraft: `Hi Samir,

Thank you for contacting us!

Currently, to switch your account currency to INR and enable local payment methods like UPI and NetBanking:
1. Head to Settings > Billing Profile.
2. Select 'Change Country of Tax Residence' and set it to India.
3. The INR option and local payment rails will instantly unlock on your checkout screen.

If you run into any questions while updating your settings, just reply here and I will be happy to assist you!

Best regards,
Customer Success Team`,
        internalEscalationNote:
          'Standard currency FAQ. Suggest adding tooltip on currency selector.',
      },
    },
  },
  {
    id: 'cmp-006',
    ticketNumber: 'TKT-84925',
    customerName: 'Chloe Bennett',
    customerEmail: 'cbennett@pulsemedia.co',
    customerTier: 'VIP / Premium',
    channel: 'App Store Review',
    rawText:
      "1 Star Review: App crashes EVERY SINGLE TIME I try to export high-res video reels on iOS 18.2. I spent 4 hours editing a client promo video and when I hit export at 99% it crashes and wipes out the unsaved transitions! Total waste of money. Fix your buggy update ASAP!!",
    submittedAt: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
    status: 'NEW',
    classification: {
      category: 'Product Quality',
      subcategory: 'iOS 18.2 Video Export Crash / Data Loss',
      urgency: 'HIGH',
      urgencyReason:
        'Severe app crash on latest OS causing customer data loss and high public visibility on App Store with 1-star rating.',
      sentiment: 'Frustrated',
      sentimentScore: -0.82,
      churnRisk: 'High',
      summary:
        'Customer experiencing repeated crashes during high-res video export on iOS 18.2 at 99%, causing project transition loss.',
      rootCause:
        'Memory leak in Metal hardware encoder buffer when rendering 4K 60fps assets on iOS 18.2 runtime.',
      impactScore: 8,
      financialImpact: 'High Churn Risk & App Store Rating Drag',
      extractedEntities: {
        accountEmail: 'cbennett@pulsemedia.co',
        productName: 'iOS Video Reel Export Engine',
      },
      suggestedAction: {
        title: 'Dispatch TestFlight Hotfix & Offer Cloud Rendering Recovery',
        primaryDepartment: 'Technical & System',
        secondaryDepartment: 'Customer Support',
        slaTarget: 'Within 2 Hours',
        recommendedImmediateAction:
          'Reach out to Chloe via App Store developer reply. Invite her to the TestFlight beta build 4.8.1 which patches the iOS 18.2 Metal buffer allocation bug. Offer to render her project on our cloud renderer to save her client timeline.',
        compensationSuggested: '3 months free Pro upgrade + early VIP access to desktop suite.',
        checklist: [
          'Post sympathetic developer response on App Store console',
          'Send TestFlight invitation with build 4.8.1 link',
          'Offer free cloud rendering for damaged client project',
          'Escalate crash logs to Mobile Core team in Sentry',
        ],
        customerResponseDraft: `Hi Chloe,

We are deeply sorry for the crash and the frustration of losing your transitions right before your client deadline. 

Our iOS engineering team identified a memory allocation issue specific to iOS 18.2 during 4K exports. We have an immediate hotfix ready in TestFlight build 4.8.1 that completely resolves this crash.

Furthermore, if your project file is saved, we would love to render it directly on our dedicated cloud servers and email you the finished reel within 1 hour so your client timeline isn't disrupted. Please email us at priority-care@pulsemedia.co with subject 'Chloe iOS Fix'.

Sincerely,
Lead Mobile Product Specialist`,
        internalEscalationNote:
          'Sentry issue #IOS-8819 spiking on 18.2. Mobile team has cherry-picked hotfix to v4.8.1 release candidate.',
      },
    },
  },
];

export const PRESET_COMPLAINT_TEMPLATES = [
  {
    title: 'Double Billing Dispute',
    customerName: 'Ananya Verma',
    customerEmail: 'ananya.v@brightspark.in',
    customerTier: 'Standard' as const,
    channel: 'Email' as const,
    text: "I was billed twice on September 28 for my Pro subscription (Invoice #INV-2024-911 and #INV-2024-912). Both debits of $49 showed up on my Visa statement. Please refund the duplicate transaction and fix your billing ledger.",
  },
  {
    title: 'Cloud Database Connection Refused (P0 Outage)',
    customerName: 'Jordan Reed',
    customerEmail: 'jreed@financesync.com',
    customerTier: 'Enterprise' as const,
    channel: 'Support Ticket' as const,
    text: "CRITICAL INCIDENT: Our production trading analytics dashboard cannot connect to our dedicated PostgreSQL instance. All queries return 'Connection Refused: too many clients (pool exhausted)'. Our automated settlement batch job is blocked and financial trades are queueing up. We need our connection pool limit raised and failover triggered immediately!",
  },
  {
    title: 'Lost Parcel in Logistics Courier Network',
    customerName: 'Carlos Mendoza',
    customerEmail: 'carlos.m@quickdistro.es',
    customerTier: 'VIP / Premium' as const,
    channel: 'Live Chat' as const,
    text: "Tracking number #SP-8829104 has been stuck in 'Departed Sorting Facility' for 9 consecutive days. The package contains custom trade show banners for our convention this Friday. Carrier has no updates. I need an emergency re-print and same-day courier dispatch to our hotel.",
  },
  {
    title: 'Rude Support Agent Escalation',
    customerName: 'Sarah Jenkins',
    customerEmail: 's.jenkins@urbanstyle.org',
    customerTier: 'Standard' as const,
    channel: 'Phone Call' as const,
    text: "I called customer care today regarding a simple return policy question. Agent 'Derek' was extremely dismissive, repeatedly interrupted me, told me 'it's not my job to read the terms to you', and hung up on me mid-sentence. I have never been treated so disrespectfully by a brand.",
  },
  {
    title: 'Account Takeover / Suspicious 2FA Reset',
    customerName: 'Alexandre Dubois',
    customerEmail: 'a.dubois@securecap.fr',
    customerTier: 'Enterprise' as const,
    channel: 'Email' as const,
    text: "SECURITY ALERT: I received an email stating my 2FA authenticator app was removed from my admin account from an unrecognized IP address in Moscow (185.220.101.4). I did NOT request this. I am locked out of my corporate admin workspace. Freeze my account immediately to prevent unauthorized fund transfers!",
  },
  {
    title: 'Polite Feature Suggestion / Minor Feedback',
    customerName: 'Lisa Wong',
    customerEmail: 'lwong@creativestudio.sg',
    customerTier: 'Free' as const,
    channel: 'Email' as const,
    text: "Hello team, I really love using your design canvas tool! Would it be possible to add a shortcut key to toggle dark mode (like Cmd+Shift+D)? It would save a lot of clicks during late night sessions. Keep up the great work!",
  },
];
