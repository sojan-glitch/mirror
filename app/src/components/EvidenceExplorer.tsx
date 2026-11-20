import React, { useState } from 'react';
import { 
  FileSearch, 
  Search, 
  Database, 
  ExternalLink, 
  Download, 
  Table, 
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  Info
} from 'lucide-react';
import { EvidenceItem } from '../types';

interface EvidenceExplorerProps {
  evidenceList: EvidenceItem[];
  sampleRecords: Record<string, { fields: string[]; rows: any[] }>;
  selectedEvidenceId: string | null;
  onSelectEvidence: (id: string) => void;
}

export const EvidenceExplorer: React.FC<EvidenceExplorerProps> = ({
  evidenceList,
  sampleRecords,
  selectedEvidenceId,
  onSelectEvidence
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const activeEvidence = evidenceList.find(e => e.id === selectedEvidenceId) || evidenceList[0];
  const activeRecordSet = sampleRecords[activeEvidence?.id] || null;

  const filteredList = evidenceList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileSearch className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Evidence Repository & Record Viewer</h1>
              <p className="text-xs text-slate-400">
                Inspect authentic, unmodified synthetic forensic evidence files (E01 to E20) with record-level traceability.
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter evidence catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors w-44 md:w-52"
            />
          </div>

          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            {['ALL', 'CSV', 'JSON', 'PDF'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  filterType === t 
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Catalog List, Right Record-Level Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Catalog (4 cols) */}
        <div className="lg:col-span-4 space-y-2 max-h-[750px] overflow-y-auto pr-1">
          {filteredList.map((item) => {
            const isSelected = activeEvidence?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onSelectEvidence(item.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/40 shadow-sm ring-1 ring-cyan-500/20'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                      {item.id}
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {item.type}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {item.records.toLocaleString()} rows
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-200 truncate">
                    {item.name}
                  </div>

                  <div className="text-[11px] text-slate-400 truncate">
                    {item.source}
                  </div>
                </div>

                <ChevronRight className={`w-4 h-4 shrink-0 transition-colors ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
              </div>
            );
          })}
        </div>

        {/* Right Details & Record Viewer (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {activeEvidence ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
              {/* Evidence File Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800">
                      {activeEvidence.id}
                    </span>
                    <h2 className="text-base font-bold text-white tracking-tight">
                      {activeEvidence.name}
                    </h2>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Source: <strong className="text-slate-300">{activeEvidence.source}</strong> • Period: <span className="font-mono text-slate-300">{activeEvidence.period}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{activeEvidence.file}</span>
                </div>
              </div>

              {/* Reliability Note */}
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs flex items-center gap-2.5 text-slate-300">
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                <span><strong>Forensic Integrity Note:</strong> {activeEvidence.reliability}</span>
              </div>

              {/* Record Viewer (Table or Document preview) */}
              {activeRecordSet && activeRecordSet.rows.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-medium">Live Evidence Sample Records (first 100 rows previewed):</span>
                    <span className="font-mono text-cyan-400">{activeRecordSet.rows.length} rows loaded</span>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 max-h-[500px]">
                    <table className="w-full text-left text-[11px] font-mono whitespace-nowrap">
                      <thead className="bg-slate-900/90 text-slate-300 sticky top-0 z-10 border-b border-slate-800">
                        <tr>
                          {activeRecordSet.fields.map((f) => (
                            <th key={f} className="px-3 py-2 font-semibold tracking-wider uppercase text-[10px]">
                              {f}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {activeRecordSet.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                            {activeRecordSet.fields.map((f) => (
                              <td key={f} className="px-3 py-1.5 truncate max-w-xs">
                                {row[f] ? String(row[f]) : <span className="text-slate-600">-</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-lg bg-slate-950/60 border border-dashed border-slate-800 text-center space-y-2">
                  <Table className="w-8 h-8 text-slate-600 mx-auto" />
                  <div className="text-xs font-semibold text-slate-300">Document File Representation</div>
                  <div className="text-xs text-slate-500 max-w-md mx-auto">
                    This evidence item is a structured legal/audit document ({activeEvidence.type}). 
                    Its extracted clauses, audit statements, and indicators are indexed in the verification engine.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">Select an evidence item to explore records.</div>
          )}
        </div>
      </div>
    </div>
  );
};
