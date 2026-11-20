import React, { useState } from 'react';
import { 
  Clock, 
  Search, 
  Filter, 
  AlertTriangle, 
  Server, 
  ShieldAlert, 
  HardDrive, 
  Network, 
  DollarSign, 
  KeyRound,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { TimelineEvent } from '../types';

interface IncidentTimelineProps {
  timeline: TimelineEvent[];
  onViewEvidence: (evidenceId: string) => void;
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ 
  timeline, 
  onViewEvidence 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'ALL', label: 'All Events' },
    { id: 'api_activity', label: 'API Calls', icon: Server },
    { id: 'support_export', label: 'Support Exports', icon: HardDrive },
    { id: 'file_access', label: 'Storage Access', icon: HardDrive },
    { id: 'financial_change', label: 'Financial Changes', icon: DollarSign },
    { id: 'network_activity', label: 'Network Flows', icon: Network },
  ];

  const filteredEvents = timeline.filter(event => {
    const matchesCategory = selectedCategory === 'ALL' || event.category === selectedCategory;
    const matchesSearch = event.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.source_ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.evidence_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.significance.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryMarker = (category: string) => {
    switch (category) {
      case 'financial_change':
        return {
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          dot: 'bg-rose-500',
          label: 'Financial Change'
        };
      case 'file_access':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-500',
          label: 'File Storage'
        };
      case 'support_export':
        return {
          bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          dot: 'bg-indigo-500',
          label: 'Support Export'
        };
      case 'network_activity':
        return {
          bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          dot: 'bg-purple-500',
          label: 'Network Tunnel'
        };
      default:
        return {
          bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          dot: 'bg-cyan-500',
          label: 'API Activity'
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
              <Clock className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Cross-System Incident Chronology</h1>
              <p className="text-xs text-slate-400">
                Normalized timeline correlating events across LedgerOne, HelpDeskr, BlueVault, and PrivateLink.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search timeline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors w-44 md:w-52"
            />
          </div>

          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs flex-wrap">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  selectedCategory === c.id 
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clock Drift Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span><strong>Timestamp Normalization:</strong> All primary timestamps converted to UTC. Local times (HelpDeskr IST UTC+5:30) and storage epochs preserved.</span>
        </div>
        <span className="font-mono text-cyan-400 font-bold">{filteredEvents.length} Correlated Events</span>
      </div>

      {/* Timeline List */}
      <div className="relative pl-6 sm:pl-8 border-l border-slate-800 space-y-6 my-4">
        {filteredEvents.map((event, idx) => {
          const marker = getCategoryMarker(event.category);
          return (
            <div key={event.id || idx} className="relative group">
              {/* Timeline Marker Dot */}
              <div className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${marker.dot} ring-4 ring-slate-900`}></div>

              {/* Event Card */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all hover:bg-slate-850">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5 mb-2.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-mono font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {event.ts_utc.replace('T', ' ').replace('Z', ' UTC')}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${marker.bg}`}>
                      {marker.label}
                    </span>
                    <button
                      onClick={() => onViewEvidence(event.evidence_id)}
                      className="text-[10px] font-mono bg-cyan-950/80 text-cyan-300 hover:bg-cyan-900 px-2 py-0.5 rounded border border-cyan-800/60 transition-colors"
                      title="Inspect source evidence file"
                    >
                      {event.evidence_id}
                    </button>
                    <span className="text-xs text-slate-400">
                      System: <strong className="text-slate-300">{event.source_system}</strong>
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                    <span>IP: <strong className="text-amber-400">{event.source_ip || 'N/A'}</strong></span>
                    <span>•</span>
                    <span>Actor: <strong className="text-slate-300">{event.actor}</strong></span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-mono text-slate-200">
                    {event.details}
                  </div>
                  <div className="text-xs text-slate-400 flex items-start gap-1.5 pt-1">
                    <span className="font-semibold text-cyan-400 shrink-0">Significance:</span>
                    <span className="text-slate-300 leading-relaxed">{event.significance}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
