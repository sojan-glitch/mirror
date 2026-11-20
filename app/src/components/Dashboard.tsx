import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertOctagon, 
  HelpCircle, 
  CheckCircle2, 
  Files, 
  Activity, 
  ArrowRight, 
  TrendingDown,
  Building2, 
  Calendar, 
  Lock, 
  ExternalLink,
  Flame,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Radio,
  Mail,
  Copy,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { VendorClaim, EvidenceItem, TimelineEvent } from '../types';

interface DashboardProps {
  claims: VendorClaim[];
  evidenceList: EvidenceItem[];
  timeline: TimelineEvent[];
  setActiveTab: (tab: string) => void;
  onSelectClaim: (claim: VendorClaim) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  claims, 
  evidenceList, 
  timeline, 
  setActiveTab,
  onSelectClaim 
}) => {
  const [activeNoticeTab, setActiveNoticeTab] = useState<'E16' | 'E12'>('E16');
  const [copied, setCopied] = useState<boolean>(false);
  const [showFullLetter, setShowFullLetter] = useState<boolean>(true);

  const contradictedCount = claims.filter(c => c.verdict === 'CONTRADICTED').length;
  const supportedCount = claims.filter(c => c.verdict === 'SUPPORTED').length;
  const mixedCount = claims.filter(c => c.verdict === 'MIXED').length;
  const unverifiedCount = claims.filter(c => c.verdict === 'UNVERIFIED').length;
  const totalRecordsCount = evidenceList.reduce((acc, curr) => acc + curr.records, 0);

  const e16LetterText = `Date: Fri, 28 Aug 2026, 18:10 IST
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
5. Affected credentials were rotated on 24 August 2026.
6. A list of indicators is attached to assist your review (file: indicator_list.csv).

What is changing:
7. From 1 September 2026, TallyBridge Connect will also synchronise vendor contact details (email and phone) between your systems, using the existing connection. No action is needed.

We consider this matter closed. Thank you for your patience.

Regards,
Customer Trust Team, TallyBridge Software`;

  const e12LetterText = `Date: Fri, 21 Aug 2026, 19:32 IST
From: security-notices@tallybridge.example
To: accounts@harborfinch.example
Subject: Important: precautionary update regarding customer connections

Dear Customer,
Our monitoring identified unusual activity affecting a limited subset of customer connections to TallyBridge Connect. As a precaution we are in the process of rotating credentials for the affected connections.

There is no evidence that customer data was accessed in a way that affects business operations. No action is required from you at this time.

We take the security of your data seriously and will contact you again if we have further information to share.

Please do not forward this notice outside your organisation.

Regards,
Customer Trust Team, TallyBridge Software
(Delivery Note: Addressed to billing contact on record. IT/Security not notified.)`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top HUD Command Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0c1322] via-[#090f1d] to-[#0d1629] border border-[#1e2e4a] p-6 shadow-2xl radar-sweep">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>AEGIS FORENSIC VERIFICATION ACTIVE: CR-26-047</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight font-sans">
              MIRROR <span className="text-cyan-400 font-mono text-xl font-bold">|</span> Claim-to-Evidence Reconciliation
            </h1>
            <p className="text-slate-400 text-xs md:text-sm max-w-3xl leading-relaxed">
              Don't just trust the incident explanation. Cross-examine vendor incident notices against independent 
              forensic logs, PrivateLink tunnels, API traces, and file access records to expose discrepancies.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => setActiveTab('claims')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Verify Claims ({claims.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('coastal')}
              className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-xs tracking-wide transition-all flex items-center gap-2 cursor-pointer"
            >
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <span>Coastal Case Diff</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🌟 PROMINENT: THE CULPRIT'S EXPLANATION & IMMEDIATE REBUTTAL SECTION */}
      {/* ========================================================================= */}
      <div className="rounded-2xl bg-gradient-to-br from-[#12101e] via-[#0d1220] to-[#090d16] border-2 border-amber-500/40 p-5 md:p-6 shadow-2xl relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#233554] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">
                  The Culprit's Official Incident Explanation (TallyBridge Software)
                </h2>
                <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                  EXHIBIT E16 & E12
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Exact verbatim statements sent by TallyBridge claiming the breach was harmless and limited.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex bg-[#070b14] p-1 rounded-lg border border-[#1e2e4a] text-xs font-mono">
              <button
                onClick={() => setActiveNoticeTab('E16')}
                className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
                  activeNoticeTab === 'E16' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                E16 Final Report (28 Aug)
              </button>
              <button
                onClick={() => setActiveNoticeTab('E12')}
                className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
                  activeNoticeTab === 'E12' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                E12 First Notice (21 Aug)
              </button>
            </div>

            <button
              onClick={() => setShowFullLetter(!showFullLetter)}
              className="px-2.5 py-1.5 rounded-lg bg-[#141b2e] hover:bg-[#1b2640] text-slate-300 text-xs font-mono border border-[#1e2e4a] flex items-center gap-1 cursor-pointer"
            >
              {showFullLetter ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showFullLetter ? 'Collapse' : 'Expand Full Letter'}</span>
            </button>
          </div>
        </div>

        {/* Verbatim Letter Box */}
        {showFullLetter && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
            {/* Raw Email Display (5 cols) */}
            <div className="lg:col-span-5 bg-[#070a12] border border-[#1e2e4a] rounded-xl overflow-hidden font-mono text-xs">
              <div className="p-2.5 bg-[#0b101d] border-b border-[#1e2e4a] flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>Original Email Body ({activeNoticeTab})</span>
                </span>
                <button
                  onClick={() => handleCopy(activeNoticeTab === 'E16' ? e16LetterText : e12LetterText)}
                  className="hover:text-cyan-400 flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-4 text-slate-300 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto select-text">
                {activeNoticeTab === 'E16' ? e16LetterText : e12LetterText}
              </div>
            </div>

            {/* Core Excuses Extracted (7 cols) */}
            <div className="lg:col-span-7 space-y-2">
              <div className="text-xs font-bold text-amber-400 font-mono flex items-center justify-between">
                <span>KEY EXCUSES GIVEN BY TALLYBRIDGE vs. FORENSIC REALITY:</span>
                <span className="text-slate-500 font-normal">Cross-examined across 20 logs</span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                <div className="p-2.5 rounded-lg bg-[#070b14] border border-rose-500/30 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-rose-400 font-bold font-mono">Excuse 1: "Limited to support ticket metadata"</span>
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.2 rounded font-mono font-bold">CONTRADICTED</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    <strong>Forensic Truth:</strong> LedgerOne log (E01) proves threat IPs exported 19,675 vendor records and queried payments. BlueVault (E05) proves storage key harvested from ticket TKT-48213 downloaded vendor bank details and finance statements.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-[#070b14] border border-rose-500/30 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-rose-400 font-bold font-mono">Excuse 2: "Unauthorized requests occurred on August 11-12 only"</span>
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.2 rounded font-mono font-bold">CONTRADICTED</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    <strong>Forensic Truth:</strong> Reconnaissance occurred on 9 August (E01), 70 network flows occurred on 17-19 August (E15), and on 3 September key-tb-07 altered Coastal Packaging's bank account (E18, E19).
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-[#070b14] border border-rose-500/30 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-rose-400 font-bold font-mono">Excuse 3: "Affected credentials rotated on 24 August 2026"</span>
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.2 rounded font-mono font-bold">CONTRADICTED</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    <strong>Forensic Truth:</strong> Key <code className="text-cyan-400">key-tb-07</code> remained active in the software register on 2 September (E04) and made API calls throughout 1-7 September (E18).
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-[#070b14] border border-rose-500/30 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-rose-400 font-bold font-mono">Excuse 4: "No systems on the private link were involved"</span>
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.2 rounded font-mono font-bold">CONTRADICTED</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    <strong>Forensic Truth:</strong> Network logs (E15) prove internal build host <code className="text-amber-300">10.20.4.77</code> (tb-build-02) transferred 5.1 MB from LedgerOne on 18 August and executed the 3 September bank change.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#1e2e4a] text-xs">
          <div className="text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Summary: <strong>4 of 7 statements</strong> are provably false; 2 are misleading; 1 unverified.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('notices')}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Inspect Full Notice Comparison Tab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* High-Impact Tactical Telemetry HUD (5 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-[#0b101d] border border-[#1e2e4a] rounded-xl p-4 shadow-sm hover:border-slate-700 transition-all">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between font-mono">
            <span>VENDOR CLAIMS</span>
            <Files className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mt-1.5">{claims.length}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">From E16 Notice</div>
        </div>

        <div className="bg-[#140c15] border border-rose-500/30 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="text-[11px] text-rose-300 font-bold flex items-center justify-between font-mono">
            <span>CONTRADICTED</span>
            <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-rose-400 mt-1.5">{contradictedCount}</div>
          <div className="text-[10px] text-rose-300/80 mt-1 font-mono">Direct Log Conflicts</div>
        </div>

        <div className="bg-[#14110a] border border-amber-500/30 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] text-amber-300 font-bold flex items-center justify-between font-mono">
            <span>MIXED FINDINGS</span>
            <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-400 mt-1.5">{mixedCount}</div>
          <div className="text-[10px] text-amber-300/80 mt-1 font-mono">Partial Discrepancies</div>
        </div>

        <div className="bg-[#0b101d] border border-[#1e2e4a] rounded-xl p-4 shadow-sm">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between font-mono">
            <span>UNVERIFIED</span>
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-slate-300 mt-1.5">{unverifiedCount}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Scope Unenforced</div>
        </div>

        <div className="bg-[#08121f] border border-cyan-500/30 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="text-[11px] text-cyan-300 font-bold flex items-center justify-between font-mono">
            <span>AUDIT RECORDS</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-cyan-300 mt-1.5">
            {totalRecordsCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">20 System Datasets</div>
        </div>
      </div>

      {/* Main Grid: Core Claims & High Priority Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Claim Verification Summary */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Extracted Claims Adjudication Queue</span>
            </h2>
            <button 
              onClick={() => setActiveTab('claims')} 
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Full Matrix View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {claims.map((claim) => (
              <div 
                key={claim.id}
                onClick={() => {
                  onSelectClaim(claim);
                  setActiveTab('claims');
                }}
                className={`group p-4 rounded-xl border transition-all cursor-pointer shadow-sm relative overflow-hidden ${
                  claim.verdict === 'CONTRADICTED'
                    ? 'bg-[#0d121c] border-[#1e2e4a] hover:border-rose-500/50 hover:bg-[#111624]'
                    : 'bg-[#0d121c] border-[#1e2e4a] hover:border-cyan-500/50 hover:bg-[#111624]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono font-bold text-slate-300 bg-[#162033] px-2 py-0.5 rounded border border-[#233554]">
                        {claim.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        claim.verdict === 'CONTRADICTED'
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          : claim.verdict === 'MIXED'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : claim.verdict === 'SUPPORTED'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {claim.verdict}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Certainty: <strong className="text-cyan-400 font-mono">{claim.confidence}%</strong>
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      "{claim.statement}"
                    </p>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {claim.summary}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1">
                      {claim.supporting_evidence.map(ev => (
                        <span key={ev} className="text-[10px] font-mono bg-cyan-950/80 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800/40">
                          {ev}
                        </span>
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400 group-hover:text-cyan-400 flex items-center gap-1 font-mono mt-2">
                      <span>Forensic Proof</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Special Spotlight & Case Limitations */}
        <div className="space-y-5">
          {/* Coastal Packaging Highlight Card */}
          <div className="rounded-xl bg-gradient-to-br from-rose-950/30 via-[#0d121c] to-[#090d16] border border-rose-500/40 p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-bold text-rose-400 mb-2">
              <span className="flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                Critical Threat Indicator
              </span>
              <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30">
                03 SEP 2026
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">
              Coastal Packaging Ltd (V-0412) Bank Alteration
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              TallyBridge API credential <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded font-mono">key-tb-07</code> altered 
              the vendor bank account without authorization (<code className="text-rose-300 font-mono">approval_ref = null</code>) 5 days before scheduled payment run.
            </p>

            <div className="mt-4 p-3 rounded-lg bg-[#070b14] border border-[#1e2e4a] text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Source Host:</span>
                <span className="text-amber-400">10.20.4.77 (tb-build-02)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Account Mask:</span>
                <span className="text-slate-300">****4417 &rarr; <span className="text-rose-400 font-bold">****9083</span></span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Target Endpoint:</span>
                <span className="text-cyan-400">PATCH /v2/vendors/V-0412</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('coastal')}
              className="w-full mt-4 py-2 px-3 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Inspect Special Case Records</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Key Facts / Case Limitations */}
          <div className="rounded-xl bg-[#0b101d] border border-[#1e2e4a] p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-mono">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Admissibility & Chain-of-Custody Rules</span>
            </h3>
            <ul className="text-xs text-slate-400 space-y-2 leading-relaxed list-disc list-inside">
              <li><strong className="text-slate-300">BlueVault Clock Drift:</strong> System clock has unsynchronized skew; epoch timestamps require offset correlation.</li>
              <li><strong className="text-slate-300">Non-Attribution Rule:</strong> Multiple IP sightings do not automatically prove common adversarial origin.</li>
              <li><strong className="text-slate-300">Defense Stance:</strong> Discrepancies between stated scope and logs highlight risk without premature criminal attribution.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
