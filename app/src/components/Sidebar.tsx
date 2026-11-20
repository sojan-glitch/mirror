import React from 'react';
import { 
  ShieldCheck, 
  FileCheck2, 
  FileSearch, 
  Clock, 
  AlertTriangle, 
  FileText, 
  UploadCloud,
  Bot,
  Network,
  Mail,
  Scale,
  FolderLock,
  Sun,
  Moon,
  LogOut,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  claimsCount: {
    total: number;
    supported: number;
    contradicted: number;
    mixed: number;
    unverified: number;
  };
  officerSession?: {
    badgeId: string;
    officerName: string;
    role: string;
    clearanceLevel: string;
  } | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  theme, 
  setTheme, 
  claimsCount,
  officerSession,
  onLogout
}) => {
  const isDark = theme === 'dark';

  const menuItems = [
    { id: 'dashboard', label: 'Executive Overview', icon: Scale, badge: 'Live', badgeColor: isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    { id: 'notices', label: "Culprit's Explanation", icon: Mail, badge: 'E16 Formal Notice', badgeColor: isDark ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' : 'bg-amber-50 text-amber-700 border border-amber-200' },
    { id: 'claims', label: 'Claim Adjudication', icon: FileCheck2, badge: `${claimsCount.contradicted} Contradicted`, badgeColor: isDark ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' : 'bg-rose-50 text-rose-700 border border-rose-200' },
    { id: 'assistant', label: 'Forensic AI Counsel', icon: Bot, badge: 'Evidence Q&A', badgeColor: isDark ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' : 'bg-blue-50 text-blue-700 border border-blue-200' },
    { id: 'graph', label: 'Relationship Topology', icon: Network, badge: 'Interactive', badgeColor: isDark ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 border border-indigo-200' },
    { id: 'coastal', label: 'Coastal Case Study', icon: AlertTriangle, badge: 'Bank Mod', badgeColor: isDark ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' : 'bg-rose-50 text-rose-700 border border-rose-200' },
    { id: 'evidence', label: 'Evidence Vault', icon: FileSearch, badge: '20 Sources', badgeColor: isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-700 border border-slate-200' },
    { id: 'timeline', label: 'Consolidated Timeline', icon: Clock, badge: null, badgeColor: '' },
    { id: 'report', label: 'Admissible Dossier', icon: FileText, badge: 'PDF Export', badgeColor: isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-700 border border-slate-200' },
    { id: 'upload', label: 'Evidence Ingestion', icon: UploadCloud, badge: null, badgeColor: '' },
  ];

  return (
    <aside className={`w-68 flex flex-col justify-between shrink-0 select-none relative z-20 transition-colors duration-200 ${
      isDark 
        ? 'bg-[#0e1422] border-r border-[#1e293b] text-slate-200' 
        : 'bg-white border-r border-slate-200 text-slate-800 shadow-sm'
    }`}>
      <div>
        {/* Brand Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-[#1e293b] bg-[#0c121e]' : 'border-slate-200 bg-slate-50/70'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-b from-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-900/30 ring-1 ring-blue-400/30">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className={`text-sm font-bold tracking-tight flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <span>PROJECT MIRROR</span>
              </div>
              <div className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Forensic Defense Dossier
              </div>
            </div>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDark 
                ? 'bg-[#151f33] border-[#223352] text-amber-300 hover:text-white hover:bg-[#1d2b47]' 
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Case Reference Card */}
        <div className={`p-3 mx-3 my-3 rounded-lg border text-xs space-y-1.5 ${
          isDark 
            ? 'bg-[#141d2f] border-[#1e2e46]' 
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FolderLock className="w-3.5 h-3.5 text-blue-500" />
              <span className={`text-[10px] uppercase font-semibold tracking-wider ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                Case CR-26-047
              </span>
            </div>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
              isDark 
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                : 'text-emerald-700 bg-emerald-50 border-emerald-300'
            }`}>
              Verified
            </span>
          </div>
          <div className={`font-semibold text-xs truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            Harbor & Finch v. TallyBridge
          </div>
          <div className={`text-[10px] flex items-center justify-between pt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>Target: TallyBridge Software</span>
            <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>7 Core Claims</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold'
                    : isDark 
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-[#152033]' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${
                    isActive 
                      ? 'text-white' 
                      : isDark ? 'text-slate-400' : 'text-slate-500'
                  }`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0 ml-1.5 ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Officer Clearance Session */}
      {officerSession && (
        <div className={`mx-3 mb-2 p-2.5 rounded-lg border text-xs ${
          isDark 
            ? 'bg-blue-950/20 border-blue-900/40 text-slate-300' 
            : 'bg-blue-50 border-blue-200 text-blue-900'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1.5 font-semibold text-[11px] text-blue-400">
              <UserCheck className="w-3.5 h-3.5" />
              {officerSession.officerName.split(' ')[0]} {officerSession.officerName.split(' ')[1] || ''}
            </span>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded border border-emerald-500/20">
              3-STEP VERIFIED
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono truncate">
            {officerSession.badgeId} • {officerSession.role}
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className={`mt-2 w-full flex items-center justify-center space-x-1.5 py-1 px-2 rounded text-[10px] font-medium transition cursor-pointer ${
                isDark 
                  ? 'bg-slate-800/80 hover:bg-rose-950/40 hover:text-rose-300 border border-slate-700/60' 
                  : 'bg-white hover:bg-rose-50 hover:text-rose-600 border border-slate-200'
              }`}
            >
              <LogOut className="w-3 h-3 text-rose-400" />
              <span>Lock Terminal / Logout</span>
            </button>
          )}
        </div>
      )}

      {/* Footer Info */}
      <div className={`p-3 border-t text-[10px] flex items-center justify-between ${
        isDark 
          ? 'border-[#1e293b] bg-[#0c121e] text-slate-400' 
          : 'border-slate-200 bg-slate-50 text-slate-500'
      }`}>
        <span className="font-mono text-[9px]">HARBOR-FINCH DEFENSE</span>
        <span className="text-[9px] font-semibold tracking-wider">CONFIDENTIAL</span>
      </div>
    </aside>
  );
};
