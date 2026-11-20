import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertOctagon, 
  HelpCircle, 
  Layers, 
  FileCheck2, 
  ShieldAlert, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { VendorClaim, CoastalCaseData, EvidenceItem } from '../types';

interface InvestigationReportProps {
  claims: VendorClaim[];
  coastalData: CoastalCaseData;
  evidenceList: EvidenceItem[];
  onViewEvidence: (evidenceId: string) => void;
}

export const InvestigationReport: React.FC<InvestigationReportProps> = ({
  claims,
  coastalData,
  evidenceList,
  onViewEvidence
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handlePrintOrExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 300);
  };

  const contradictedCount = claims.filter(c => c.verdict === 'CONTRADICTED').length;
  const mixedCount = claims.filter(c => c.verdict === 'MIXED').length;

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Formal Investigation Report</h1>
              <p className="text-xs text-slate-400">
                Audit Committee & Executive Debrief: Incident Reconciliation & Representation Verification
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handlePrintOrExport}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Export PDF / Print Dossier</span>
        </button>
      </div>

      {/* Printable Report Container */}
      <div id="printable-report" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 space-y-8 text-slate-200 shadow-2xl">
        {/* Cover / Header Section */}
        <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-cyan-400 font-bold tracking-widest uppercase">
              CRIMEATHON'26 • FORENSIC INCIDENT AUDIT
            </div>
            <h2 className="text-2xl font-black text-white mt-1">
              MIRROR INCIDENT RECONCILIATION DOSSIER
            </h2>
            <div className="text-xs text-slate-400 mt-1">
              Case Ref: <strong className="text-slate-200">CR-26-047</strong> • Subject: <strong className="text-slate-200">Harbor & Finch Freight vs. TallyBridge Software</strong>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs font-mono text-slate-400 space-y-0.5">
            <div>Date: 07 September 2026</div>
            <div>Prepared for: Dev Raghavan (GM), Madhavi Sundar (Finance)</div>
            <div>Classification: CONFIDENTIAL / LEGAL PRIVILEGE</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <span>1. Executive Summary & Verification Core Findings</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Following receipt of TallyBridge Software’s follow-up explanation on 28 August 2026 (E16), Harbor & Finch 
            conducted an automated forensic verification using the MIRROR platform across 20 independent evidence 
            repositories encompassing LedgerOne, HelpDeskr, BlueVault, and network link flow logs.
          </p>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="font-semibold text-rose-400 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4" />
              <span>Core Assessment: Don't Just Trust. The Incident Explanation is Severely Contradicted.</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              TallyBridge's primary claims that the incident was "limited to support ticket metadata" and that 
              "finance records and stored files were not accessed" are <strong>directly contradicted by forensic evidence</strong>. 
              Threat IPs exported 19,675 vendor records, conducted 7 payment queries, harvested storage credentials 
              from unredacted tickets, and downloaded confidential vendor banking instructions from BlueVault.
            </p>
          </div>
        </div>

        {/* Claim Verification Scorecard */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
            2. Vendor Claim Reconciliation Matrix
          </h3>

          <div className="rounded-xl border border-slate-800 overflow-hidden text-xs">
            <div className="grid grid-cols-12 bg-slate-950 p-3 font-semibold text-slate-400 border-b border-slate-800">
              <div className="col-span-1">ID</div>
              <div className="col-span-6">Vendor Claim Statement (E16)</div>
              <div className="col-span-2 text-center">Verdict</div>
              <div className="col-span-3 text-right">Referenced Evidence</div>
            </div>
            <div className="divide-y divide-slate-800/60 bg-slate-900/50">
              {claims.map((c) => (
                <div key={c.id} className="grid grid-cols-12 p-3 items-center gap-2">
                  <div className="col-span-1 font-mono font-bold text-slate-300">{c.id}</div>
                  <div className="col-span-6 text-slate-200 font-medium">"{c.statement}"</div>
                  <div className="col-span-2 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      c.verdict === 'CONTRADICTED'
                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        : c.verdict === 'MIXED'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {c.verdict}
                    </span>
                  </div>
                  <div className="col-span-3 text-right font-mono text-[11px] text-cyan-400 space-x-1">
                    {c.supporting_evidence.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Special Case: Coastal Packaging Ltd */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>3. Critical Discrepancy: Coastal Packaging Ltd Bank Alteration</span>
          </h3>

          <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/30 space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
              <div>
                <span className="text-slate-500 block">Vendor & Record:</span>
                <span className="text-slate-200 font-bold">V-0412 (Coastal Packaging Ltd)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Event Timestamp:</span>
                <span className="text-slate-200">2026-09-03 01:44:30 UTC</span>
              </div>
              <div>
                <span className="text-slate-500 block">Account Change:</span>
                <span className="text-slate-200">****4417 &rarr; <span className="text-rose-400 font-bold">****9083</span></span>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed pt-2 border-t border-slate-800/80">
              The modification was performed via API using credential <code className="text-cyan-300">key-tb-07</code> from IP <code className="text-amber-300">10.20.4.77</code> (tb-build-02). 
              Crucially, no approval reference was provided, violating company dual-control policy. The change occurred 
              5 days before the scheduled 8 September vendor disbursement run.
            </p>
          </div>
        </div>

        {/* Immediate Recommended Investigative Steps */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
            4. Recommended Immediate Investigative & Mitigation Actions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-semibold text-slate-200">1. Emergency Credential Revocation</div>
              <p className="text-slate-400 leading-relaxed">
                Immediately revoke and invalidate API credential <code className="text-cyan-400">key-tb-07</code> and storage key <code className="text-cyan-400">bvk-7f3a</code> in all environments.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-semibold text-slate-200">2. Freeze Vendor Bank Account Updates</div>
              <p className="text-slate-400 leading-relaxed">
                Quarantine vendor record V-0412 (Coastal Packaging Ltd). Revert bank account to verified HDFC ending in 4417. Place payment run of 8 September on manual hold.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-semibold text-slate-200">3. PrivateLink Host Isolation</div>
              <p className="text-slate-400 leading-relaxed">
                Block IP 10.20.4.77 (tb-build-02) on PrivateLink tunnel tun-tb-01. Request formal vendor incident report on build server integrity.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-semibold text-slate-200">4. Support Ticket Secret Sanitization</div>
              <p className="text-slate-400 leading-relaxed">
                Scan all HelpDeskr historical tickets for hardcoded API keys and secrets (specifically TKT-48213) and purge legacy bulk export EXP-5419.
              </p>
            </div>
          </div>
        </div>

        {/* Sign-off Block */}
        <div className="pt-6 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500 font-mono">
          <div>Generated by MIRROR Forensic Reconstruction Engine</div>
          <div>Page 1 of 1 • Cryptographic Hash: Verified</div>
        </div>
      </div>
    </div>
  );
};
