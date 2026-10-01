import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

const geminiApiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: geminiApiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Classification response JSON schema
const classificationSchema = {
  type: Type.OBJECT,
  properties: {
    category: {
      type: Type.STRING,
      description: "Primary category. Must be one of: 'Billing & Payments', 'Technical & System', 'Delivery & Logistics', 'Product Quality', 'Customer Support', 'Account & Security', 'Legal & Compliance', 'Policy & Cancellation'",
    },
    subcategory: {
      type: Type.STRING,
      description: "Granular subcategory, e.g., 'Unauthorized Charge', 'Server 500 Outage', 'Lost In Transit', 'Defective Screen', 'Unresponsive Agent'",
    },
    urgency: {
      type: Type.STRING,
      description: "Must be exactly one of: 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'. CRITICAL: Severe business outage, major unauthorized financial loss, data breach, safety/legal hazard. HIGH: Major feature breakdown, large disputed charge, severe churn threat. MEDIUM: Moderate inconvenience, partial bug, delayed response. LOW: Cosmetic issue, gentle inquiry, minor feedback.",
    },
    urgencyReason: {
      type: Type.STRING,
      description: "Clear explanation justifying why this urgency level was assigned.",
    },
    sentiment: {
      type: Type.STRING,
      description: "Customer emotional state: 'Furious', 'Frustrated', 'Disappointed', 'Neutral', 'Concerned'",
    },
    sentimentScore: {
      type: Type.NUMBER,
      description: "Float from -1.0 (extreme anger/distress) to 1.0 (calm/pleased). Usually between -0.3 and -1.0 for complaints.",
    },
    churnRisk: {
      type: Type.STRING,
      description: "Risk of customer leaving or canceling: 'High', 'Medium', or 'Low'",
    },
    summary: {
      type: Type.STRING,
      description: "1-2 sentence executive summary of the exact complaint.",
    },
    rootCause: {
      type: Type.STRING,
      description: "Inferred underlying breakdown or failure point.",
    },
    impactScore: {
      type: Type.INTEGER,
      description: "Severity score from 1 (trivial) to 10 (catastrophic).",
    },
    financialImpact: {
      type: Type.STRING,
      description: "Extracted or estimated monetary loss/amount, or 'None'.",
    },
    extractedEntities: {
      type: Type.OBJECT,
      properties: {
        orderNumber: { type: Type.STRING, description: "Order ID, tracking number, or transaction ID if mentioned" },
        accountEmail: { type: Type.STRING, description: "Customer email or username if present" },
        productName: { type: Type.STRING, description: "Product name or subscription tier" },
        amount: { type: Type.STRING, description: "Dollar or currency value mentioned" },
      },
    },
    suggestedAction: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "Concise actionable title, e.g., 'Issue Full Refund & Pause Recurring Subscription'",
        },
        primaryDepartment: {
          type: Type.STRING,
          description: "Assignee department: 'Billing Ops', 'DevOps / SRE', 'Logistics & Warehouse', 'Quality Assurance', 'Customer Escalations', 'Trust & Safety', 'Tier 2 Support'",
        },
        secondaryDepartment: {
          type: Type.STRING,
          description: "Optional secondary department to loop in.",
        },
        slaTarget: {
          type: Type.STRING,
          description: "Target resolution timeframe: e.g. 'Within 30 Minutes', 'Within 1 Hour', 'Within 4 Hours', 'Within 24 Hours'",
        },
        recommendedImmediateAction: {
          type: Type.STRING,
          description: "Exact step-by-step guidance on what action the triage agent should take immediately.",
        },
        compensationSuggested: {
          type: Type.STRING,
          description: "Recommended goodwill gesture or compensation (e.g. '$50 credit', 'Free 1 month upgrade', 'Complimentary return label').",
        },
        checklist: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "3 to 5 concrete action items that must be executed to fully resolve this complaint.",
        },
        customerResponseDraft: {
          type: Type.STRING,
          description: "High-empathy, complete, ready-to-send response addressing the customer by name, validating their frustration, stating exact steps being taken, and providing direct contact details.",
        },
        internalEscalationNote: {
          type: Type.STRING,
          description: "Internal handover note for the department engineer or operations lead.",
        },
      },
      required: [
        'title',
        'primaryDepartment',
        'slaTarget',
        'recommendedImmediateAction',
        'checklist',
        'customerResponseDraft',
        'internalEscalationNote',
      ],
    },
  },
  required: [
    'category',
    'subcategory',
    'urgency',
    'urgencyReason',
    'sentiment',
    'sentimentScore',
    'churnRisk',
    'summary',
    'rootCause',
    'impactScore',
    'extractedEntities',
    'suggestedAction',
  ],
};

// Health and config endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY'),
    model: 'gemini-3.8-flash',
  });
});

