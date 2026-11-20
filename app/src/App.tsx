import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ClaimVerification } from './components/ClaimVerification';
import { CoastalCaseStudy } from './components/CoastalCaseStudy';
import { EvidenceExplorer } from './components/EvidenceExplorer';
import { IncidentTimeline } from './components/IncidentTimeline';
import { InvestigationReport } from './components/InvestigationReport';
import { IncidentUpload } from './components/IncidentUpload';
import { CulpritNoticeViewer } from './components/CulpritNoticeViewer';
import { AiAssistant } from './components/AiAssistant';
import { EvidenceRelationshipGraph } from './components/EvidenceRelationshipGraph';
import { ThreeStepAuthModal, AuthSession } from './components/ThreeStepAuthModal';

import claimsDataRaw from './data/claims_data.json';
import evidenceCatalogRaw from './data/evidence_catalog.json';
import timelineEventsRaw from './data/timeline_events.json';
import coastalCaseRaw from './data/coastal_case.json';
import sampleRecordsRaw from './data/sample_records.json';

import { VendorClaim, EvidenceItem, TimelineEvent, CoastalCaseData } from './types';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [claims, setClaims] = useState<VendorClaim[]>(claimsDataRaw as VendorClaim[]);
  const [evidenceList] = useState<EvidenceItem[]>(evidenceCatalogRaw as EvidenceItem[]);
  const [timeline] = useState<TimelineEvent[]>(timelineEventsRaw as TimelineEvent[]);
  const [coastalData] = useState<CoastalCaseData>(coastalCaseRaw as CoastalCaseData);
  const [sampleRecords] = useState<Record<string, { fields: string[]; rows: any[] }>>(sampleRecordsRaw);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>('E01');
  const [activeModalClaim, setActiveModalClaim] = useState<VendorClaim | null>(null);

  // 3-Step Verification Auth State
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => {
    try {
      const saved = localStorage.getItem('mirror_auth_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('mirror_auth_session');
    setAuthSession(null);
  };

  // Claim counts for sidebar
  const claimsCount = {
    total: claims.length,
    supported: claims.filter(c => c.verdict === 'SUPPORTED').length,
    contradicted: claims.filter(c => c.verdict === 'CONTRADICTED').length,
    mixed: claims.filter(c => c.verdict === 'MIXED').length,
    unverified: claims.filter(c => c.verdict === 'UNVERIFIED').length,
  };

  const handleViewEvidence = (evidenceId: string) => {
    setSelectedEvidenceId(evidenceId);
    setActiveTab('evidence');
  };

  const handleSelectClaim = (claim: VendorClaim) => {
    setActiveModalClaim(claim);
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden antialiased font-sans transition-colors duration-200 theme-${theme} ${
      theme === 'dark' ? 'bg-[#08090a] text-zinc-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        theme={theme} 
        setTheme={setTheme} 
        claimsCount={claimsCount} 
        officerSession={authSession}
        onLogout={handleLogout}
      />

      {/* 3-Step Verification Modal if not authenticated */}
      {!authSession && (
        <ThreeStepAuthModal
          onSuccess={(session) => setAuthSession(session)}
          theme={theme}
        />
      )}

      {/* Main View Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 dossier-subtle-grid">
        <div className="max-w-7xl mx-auto space-y-6">
          {activeTab === 'dashboard' && (
            <Dashboard 
              claims={claims}
              evidenceList={evidenceList}
              timeline={timeline}
              setActiveTab={setActiveTab}
              onSelectClaim={handleSelectClaim}
            />
          )}

          {activeTab === 'assistant' && (
            <AiAssistant 
              claims={claims}
              coastalData={coastalData}
              evidenceList={evidenceList}
              timeline={timeline}
              onViewEvidence={handleViewEvidence}
            />
          )}

          {activeTab === 'graph' && (
            <EvidenceRelationshipGraph 
              onViewEvidence={handleViewEvidence}
            />
          )}

          {activeTab === 'notices' && (
            <CulpritNoticeViewer
              claims={claims}
              onSelectClaim={handleSelectClaim}
              onViewEvidence={handleViewEvidence}
            />
          )}

          {activeTab === 'upload' && (
            <IncidentUpload 
              onProcessIncident={setClaims}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'claims' && (
            <ClaimVerification 
              claims={claims}
              onSelectClaim={handleSelectClaim}
              onViewEvidence={handleViewEvidence}
            />
          )}

          {activeTab === 'coastal' && (
            <CoastalCaseStudy 
              coastalData={coastalData}
              onViewEvidence={handleViewEvidence}
            />
          )}

          {activeTab === 'evidence' && (
            <EvidenceExplorer 
              evidenceList={evidenceList}
              sampleRecords={sampleRecords}
              selectedEvidenceId={selectedEvidenceId}
              onSelectEvidence={setSelectedEvidenceId}
            />
          )}

          {activeTab === 'timeline' && (
            <IncidentTimeline 
              timeline={timeline}
              onViewEvidence={handleViewEvidence}
            />
          )}

          {activeTab === 'report' && (
            <InvestigationReport 
              claims={claims}
              coastalData={coastalData}
              evidenceList={evidenceList}
              onViewEvidence={handleViewEvidence}
            />
          )}
        </div>
      </main>

      {/* Detail Drilldown Modal */}
      {activeModalClaim && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b101d] border border-[#1e2e4a] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-start justify-between gap-4 border-b border-[#1e2e4a] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    {activeModalClaim.id}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                    activeModalClaim.verdict === 'CONTRADICTED'
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      : activeModalClaim.verdict === 'MIXED'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {activeModalClaim.verdict}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Certainty: <strong className="text-cyan-400">{activeModalClaim.confidence}%</strong>
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-2">
                  "{activeModalClaim.statement}"
                </h3>
              </div>
              <button 
                onClick={() => setActiveModalClaim(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-[#141b2e] border border-[#1e2e4a] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Forensic Finding Summary</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#070b14] p-3.5 rounded-xl border border-[#1e2e4a]">
                {activeModalClaim.summary}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Audit Record Citations</h4>
              <div className="space-y-2">
                {activeModalClaim.details.map((d, i) => (
                  <div key={i} className="text-xs text-slate-300 flex items-start gap-2.5 bg-[#070b14] p-3 rounded-lg border border-[#19263c]">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
                    <span className="leading-relaxed">{d}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300 space-y-1">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <span>Unresolved Forensic Question:</span>
              </div>
              <div className="leading-relaxed text-slate-300">{activeModalClaim.unresolved_questions}</div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#1e2e4a]">
              <div className="flex gap-1.5 flex-wrap">
                {activeModalClaim.supporting_evidence.map(ev => (
                  <button
                    key={ev}
                    onClick={() => {
                      setActiveModalClaim(null);
                      handleViewEvidence(ev);
                    }}
                    className="text-xs font-mono bg-[#111b2d] hover:bg-cyan-950 text-cyan-300 px-2 py-1 rounded border border-[#1e2e4a] hover:border-cyan-700 cursor-pointer transition-colors"
                  >
                    Inspect {ev}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setActiveModalClaim(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
