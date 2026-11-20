import React, { useState } from 'react';
import { 
  FileCheck2, 
  AlertOctagon, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Search,
  Filter,
  FileSearch,
  Info,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { VendorClaim } from '../types';

interface ClaimVerificationProps {
  claims: VendorClaim[];
  onSelectClaim: (claim: VendorClaim) => void;
  onViewEvidence: (evidenceId: string) => void;
}

export const ClaimVerification: React.FC<ClaimVerificationProps> = ({ 
  claims, 
  onSelectClaim, 
  onViewEvidence 
}) => {
  const [filterVerdict, setFilterVerdict] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedClaimId, setExpandedClaimId] = useState<string | null>(claims[0]?.id || null);

  const filteredClaims = claims.filter(c => {
    const matchesFilter = filterVerdict === 'ALL' || c.verdict === filterVerdict;
    const matchesSearch = c.statement.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.supporting_evidence.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'CONTRADICTED':
        return {
          bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
          icon: AlertOctagon,
          label: 'CONTRADICTED'
        };
      case 'MIXED':
        return {
          bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
          icon: HelpCircle,
          label: 'MIXED'
        };
      case 'SUPPORTED':
        return {
          bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
          icon: CheckCircle2,
          label: 'SUPPORTED'
        };
      default:
        return {
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: HelpCircle,
          label: 'UNVERIFIED'
        };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileCheck2 className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Claim-to-Evidence Verification Matrix</h1>
              <p className="text-xs text-slate-400">
                Evaluating TallyBridge incident statements against Harbor & Finch multi-system forensic logs.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search claims or evidence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors w-48 md:w-56"
            />
          </div>

          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            {['ALL', 'CONTRADICTED', 'MIXED', 'UNVERIFIED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterVerdict(tab)}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  filterVerdict === tab 
                    ? 'bg-cyan-500 text-slate-950 shadow-sm font-semibold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-4">
        {filteredClaims.map((claim) => {
          const badge = getVerdictBadge(claim.verdict);
          const BadgeIcon = badge.icon;
          const isExpanded = expandedClaimId === claim.id;

          return (
            <div 
              key={claim.id}
              className={`rounded-xl border transition-all duration-200 ${
                isExpanded 
                  ? 'bg-slate-900/90 border-slate-700 shadow-xl ring-1 ring-cyan-500/20' 
                  : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70'
              }`}
            >
              {/* Card Header */}
              <div 
                onClick={() => setExpandedClaimId(isExpanded ? null : claim.id)}
                className="p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                      {claim.id}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                      <BadgeIcon className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </span>
                    <span className="text-xs text-slate-400">
                      Evidence Coverage: <span className="text-cyan-400 font-mono font-bold">{claim.confidence}%</span>
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100 leading-snug">
                    "{claim.statement}"
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {claim.summary}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden sm:flex items-center gap-1.5">
                    {claim.supporting_evidence.map((ev) => (
                      <button
                        key={ev}
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewEvidence(ev);
                        }}
                        className="text-[11px] font-mono bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 px-2 py-1 rounded border border-slate-700 hover:border-cyan-700 transition-colors"
                        title="Click to inspect source evidence file"
                      >
                        {ev}
                      </button>
                    ))}
                  </div>
                  <button className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 border border-slate-700">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Card Expanded Details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-4">
                  {/* Detailed Log Breakdown */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Evidence Traceability & Correlated Records</span>
                    </h4>
                    <div className="bg-slate-950/80 rounded-lg p-3.5 border border-slate-800/80 space-y-2.5">
                      {claim.details.map((detail, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Supporting Evidence Clickable Chips */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-950/40 border border-slate-800">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-400 font-medium">Referenced Sources:</span>
                      {claim.supporting_evidence.map((ev) => (
                        <button
                          key={ev}
                          onClick={() => onViewEvidence(ev)}
                          className="inline-flex items-center gap-1 text-xs font-mono font-medium bg-cyan-950/80 text-cyan-300 hover:bg-cyan-900 px-2.5 py-1 rounded border border-cyan-800/60 transition-colors cursor-pointer"
                        >
                          <FileSearch className="w-3 h-3" />
                          <span>Inspect {ev}</span>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => onSelectClaim(claim)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold cursor-pointer shrink-0"
                    >
                      <span>Full forensic drill-down</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Unresolved Questions & Limitations */}
                  <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 text-xs text-amber-300/90 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-400">Unresolved Forensic Question: </span>
                      <span>{claim.unresolved_questions}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