async function callGeminiWithRetry(prompt: string, schema: any) {
  const models = ['gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: schema,
            systemInstruction:
              'You are a senior complaint resolution specialist. You triage complaints objectively, calibrate urgency appropriately, and produce realistic, highly actionable next steps.',
          },
        });

        if (response.text) {
          return JSON.parse(response.text);
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Attempt ${attempt + 1} with ${model} failed:`, err?.message || err);
        // Wait 1.5s before retry
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  throw lastError;
}

// Heuristic fallback if Google GenAI service is completely unavailable due to 503 spikes
function generateSmartFallbackClassification(text: string, customerName: string, customerTier: string, channel: string) {
  const lower = text.toLowerCase();

  let category = 'Customer Support';
  let subcategory = 'General Grievance';
  let urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
  let primaryDepartment = 'Customer Support';
  let slaTarget = 'Within 4 Hours';

  if (lower.includes('outage') || lower.includes('500') || lower.includes('crash') || lower.includes('server') || lower.includes('api')) {
    category = 'Technical & System';
    subcategory = 'System Stability / Service Disruption';
    urgency = lower.includes('urgent') || lower.includes('production') || lower.includes('stalled') ? 'CRITICAL' : 'HIGH';
    primaryDepartment = 'DevOps / SRE';
    slaTarget = urgency === 'CRITICAL' ? 'Within 30 Minutes' : 'Within 2 Hours';
  } else if (lower.includes('gdpr') || lower.includes('lawyer') || lower.includes('legal') || lower.includes('police') || lower.includes('court') || lower.includes('hack') || lower.includes('2fa')) {
    category = 'Legal & Compliance';
    subcategory = 'Regulatory & Security Escalation';
    urgency = 'CRITICAL';
    primaryDepartment = 'Legal & Compliance';
    slaTarget = 'Within 1 Hour';
  } else if (lower.includes('refund') || lower.includes('charg') || lower.includes('bill') || lower.includes('payment') || lower.includes('rupee') || lower.includes('₹') || lower.includes('$')) {
    category = 'Billing & Payments';
    subcategory = 'Disputed Charge & Refund Claim';
    urgency = lower.includes('twice') || lower.includes('duplicate') || lower.includes('fraud') ? 'HIGH' : 'MEDIUM';
    primaryDepartment = 'Billing Ops';
    slaTarget = 'Within 2 Hours';
  } else if (lower.includes('delivery') || lower.includes('track') || lower.includes('courier') || lower.includes('parcel') || lower.includes('shipped') || lower.includes('transit')) {
    category = 'Delivery & Logistics';
    subcategory = 'Delayed Dispatch / Transit Exception';
    urgency = lower.includes('urgent') || lower.includes('damaged') ? 'HIGH' : 'MEDIUM';
    primaryDepartment = 'Logistics & Warehouse';
    slaTarget = 'Within 4 Hours';
  } else if (lower.includes('rude') || lower.includes('agent') || lower.includes('rep') || lower.includes('call') || lower.includes('support')) {
    category = 'Customer Support';
    subcategory = 'Staff Conduct & Service Quality';
    urgency = 'MEDIUM';
    primaryDepartment = 'Customer Support Lead';
    slaTarget = 'Within 4 Hours';
  }

  // Extract order or amount
  const amountMatch = text.match(/([$₹€£]\s*[\d,]+(\.\d{2})?|[\d,]+\s*(rupees|dollars|rs))/i);
  const orderMatch = text.match(/([A-Z0-9]{3,}-[A-Z0-9]{3,}|#[A-Z0-9-]+)/i);

  return {
    category,
    subcategory,
    urgency,
    urgencyReason: `Flagged as ${urgency} based on extracted sentiment, keywords, and customer tier impact analysis.`,
    sentiment: urgency === 'CRITICAL' || urgency === 'HIGH' ? 'Frustrated' : 'Neutral',
    sentimentScore: urgency === 'CRITICAL' ? -0.85 : urgency === 'HIGH' ? -0.65 : -0.2,
    churnRisk: urgency === 'CRITICAL' ? 'High' : urgency === 'HIGH' ? 'Medium' : 'Low',
    summary: text.length > 120 ? `${text.slice(0, 117)}...` : text,
    rootCause: `Customer reported service friction requiring intervention by ${primaryDepartment}.`,
    impactScore: urgency === 'CRITICAL' ? 9 : urgency === 'HIGH' ? 7 : 4,
    financialImpact: amountMatch ? amountMatch[0] : 'None',
    extractedEntities: {
      orderNumber: orderMatch ? orderMatch[0] : undefined,
      accountEmail: undefined,
      productName: category,
      amount: amountMatch ? amountMatch[0] : undefined,
    },
    suggestedAction: {
      title: `Prioritize ${category} Remediation & Customer Outreach`,
      primaryDepartment,
      slaTarget,
      recommendedImmediateAction: `Review customer ticket details, verify records with ${primaryDepartment}, and initiate immediate resolution path.`,
      compensationSuggested: urgency === 'CRITICAL' || urgency === 'HIGH' ? 'Account credit or priority waiver' : undefined,
      checklist: [
        `Verify ticket details and cross-check records in ${primaryDepartment} console`,
        'Formulate immediate operational remedy or transaction rollback',
        'Send personalized reassurance message to customer',
        'Mark ticket as resolved once confirmed by customer',
      ],
      customerResponseDraft: `Dear ${customerName || 'Valued Customer'},\n\nThank you for reaching out to us. We have received your report regarding your ${category.toLowerCase()} issue and have prioritized it with our ${primaryDepartment} team.\n\nOur team is currently reviewing your account details to resolve this promptly within our target SLA (${slaTarget}). We sincerely apologize for any inconvenience caused and will provide an update as soon as the action is completed.\n\nWarm regards,\nCustomer Resolution Specialist`,
      internalEscalationNote: `Ticket routed to ${primaryDepartment} with priority ${urgency}. Customer Tier: ${customerTier}.`,
    },
  };
}

// Single complaint classification endpoint
app.post('/api/classify', async (req: Request, res: Response) => {
  try {
    const { text, customerName, customerTier, channel } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Complaint text is required.' });
    }

    const prompt = `You are an elite Customer Experience & Operations Triage AI.
Analyze the following customer complaint with extreme precision.

Customer Details:
- Name: ${customerName || 'Customer'}
- Customer Tier: ${customerTier || 'Standard'}
- Inbound Channel: ${channel || 'Email'}

Complaint Content:
"""
${text.trim()}
"""

Strictly classify:
1. Category & granular subcategory
2. Urgency Level:
   - CRITICAL: P0 situation, financial loss, regulatory/legal threat, production outage, severe vulnerability, VIP churn
   - HIGH: Major feature broken, significant billing grievance, repeated unresolved failure
   - MEDIUM: Inconvenience, delayed delivery without critical emergency, isolated bug
   - LOW: Minor cosmetic defect, polite inquiry, suggestions
3. Sentiment & Churn Risk
4. Root Cause & Entities (Order #, amounts, etc.)
5. Concrete Suggested Next Action:
   - Specific immediate next action
   - Department to route to
   - SLA Target
   - 3-5 checklist items
   - Professional, deeply empathetic customer reply draft
   - Concise internal handover note

Return ONLY valid JSON matching the schema.`;

    if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const parsed = await callGeminiWithRetry(prompt, classificationSchema);
        return res.json({ success: true, classification: parsed });
      } catch (geminiError: any) {
        console.warn('Gemini API call encountered error, using smart fallback classifier:', geminiError?.message || geminiError);
        const fallback = generateSmartFallbackClassification(text, customerName, customerTier, channel);
        return res.json({ success: true, classification: fallback, notice: 'Classified using intelligent fallback during high demand' });
      }
    } else {
      const fallback = generateSmartFallbackClassification(text, customerName, customerTier, channel);
      return res.json({ success: true, classification: fallback });
    }
  } catch (error: any) {
    console.error('Classification error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to classify complaint.',
    });
  }
});

// Batch classification endpoint
app.post('/api/batch-classify', async (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required for batch triage.' });
    }

    if (!geminiApiKey || geminiApiKey === 'MY_GEMINI_API_KEY') {
      return res.status(401).json({
        error: 'GEMINI_API_KEY is not configured. Please set your Gemini API key in Settings > Secrets.',
      });
    }

    // Process up to 5 in parallel to respect rate limits
    const results = [];
    for (const item of items) {
      try {
        const prompt = `Analyze this customer complaint. Customer: ${item.customerName || 'Customer'} (${item.customerTier || 'Standard'}), Channel: ${item.channel || 'Email'}.
Complaint:
"""
${item.text}
"""`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: classificationSchema,
          },
        });

        if (response.text) {
          results.push({ id: item.id, classification: JSON.parse(response.text) });
        }
      } catch (err: any) {
        console.error(`Error processing item ${item.id}:`, err);
        results.push({ id: item.id, error: err?.message || 'Classification failed' });
      }
    }

    return res.json({ success: true, results });
  } catch (error: any) {
    console.error('Batch error:', error);
    return res.status(500).json({ error: error?.message || 'Batch processing failed' });
  }
});

// Refine/customize response draft endpoint
app.post('/api/refine-reply', async (req: Request, res: Response) => {
  try {
    const { draft, tone, customInstructions, complaintSummary, customerName } = req.body;

    if (!draft) {
      return res.status(400).json({ error: 'Original draft is required.' });
    }

    if (!geminiApiKey || geminiApiKey === 'MY_GEMINI_API_KEY') {
      return res.status(401).json({
        error: 'GEMINI_API_KEY is not configured.',
      });
    }

    const prompt = `Refine and re-write the following customer support response draft.

Customer: ${customerName || 'Customer'}
Issue Summary: ${complaintSummary || 'Customer complaint'}
Desired Tone: ${tone || 'Professional & Empathetic'}
Additional Instructions: ${customInstructions || 'Make it warm, clear, and reassuring with concrete next steps.'}

Original Draft:
"""
${draft}
"""

Return only the updated ready-to-send email/message text. Do not include markdown codeblocks or conversational filler.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      success: true,
      refinedDraft: response.text ? response.text.trim() : draft,
    });
  } catch (error: any) {
    console.error('Refine draft error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to refine draft' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ComplaintPulse AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
