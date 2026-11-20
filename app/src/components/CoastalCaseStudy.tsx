import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Building2, 
  Calendar, 
  Lock, 
  ShieldAlert, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  FileText, 
  Search, 
  CheckCircle2, 
  AlertOctagon,
  Clock,
  Terminal,
  Activity,
  Layers
} from 'lucide-react';
import { CoastalCaseData } from '../types';

interface CoastalCaseStudyProps {
  coastalData: CoastalCaseData;
  onViewEvidence: (evidenceId: string) => void;
}

export const CoastalCaseStudy: React.FC<CoastalCaseStudyProps> = ({ 
  coastalData, 
  onViewEvidence 
}) => {
  const [unmaskBank, setUnmaskBank] = useState<boolean>(false);
  const event = coastalData.modification_event;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner Alert */}
      <div className="rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-rose-400 uppercase">
              Special Case Investigation • Unauthorized Field Alteration
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Coastal Packaging Ltd. (V-0412) Bank Account Modification
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
            On September 3, 2026, an API request originating from a TallyBridge build host executed an unapproved 
            bank account alteration in LedgerOne master records, exactly 5 days before scheduled payment execution.
          </p>
        </div>
      </div>

      {/* Primary Comparison & Forensic Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Field Comparison & Sequence */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bank Field Before/After Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Field Modification Ledger Snapshot</span>
              </h2>
              <button
                onClick={() => setUnmaskBank(!unmaskBank)}
                className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
              >
                {unmaskBank ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{unmaskBank ? 'Mask Sensitive Values' : 'Reveal Account Values'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Previous Value */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Previous Account (Legitimate)</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-lg font-mono font-bold text-emerald-400 tracking-wider">
                  {unmaskBank ? event.previous_value : event.previous_value_masked}
                </div>
                <div className="text-[11px] text-slate-500 mt-2">
                  Bank: HDFC Bank • Coastal Packaging Primary
                </div>
              </div>

              {/* Updated Value */}
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30">
                <div className="text-[11px] font-medium text-rose-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Updated Account (Unauthorized)</span>
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <div className="text-lg font-mono font-bold text-rose-400 tracking-wider">
                  {unmaskBank ? event.updated_value : event.updated_value_masked}
                </div>
                <div className="text-[11px] text-rose-400/80 mt-2">
                  Bank: ICICI Bank • Unrecognized Destination
                </div>
              </div>
            </div>

            {/* Audit Attributes Table */}
            <div className="rounded-lg bg-slate-950 border border-slate-800 overflow-hidden text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 p-3 border-b border-slate-800 bg-slate-900/40 text-slate-400 font-medium">
                <div>Change ID</div>
                <div>Timestamp (UTC / IST)</div>
                <div>Credential Used</div>
                <div>Approval Reference</div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 p-3 font-mono text-slate-200">
                <div className="text-cyan-400">{event.change_id}</div>
                <div>03-Sep 01:44 UTC</div>
                <div className="text-amber-400">{event.credential_identity}</div>
                <div className="text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded w-max">
                  {event.approval_ref}
                </div>
              </div>
            </div>
          </div>

          {/* Sequential API Footprint leading up to modification */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Prior Vendor Reconnaissance & Attack Sequence (03 Sep 2026)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Inspection of E18 API logs demonstrates that the modification was preceded by specific, targeted queries 
              from IP <code className="text-amber-300">10.20.4.77</code> rather than routine batch processing.
            </p>

            <div className="space-y-2.5">
              {coastalData.prior_vendor_reconnaissance.map((req, idx) => (
                <div 
                  key={req.request_id} 
                  className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono ${
                    req.method === 'PATCH' 
                      ? 'bg-rose-950/30 border-rose-500/40' 
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] text-slate-500">#{idx + 1}</span>
                    <span className="text-slate-400">{req.ts_utc.slice(11, 19)} UTC</span>
                    <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                      req.method === 'PATCH' ? 'bg-rose-500/20 text-rose-300' : 'bg-cyan-500/20 text-cyan-300'
                    }`}>
                      {req.method}
                    </span>
                    <span className="text-slate-200">{req.endpoint}</span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-400">
                    <span className="text-[11px] font-sans text-slate-400">{req.description}</span>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">{req.request_id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Analysis & Investigation Directives */}
        <div className="space-y-5">
          {/* Key Findings Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Why This Requires Formal Investigation</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {coastalData.forensic_analysis.why_needs_investigation}
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-300">Identified Governance Deficiencies:</span>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                {coastalData.forensic_analysis.governance_failures.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Alternative Explanations Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Plausible Explanations (Defense Stance)</span>
            </h3>
            <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
              {coastalData.forensic_analysis.alternative_explanations.map((alt, i) => (
                <li key={i} className="leading-relaxed">{alt}</li>
              ))}
            </ul>
          </div>

          {/* Action Button to View Source Files */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 space-y-2">
            <div className="text-xs font-semibold text-cyan-300">Evidence Verification Links:</div>
            <div className="flex gap-2">
              <button
                onClick={() => onViewEvidence('E18')}
                className="flex-1 py-1.5 px-2 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-mono transition-colors text-center cursor-pointer"
              >
                Inspect E18 (API Log)
              </button>
              <button
                onClick={() => onViewEvidence('E19')}
                className="flex-1 py-1.5 px-2 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-mono transition-colors text-center cursor-pointer"
              >
                Inspect E19 (Change Log)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
