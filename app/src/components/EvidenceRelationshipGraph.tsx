import React, { useState } from 'react';
import { 
  Network, 
  Layers, 
  ExternalLink, 
  Info, 
  Filter, 
  Server, 
  KeyRound, 
  Globe, 
  FileCode, 
  DollarSign, 
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';

interface EvidenceRelationshipGraphProps {
  onViewEvidence: (evidenceId: string) => void;
}

interface GraphNode {
  id: string;
  label: string;
  type: 'credential' | 'ip' | 'api' | 'file' | 'financial' | 'system';
  evidenceId: string;
  x: number;
  y: number;
  details: string;
  isSuspicious: boolean;
}

interface GraphEdge {
  from: string;
  to: string;
  label: string;
  evidenceId: string;
  isThreatVector: boolean;
}

export const EvidenceRelationshipGraph: React.FC<EvidenceRelationshipGraphProps> = ({ onViewEvidence }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  // Forensically accurate node positions on a 1000x600 SVG canvas
  const nodes: GraphNode[] = [
    // Threat IPs
    { id: 'ip_recon', label: '198.18.7.41', type: 'ip', evidenceId: 'E17', x: 120, y: 150, details: 'External Threat IP. Probed LedgerOne on 9 Aug (E01) & executed HelpDeskr credential searches on 11 Aug (E02).', isSuspicious: true },
    { id: 'ip_export', label: '198.18.7.58', type: 'ip', evidenceId: 'E17', x: 120, y: 320, details: 'External Threat IP. Executed vendor data exports & 3 payment queries in LedgerOne (E01) and HelpDeskr exports (E02).', isSuspicious: true },
    { id: 'ip_storage', label: '198.18.7.23 / .24 / .77', type: 'ip', evidenceId: 'E05', x: 120, y: 490, details: 'External IPs from threat subnet used on 14-15 Aug to exfiltrate bank instructions & finance statements from BlueVault.', isSuspicious: true },
    { id: 'ip_build', label: '10.20.4.77 (tb-build-02)', type: 'ip', evidenceId: 'E15', x: 500, y: 120, details: 'TallyBridge Build Host on PrivateLink tunnel tun-tb-01. Generated 70 flows to LedgerOne and executed 3 Sep bank account alteration.', isSuspicious: true },

    // Credentials
    { id: 'cred_tb07', label: 'key-tb-07', type: 'credential', evidenceId: 'E04', x: 380, y: 240, details: 'TallyBridge-LedgerOne active API credential. Had excessive "read:write all-modules" scope. Unrotated on 24 Aug.', isSuspicious: true },
    { id: 'cred_support', label: 'tb-sync-svc', type: 'credential', evidenceId: 'E04', x: 380, y: 380, details: 'HelpDeskr integration user. Exploited on 11 Aug to search tickets and initiate bulk exports EXP-5410 to EXP-5419.', isSuspicious: true },
    { id: 'cred_bvk', label: 'bvk-7f3a', type: 'credential', evidenceId: 'E05', x: 380, y: 500, details: 'BlueVault storage key harvested from ticket TKT-48213. Used on 14-15 Aug to download confidential bank spreadsheets.', isSuspicious: true },

    // Systems / Target Objects
    { id: 'sys_helpdeskr', label: 'HelpDeskr (Support)', type: 'system', evidenceId: 'E02', x: 650, y: 380, details: 'Support ticket repository. Compromised via credential searches & 10 bulk exports exceeding billing allowance (E06).', isSuspicious: false },
    { id: 'sys_bluevault', label: 'BlueVault (Storage)', type: 'system', evidenceId: 'E05', x: 650, y: 500, details: 'Cloud document storage. Clock was never synchronized. 67 confidential finance files read by harvested key.', isSuspicious: false },
    { id: 'sys_ledgerone', label: 'LedgerOne (Finance)', type: 'system', evidenceId: 'E01', x: 650, y: 240, details: 'Primary ERP & vendor master. Target of vendor exports (19,675 rows) and 3 Sep bank account modification.', isSuspicious: false },

    // Impact / Financial Changes
    { id: 'fin_coastal', label: 'Coastal Packaging (V-0412)', type: 'financial', evidenceId: 'E19', x: 880, y: 180, details: 'Bank account altered to ****9083 on 3 Sep without approval ref (chg-8b9888c39b) 5 days before disbursement.', isSuspicious: true },
    { id: 'file_bank_details', label: 'vendor-bank-details.xlsx', type: 'file', evidenceId: 'E05', x: 880, y: 450, details: 'Exfiltrated master vendor bank instruction file from /finance/bank-instructions/ on 14-15 August.', isSuspicious: true },
    { id: 'file_ticket48213', label: 'Ticket TKT-48213', type: 'file', evidenceId: 'E13', x: 650, y: 290, details: 'Unsanitized ticket containing storage key bvk-7f3a pasted in plaintext during June support interaction.', isSuspicious: true }
  ];

  const edges: GraphEdge[] = [
    // IP -> Credential
    { from: 'ip_recon', to: 'cred_tb07', label: 'Uses in 9 Aug probe', evidenceId: 'E01', isThreatVector: true },
    { from: 'ip_export', to: 'cred_tb07', label: 'Uses in 12 Aug exports', evidenceId: 'E01', isThreatVector: true },
    { from: 'ip_recon', to: 'cred_support', label: 'Authenticates with', evidenceId: 'E02', isThreatVector: true },
    { from: 'ip_export', to: 'cred_support', label: 'Initiates bulk exports', evidenceId: 'E02', isThreatVector: true },
    { from: 'ip_storage', to: 'cred_bvk', label: 'Uses harvested key', evidenceId: 'E05', isThreatVector: true },
    { from: 'ip_build', to: 'cred_tb07', label: 'Routes via tun-tb-01', evidenceId: 'E15', isThreatVector: true },

    // Credential -> System
    { from: 'cred_support', to: 'sys_helpdeskr', label: 'Searches & Exports', evidenceId: 'E02', isThreatVector: true },
    { from: 'cred_tb07', to: 'sys_ledgerone', label: 'PATCH & GET APIs', evidenceId: 'E01', isThreatVector: true },
    { from: 'cred_bvk', to: 'sys_bluevault', label: 'Reads file objects', evidenceId: 'E05', isThreatVector: true },

    // Cross-system chain
    { from: 'sys_helpdeskr', to: 'file_ticket48213', label: 'Credential leak in', evidenceId: 'E13', isThreatVector: true },
    { from: 'file_ticket48213', to: 'cred_bvk', label: 'Exposes storage key', evidenceId: 'E13', isThreatVector: true },
    { from: 'sys_bluevault', to: 'file_bank_details', label: 'Exfiltrates', evidenceId: 'E05', isThreatVector: true },

    // Modification chain
    { from: 'sys_ledgerone', to: 'fin_coastal', label: 'Alters bank_account', evidenceId: 'E19', isThreatVector: true },
    { from: 'ip_build', to: 'fin_coastal', label: 'PATCH req-5f61b0de8', evidenceId: 'E18', isThreatVector: true }
  ];

  const filteredNodes = nodes.filter(n => filterType === 'ALL' || n.type === filterType);
  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = edges.filter(e => filteredNodeIds.has(e.from) && filteredNodeIds.has(e.to));

  const getNodeColor = (type: string, isSuspicious: boolean) => {
    switch (type) {
      case 'financial':
        return { fill: '#4c0519', stroke: '#f43f5e', text: '#fda4af' };
      case 'ip':
        return isSuspicious ? { fill: '#451a03', stroke: '#f59e0b', text: '#fde68a' } : { fill: '#0f172a', stroke: '#64748b', text: '#cbd5e1' };
      case 'credential':
        return { fill: '#082f49', stroke: '#06b6d4', text: '#67e8f9' };
      case 'file':
        return { fill: '#2e1065', stroke: '#a855f7', text: '#d8b4fe' };
      case 'system':
        return { fill: '#0f172a', stroke: '#38bdf8', text: '#bae6fd' };
      default:
        return { fill: '#1e293b', stroke: '#94a3b8', text: '#f8fafc' };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2e4a] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Network className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Interactive Evidence Relationship Graph</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono px-2 py-0.5 rounded border border-cyan-500/30">
                  TOPOLOGY MAP
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Visualizing forensic links connecting threat IPs, compromised API credentials, ticket searches, storage exfiltration, and bank account changes.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {['ALL', 'ip', 'credential', 'system', 'file', 'financial'].map((ft) => (
            <button
              key={ft}
              onClick={() => setFilterType(ft)}
              className={`px-3 py-1 rounded-lg font-mono font-medium transition-all cursor-pointer ${
                filterType === ft 
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' 
                  : 'bg-[#0f172a] text-slate-400 hover:text-white border border-[#1e2e4a]'
              }`}
            >
              {ft.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Canvas & Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Graph View (8 cols) */}
        <div className="lg:col-span-8 bg-[#080d1a] border border-[#1e2e4a] rounded-2xl p-4 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2 px-2">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>Click any node to inspect evidence traceability</span>
            </span>
            <span>{filteredNodes.length} Nodes • {filteredEdges.length} Links</span>
          </div>

          <div className="w-full overflow-x-auto">
            <svg viewBox="0 0 1000 580" className="w-full h-auto min-w-[750px] select-none">
              <defs>
                <marker
                  id="arrow-threat"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#06b6d4" />
                </marker>
                <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Render Connections / Edges */}
              {filteredEdges.map((edge, idx) => {
                const source = nodes.find(n => n.id === edge.from);
                const target = nodes.find(n => n.id === edge.to);
                if (!source || !target) return null;

                const isHighlight = selectedNode && (selectedNode.id === edge.from || selectedNode.id === edge.to);

                return (
                  <g key={idx}>
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={isHighlight ? '#00f0ff' : '#1e2e4a'}
                      strokeWidth={isHighlight ? 2.5 : 1.5}
                      strokeDasharray={edge.isThreatVector ? '4,4' : undefined}
                      markerEnd="url(#arrow-threat)"
                      className="transition-all duration-300"
                    />
                    {/* Edge Label Pill */}
                    <text
                      x={(source.x + target.x) / 2}
                      y={(source.y + target.y) / 2 - 4}
                      fill={isHighlight ? '#67e8f9' : '#64748b'}
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                      textAnchor="middle"
                      className="pointer-events-none"
                    >
                      {edge.label}
                    </text>
                  </g>
                );
              })}

              {/* Render Nodes */}
              {filteredNodes.map((node) => {
                const colors = getNodeColor(node.type, node.isSuspicious);
                const isSelected = selectedNode?.id === node.id;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer transition-transform duration-200 hover:scale-105"
                  >
                    {/* Outer Glow on Selected */}
                    {isSelected && (
                      <circle
                        r="34"
                        fill="none"
                        stroke="#00f0ff"
                        strokeWidth="2"
                        strokeDasharray="3,3"
                        className="animate-spin"
                        style={{ transformOrigin: '0 0' }}
                      />
                    )}

                    <circle
                      r="26"
                      fill={colors.fill}
                      stroke={isSelected ? '#00f0ff' : colors.stroke}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />

                    {/* Icon or Type Symbol */}
                    <text
                      y="4"
                      fill={colors.text}
                      fontSize="10"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="pointer-events-none"
                    >
                      {node.type === 'ip' ? 'IP' : node.type === 'credential' ? 'KEY' : node.type === 'financial' ? '₹' : 'OBJ'}
                    </text>

                    {/* Node Label Below */}
                    <text
                      y="40"
                      fill={isSelected ? '#38bdf8' : '#e2e8f0'}
                      fontSize="10"
                      fontFamily="Plus Jakarta Sans"
                      fontWeight="600"
                      textAnchor="middle"
                      className="pointer-events-none"
                    >
                      {node.label}
                    </text>

                    <text
                      y="52"
                      fill="#64748b"
                      fontSize="8"
                      fontFamily="JetBrains Mono"
                      textAnchor="middle"
                      className="pointer-events-none"
                    >
                      [{node.evidenceId}]
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#1e2e4a] text-[10px] font-mono text-slate-400 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Threat IP</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> Credential</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> System</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> File</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Financial Change</span>
            </div>
            <span className="text-slate-500">Dashed Lines = Attack & Exfiltration Vector</span>
          </div>
        </div>

        {/* Node Inspector Drawer (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedNode ? (
            <div className="bg-[#0b101d] border border-[#1e2e4a] rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#1e2e4a] pb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                    selectedNode.isSuspicious 
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                  }`}>
                    {selectedNode.type}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400 bg-[#070b14] px-1.5 py-0.5 rounded border border-[#1e2e4a]">
                    {selectedNode.evidenceId}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-500 hover:text-white text-xs p-1"
                >
                  ✕
                </button>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white font-mono break-all">
                  {selectedNode.label}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-2 bg-[#070b14] p-3 rounded-xl border border-[#1e2e4a]">
                  {selectedNode.details}
                </p>
              </div>

              {/* Connected Relationships */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Connected Threat Vectors:
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {edges
                    .filter(e => e.from === selectedNode.id || e.to === selectedNode.id)
                    .map((edge, i) => (
                      <div key={i} className="p-2 rounded-lg bg-[#070b14] border border-[#1e2e4a] text-[11px] font-mono flex items-center justify-between gap-2">
                        <span className="text-cyan-300 truncate">
                          {edge.from === selectedNode.id ? `➔ ${edge.to}` : `⬅ from ${edge.from}`}
                        </span>
                        <span className="text-[10px] text-slate-500 shrink-0 font-sans">
                          {edge.label}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Direct Evidence View Link */}
              <button
                onClick={() => onViewEvidence(selectedNode.evidenceId)}
                className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Inspect Source Log ({selectedNode.evidenceId})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="bg-[#0b101d] border border-dashed border-[#1e2e4a] rounded-2xl p-8 text-center space-y-3">
              <Network className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-xs font-bold text-slate-300">No Node Selected</div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Click any IP address, API key, system, or file in the graph to view its interconnected forensic path and open original records.
              </p>
            </div>
          )}

          {/* Forensic Rule Box */}
          <div className="p-4 rounded-xl bg-[#070b14] border border-[#1e2e4a] text-xs space-y-2">
            <span className="font-bold text-cyan-400 flex items-center gap-1.5 font-mono text-[11px]">
              <Info className="w-3.5 h-3.5" />
              <span>Cross-System Correlation Logic</span>
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              This topology ties together events that TallyBridge treated as disconnected: external IP recon &rarr; HelpDeskr credential harvesting &rarr; BlueVault banking exfiltration &rarr; PrivateLink build-host bank alteration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
