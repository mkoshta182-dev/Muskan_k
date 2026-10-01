/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Complaint, CustomerTier, ChannelType } from './types/complaint';
import { SAMPLE_COMPLAINTS } from './data/sampleComplaints';
import { Header } from './components/Header';
import { AnalyticsBar } from './components/AnalyticsBar';
import { ComplaintQueue } from './components/ComplaintQueue';
import { ComplaintDetail } from './components/ComplaintDetail';
import { NewComplaintModal } from './components/NewComplaintModal';
import { BatchTriageModal } from './components/BatchTriageModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { AlertCircle, Inbox } from 'lucide-react';

const STORAGE_KEY = 'complaintpulse_tickets_v1';

export default function App() {
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load from local storage', e);
    }
    return SAMPLE_COMPLAINTS;
  });

  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(() => {
    return SAMPLE_COMPLAINTS[0]?.id || null;
  });

  const [mobileView, setMobileView] = useState<'queue' | 'detail'>('queue');
  const [activeFilterUrgency, setActiveFilterUrgency] = useState<string | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [isReclassifying, setIsReclassifying] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  }, [complaints]);

  // Check backend health
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setApiConnected(Boolean(data?.hasApiKey));
      })
      .catch((err) => {
        console.warn('API health check error:', err);
        setApiConnected(false);
      });
  }, []);

  // Reset to sample data
  const handleResetSampleData = () => {
    if (window.confirm('Reset all complaints to default sample scenarios?')) {
      setComplaints(SAMPLE_COMPLAINTS);
      setSelectedComplaintId(SAMPLE_COMPLAINTS[0]?.id || null);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Update a single complaint in place
  const handleUpdateComplaint = (updated: Complaint) => {
    setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  // Re-classify a complaint with Gemini API
  const handleReclassifyWithGemini = async (complaint: Complaint) => {
    setIsReclassifying(true);
    try {
      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: complaint.rawText,
          customerName: complaint.customerName,
          customerTier: complaint.customerTier,
          channel: complaint.channel,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Classification failed');
      }

      const updated: Complaint = {
        ...complaint,
        classification: data.classification,
        status: complaint.status === 'NEW' ? 'TRIAGED' : complaint.status,
      };

      handleUpdateComplaint(updated);
    } catch (err: any) {
      alert(`Classification error: ${err.message || 'Check Gemini API Key configuration'}`);
    } finally {
      setIsReclassifying(false);
    }
  };

  // Submit and classify a new complaint
  const handleSubmitNewComplaint = async (newComplaintData: {
    customerName: string;
    customerEmail: string;
    customerTier: CustomerTier;
    channel: ChannelType;
    rawText: string;
  }): Promise<boolean> => {
    const res = await fetch('/api/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: newComplaintData.rawText,
        customerName: newComplaintData.customerName,
        customerTier: newComplaintData.customerTier,
        channel: newComplaintData.channel,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to classify with Gemini API.');
    }

    const newTicket: Complaint = {
      id: `cmp-${Date.now()}`,
      ticketNumber: `TKT-${Math.floor(10000 + Math.random() * 90000)}`,
      customerName: newComplaintData.customerName,
      customerEmail: newComplaintData.customerEmail,
      customerTier: newComplaintData.customerTier,
      channel: newComplaintData.channel,
      rawText: newComplaintData.rawText,
      submittedAt: new Date().toISOString(),
      status: 'TRIAGED',
      classification: data.classification,
    };

    setComplaints((prev) => [newTicket, ...prev]);
    setSelectedComplaintId(newTicket.id);
    return true;
  };

  // Batch triage complete
  const handleBatchClassifyComplete = (updatedComplaints: Complaint[]) => {
    setComplaints(updatedComplaints);
  };

  const selectedComplaint = complaints.find((c) => c.id === selectedComplaintId) || complaints[0];
  const criticalCount = complaints.filter(
    (c) => c.classification?.urgency === 'CRITICAL' && c.status !== 'RESOLVED'
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar Header */}
      <Header
        onOpenNewComplaintModal={() => setIsNewModalOpen(true)}
        onOpenBatchModal={() => setIsBatchModalOpen(true)}
        onOpenAnalyticsModal={() => setIsAnalyticsModalOpen(true)}
        onResetSampleData={handleResetSampleData}
        apiConnected={apiConnected}
        criticalCount={criticalCount}
        totalComplaints={complaints.length}
      />

      {/* KPI Status Strip */}
      <AnalyticsBar
        complaints={complaints}
        activeFilterUrgency={activeFilterUrgency}
        onSelectUrgencyFilter={(urgency) => setActiveFilterUrgency(urgency)}
      />

      {/* Main Workspace: Left Queue + Right Resolution Pane */}
      <main className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto shadow-xs border-x border-slate-200 dark:border-slate-800">
        {/* Left Column: Complaint Queue Sidebar */}
        <div
          className={`${
            mobileView === 'queue' ? 'flex' : 'hidden'
          } md:flex flex-col w-full md:w-80 lg:w-96 shrink-0 h-[calc(100vh-125px)]`}
        >
          <ComplaintQueue
            complaints={complaints}
            selectedComplaintId={selectedComplaintId}
            onSelectComplaint={(id) => {
              setSelectedComplaintId(id);
              setMobileView('detail');
            }}
            activeFilterUrgency={activeFilterUrgency}
            onClearUrgencyFilter={() => setActiveFilterUrgency(null)}
          />
        </div>

        {/* Right Column: Complaint Resolution Workstation */}
        <div
          className={`${
            mobileView === 'detail' ? 'flex' : 'hidden'
          } md:flex flex-1 flex-col h-[calc(100vh-125px)] overflow-hidden`}
        >
          {selectedComplaint ? (
            <ComplaintDetail
              complaint={selectedComplaint}
              onUpdateComplaint={handleUpdateComplaint}
              onReclassifyWithGemini={handleReclassifyWithGemini}
              isReclassifying={isReclassifying}
              onBackToQueue={() => setMobileView('queue')}
            />
          ) : (
            <div className="h-full flex items-center justify-center p-8 text-center text-slate-400">
              <div className="space-y-3">
                <Inbox className="w-12 h-12 mx-auto stroke-1" />
                <p className="text-base font-medium">No complaint selected.</p>
                <p className="text-xs text-slate-500">
                  Select a ticket from the left queue to view Gemini's category, urgency assessment, and recommended next actions.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <NewComplaintModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmitNewComplaint={handleSubmitNewComplaint}
      />

      <BatchTriageModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        complaints={complaints}
        onBatchClassifyComplete={handleBatchClassifyComplete}
      />

      <AnalyticsModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
        complaints={complaints}
      />
    </div>
  );
}
