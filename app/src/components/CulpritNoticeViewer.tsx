import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  FileText, 
  AlertTriangle, 
  ShieldAlert, 
  ExternalLink, 
  CheckCircle2, 
  AlertOctagon, 
  HelpCircle, 
  ArrowRight, 
  Clock, 
  Copy, 
  Check,
  User,
  Database
} from 'lucide-react';
import { VendorClaim } from '../types';
import { getPersistedExplanations, SavedExplanation } from '../services/storageService';
import { getSupabaseClient } from '../services/supabaseClient';

interface CulpritNoticeViewerProps {
  claims: VendorClaim[];
  onSelectClaim: (claim: VendorClaim) => void;
  onViewEvidence: (evidenceId: string) => void;
}

export const CulpritNoticeViewer: React.FC<CulpritNoticeViewerProps> = ({
  claims,
  onSelectClaim,
  onViewEvidence
}) => {
  const [activeTab, setActiveTab] = useState<string>('E16');
  const [copied, setCopied] = useState<boolean>(false);
  const [persistedSuspects, setPersistedSuspects] = useState<SavedExplanation[]>([]);

  useEffect(() => {
    // 1. Load from localStorage
    const local = getPersistedExplanations();
    setPersistedSuspects(local);

    // 2. Fetch latest from Supabase if online
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('suspect_explanations').select('*').order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            const mapped: SavedExplanation[] = data.map((d: any) => ({
              id: d.id,
              suspectId: d.suspect_id,
              suspectName: d.suspect_name,
              suspectType: d.suspect_type,
              title: d.title,
              timestamp: new Date(d.created_at).toLocaleString(),
              rawText: d.raw_text,
              claimsCount: d.claims_count || 0,
              adjudicatedClaims: []
            }));
            setPersistedSuspects(mapped);
          }
        });
    }
  }, []);

  const handleCopyNotice = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const e16Text = `Date: Fri, 28 Aug 2026, 18:10 IST
From: security-notices@tallybridge.example
To: accounts@harborfinch.example; it-security@harborfinch.example
Subject: Update: investigation findings and next steps

Dear Customer,
We have completed our investigation of the activity reported in our notice of 21 August. Our findings are summarised below.

What we found:
1. Unauthorised requests were made using a customer connection credential on 11 and 12 August 2026 only.
2. The access was limited to support ticket metadata. We have found no evidence that finance records or stored files were accessed.
3. All temporary export files created during the activity have been removed.
4. The activity originated entirely from outside our network. No systems inside our environment or on the private link were involved.

What we did:
5. Affected credentials were rotated on 24 August 2026.`;

  const e12Text = `Date: Fri, 21 Aug 2026, 14:22 IST
From: security-notices@tallybridge.example
To: accounts@harborfinch.example
Subject: Security incident notification: customer connection credential

Dear Customer,
We are writing to inform you of a security incident that may have affected your integration connection. On 19 August 2026, our automated security monitoring identified anomalous requests associated with your account connection key.

We immediately initiated our containment protocol. Based on our initial assessment, the activity appears to have been confined to API query attempts between 11 and 12 August. We have no reason to believe that data has been compromised.`;

  // Find currently active custom suspect explanation
  const selectedCustom = persistedSuspects.find(s => s.id === activeTab || s.suspectId === activeTab);

  const getDisplayContent = () => {
    if (activeTab === 'E16') {
      return {
        title: 'TallyBridge Software Follow-up Notice (E16)',
        from: 'security-notices@tallybridge.example',
        date: '28 August 2026',
        text: e16Text,
        sourceRef: 'E16_followup_email_notice.pdf',
        isDefault: true
      };
    }
    if (activeTab === 'E12') {
      return {
        title: 'TallyBridge Software Initial Incident Alert (E12)',
        from: 'security-notices@tallybridge.example',
        date: '21 August 2026',
        text: e12Text,
        sourceRef: 'E12_email_notice.pdf',
        isDefault: true
      };
    }
    if (selectedCustom) {
      return {
        title: selectedCustom.title || `${selectedCustom.suspectName} Statement`,
        from: `${selectedCustom.suspectName} (${selectedCustom.suspectType})`,
        date: selectedCustom.timestamp,
        text: selectedCustom.rawText,
        sourceRef: `Case Database: ${selectedCustom.id}`,
        isDefault: false
      };
    }
    return {
      title: 'Formal Notice',
      from: 'Unknown',
      date: 'N/A',
      text: 'No explanation text found.',
      sourceRef: 'N/A',
      isDefault: true
    };
  };

  const activeContent = getDisplayContent();

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="border-b border-[#1e2e4a] pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Mail className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Culprit & Suspect Explanations Cross-Examiner</span>
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                    EXHIBITS & DEPOSITIONS
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Read and cross-examine the verbatim defenses, letters, and interview statements given by all suspects under investigation.
                </p>
              </div>
            </div>
          </div>

          {/* Tab Selector including Default Notices & All Database Suspects */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveTab('E16')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                activeTab === 'E16'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'bg-[#131b2e] text-slate-400 hover:text-white border border-[#1e2e4a]'
              }`}
            >
              E16 Notice (TallyBridge)
            </button>
            <button
              onClick={() => setActiveTab('E12')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                activeTab === 'E12'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'bg-[#131b2e] text-slate-400 hover:text-white border border-[#1e2e4a]'
              }`}
            >
              E12 Initial Alert
            </button>

            {persistedSuspects.map((s) => {
              const isActive = activeTab === s.id || activeTab === s.suspectId;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveTab(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-md'
                      : 'bg-[#131b2e] text-slate-300 hover:text-white border border-[#1e2e4a]'
                  }`}
                >
                  <User className="w-3 h-3 text-cyan-400" />
                  <span className="max-w-[130px] truncate">{s.suspectName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Original Text Simulator (Left 5 Cols) vs Rebuttal Breakdown (Right 7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Letter / Deposition Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0b101d] border border-[#1e2e4a] rounded-xl overflow-hidden shadow-lg">
            {/* Window Bar Chrome */}
            <div className="p-3 bg-[#070b14] border-b border-[#1e2e4a] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="font-mono text-[11px] text-slate-400 ml-1 truncate max-w-[200px]">
                  {activeContent.sourceRef}
                </span>
              </div>
              <button
                onClick={() => handleCopyNotice(activeContent.text)}
                className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 font-mono transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Suspect / Document Metadata */}
            <div className="p-4 border-b border-[#1e2e4a] text-xs font-mono space-y-1.5 bg-[#090d16]">
              <div className="flex text-slate-400">
                <span className="w-20 text-slate-500">Suspect/From:</span>
                <span className="text-amber-300 font-bold truncate">{activeContent.from}</span>
              </div>
              <div className="flex text-slate-400">
                <span className="w-20 text-slate-500">Timestamp:</span>
                <span className="text-slate-300">{activeContent.date}</span>
              </div>
              <div className="flex text-slate-400">
                <span className="w-20 text-slate-500">Exhibit Title:</span>
                <span className="text-slate-200 truncate">{activeContent.title}</span>
              </div>
            </div>

            {/* Document Body */}
            <div className="p-5 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap select-text bg-[#070a12] max-h-[500px] overflow-y-auto">
              {activeContent.text}
            </div>

            <div className="p-3 bg-[#0a0f1d] border-t border-[#1e2e4a] flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">Storage Status:</span>
              <span className="text-emerald-400 font-mono text-xs flex items-center gap-1">
                <Database className="w-3.5 h-3.5" />
                <span>Synced in Supabase</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Sentence-by-Sentence Forensic Adjudication (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <span>Sentence-by-Sentence Forensic Adjudication</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {claims.length} Claims Cross-Checked
            </span>
          </div>

          <div className="space-y-3">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="p-4 rounded-xl bg-[#0c1220] border border-[#1e2e4a] hover:border-slate-700 transition-all space-y-3"
              >
                {/* Statement header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {claim.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        claim.verdict === 'CONTRADICTED'
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          : claim.verdict === 'MIXED'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {claim.verdict}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Certainty: <strong className="text-cyan-400 font-mono">{claim.confidence}%</strong>
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-rose-200/90 pt-1">
                      <span className="text-slate-500 font-normal">What Suspect Stated: </span>
                      <strong className="text-white">"{claim.statement}"</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectClaim(claim)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono shrink-0 cursor-pointer"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* What the Evidence Proves */}
                <div className="p-3 rounded-lg bg-[#070b14] border border-[#19263c] space-y-1.5 text-xs">
                  <div className="font-semibold text-cyan-300 flex items-center gap-1.5 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>What Forensic Records Actually Prove:</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {claim.summary}
                  </p>
                </div>

                {/* Evidence Links */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#19263c]">
                  <span className="text-slate-500 text-[11px] font-mono">Citing Evidence Files:</span>
                  <div className="flex items-center gap-1.5">
                    {claim.supporting_evidence.map((ev) => (
                      <button
                        key={ev}
                        onClick={() => onViewEvidence(ev)}
                        className="text-[10px] font-mono font-bold bg-[#141d2f] hover:bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/40 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>{ev}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
