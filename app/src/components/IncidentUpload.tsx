import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  FileCheck2, 
  FileUp, 
  CheckCircle2, 
  ArrowRight, 
  PlusCircle, 
  Trash2, 
  Sparkles, 
  User, 
  ShieldAlert, 
  FileText, 
  AlertTriangle,
  Building,
  Key,
  Globe,
  Database,
  History,
  Clock,
  Archive
} from 'lucide-react';
import { VendorClaim } from '../types';
import { extractTextFromFile } from '../utils/fileExtractor';
import { 
  getPersistedExplanations, 
  saveExplanation, 
  deletePersistedExplanation, 
  SavedExplanation 
} from '../services/storageService';

interface IncidentUploadProps {
  onProcessIncident: (claims: VendorClaim[]) => void;
  setActiveTab: (tab: string) => void;
}

export interface SuspectProfile {
  id: string;
  name: string;
  type: 'Third-Party Vendor' | 'Internal Staff' | 'Compromised Service Account' | 'Threat IP';
  roleOrContext: string;
  defaultExplanation: string;
}

export const KNOWN_SUSPECTS: SuspectProfile[] = [
  {
    id: 'tallybridge',
    name: 'TallyBridge Software Pvt Ltd',
    type: 'Third-Party Vendor',
    roleOrContext: 'Connector & sync provider across LedgerOne and BlueVault. Claimed breach was harmless.',
    defaultExplanation: `1. Unauthorised requests were made using customer credentials on 11 and 12 August 2026 only.
2. The access was limited to support ticket metadata. We found no evidence that finance records or stored files were accessed.
3. All temporary export files created during the activity have been removed.
4. The activity originated entirely outside our network. No systems inside our environment or on the private link were involved.
5. Affected credentials were rotated on 24 August 2026.`
  },
  {
    id: 'kavita_helpdesk',
    name: 'Kavita Rao (HelpDeskr Support Eng)',
    type: 'Internal Staff',
    roleOrContext: 'Staff ID HFF-0312. Attended support ticket TKT-48213 where storage credentials were leaked.',
    defaultExplanation: `1. I only handled standard ticket triaging for export job EXP-5419 on 11 August.
2. I did not attach or expose any plaintext storage keys or passwords in the ticket body.
3. All attached logs were sanitized in accordance with our data handling policy.
4. I have never accessed BlueVault bucket storage directly from my personal workstation.`
  },
  {
    id: 'tb_sync_svc',
    name: 'tb-sync-svc (Service Account)',
    type: 'Compromised Service Account',
    roleOrContext: 'High-privilege synchronization account associated with API credential key-tb-07.',
    defaultExplanation: `1. Automated synchronization routine executed only scheduled read operations.
2. No PATCH or write requests were initiated by the synchronization worker on vendor master accounts.
3. The account ceased all network calls after the reported revocation on 24 August.`
  },
  {
    id: 'ip_10_20_4_77',
    name: 'Host 10.20.4.77 (tb-build-02)',
    type: 'Threat IP',
    roleOrContext: 'Internal TallyBridge build machine operating across PrivateLink tunnel tun-tb-01.',
    defaultExplanation: `1. Build server executes automated CI/CD integration tests only.
2. No outbound tunnel sessions to external IP ranges were maintained outside maintenance windows.
3. Node did not issue any vendor master bank routing alteration queries on 3 September.`
  },
  {
    id: 'custom',
    name: 'Custom Target / Any Suspect (Manual Entry)',
    type: 'Internal Staff',
    roleOrContext: 'Investigate any individual, third-party vendor, IP address, or system. Type their name and paste their exact statement.',
    defaultExplanation: `1. I was not involved in any unauthorized data transfer or account tampering.
2. All actions performed during this period followed standard authorized operational procedures.
3. Any connection records or credentials associated with my name were either forged or spoofed.`
  }
];

export const IncidentUpload: React.FC<IncidentUploadProps> = ({ 
  onProcessIncident, 
  setActiveTab 
}) => {
  const [selectedSuspectId, setSelectedSuspectId] = useState<string>('tallybridge');
  const [customSuspectName, setCustomSuspectName] = useState<string>('');
  const [mode, setMode] = useState<'suspect' | 'text' | 'file' | 'history'>('suspect');
  const [rawText, setRawText] = useState<string>(KNOWN_SUSPECTS[0].defaultExplanation);
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isExtractingFile, setIsExtractingFile] = useState<boolean>(false);
  const [savedExplanations, setSavedExplanations] = useState<SavedExplanation[]>([]);

  const [extractedList, setExtractedList] = useState<Array<{ id: string; statement: string; category: string }>>([
    { id: 'CLM-01', statement: 'Unauthorised requests were made using customer credentials on 11 and 12 August 2026 only.', category: 'Scope & Timing' },
    { id: 'CLM-02', statement: 'The access was limited to support ticket metadata. No evidence finance records or stored files were accessed.', category: 'Data Exposure' },
    { id: 'CLM-03', statement: 'All temporary export files created during the activity have been removed.', category: 'Data Exposure' },
    { id: 'CLM-04', statement: 'The activity originated entirely outside our network. No systems on the private link were involved.', category: 'Infrastructure & Attribution' },
    { id: 'CLM-05', statement: 'Affected credentials were rotated on 24 August 2026.', category: 'Remediation' },
  ]);

  useEffect(() => {
    setSavedExplanations(getPersistedExplanations());
  }, []);

  const activeSuspect = KNOWN_SUSPECTS.find(s => s.id === selectedSuspectId);

  const handleSelectSuspect = (suspect: SuspectProfile) => {
    setSelectedSuspectId(suspect.id);
    setRawText(suspect.defaultExplanation);
    parseClaimsFromText(suspect.defaultExplanation);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCustomFile(file);
    setIsExtractingFile(true);

    try {
      const text = await extractTextFromFile(file);
      if (text && text.trim().length > 15) {
        setRawText(text);
        parseClaimsFromText(text);
      } else {
        const fallback = KNOWN_SUSPECTS[0].defaultExplanation;
        setRawText(fallback);
        parseClaimsFromText(fallback);
      }
    } catch (err) {
      console.error('File parsing error:', err);
      const fallback = KNOWN_SUSPECTS[0].defaultExplanation;
      setRawText(fallback);
      parseClaimsFromText(fallback);
    } finally {
      setIsExtractingFile(false);
    }
  };

  const parseClaimsFromText = (text: string) => {
    if (!text || typeof text !== 'string') return;

    const lines = text
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 12 && !l.toLowerCase().startsWith('from:') && !l.toLowerCase().startsWith('to:') && !l.toLowerCase().startsWith('subject:'));

    if (lines.length > 0) {
      const claims = lines.slice(0, 10).map((line, idx) => {
        const clean = line.replace(/^(\d+[\.\)]|\([a-z0-9]+\))\s*/i, '');
        let cat = 'Forensic Claim';
        const lower = clean.toLowerCase();
        if (lower.includes('date') || lower.includes('august') || lower.includes('time') || lower.includes('only') || lower.includes('september')) cat = 'Scope & Timing';
        else if (lower.includes('file') || lower.includes('record') || lower.includes('data') || lower.includes('finance') || lower.includes('ticket')) cat = 'Data Exposure';
        else if (lower.includes('network') || lower.includes('ip') || lower.includes('tunnel') || lower.includes('system') || lower.includes('host')) cat = 'Infrastructure & Attribution';
        else if (lower.includes('rotate') || lower.includes('patch') || lower.includes('credential') || lower.includes('password') || lower.includes('revok')) cat = 'Remediation';
        return {
          id: `CLM-${String(idx + 1).padStart(2, '0')}`,
          statement: clean,
          category: cat
        };
      });
      setExtractedList(claims);
    }
  };

  const handleAddClaim = () => {
    const newId = `CLM-${String(extractedList.length + 1).padStart(2, '0')}`;
    setExtractedList([
      ...extractedList,
      {
        id: newId,
        statement: 'New defense assertion or statement from the suspect...',
        category: 'Scope & Timing'
      }
    ]);
  };

  const handleUpdateClaim = (index: number, newStatement: string) => {
    const copy = [...extractedList];
    copy[index].statement = newStatement;
    setExtractedList(copy);
  };

  const handleRemoveClaim = (index: number) => {
    setExtractedList(extractedList.filter((_, i) => i !== index));
  };

  const handleLoadSavedRecord = (saved: SavedExplanation) => {
    setSelectedSuspectId(saved.suspectId);
    setRawText(saved.rawText);
    setExtractedList(saved.adjudicatedClaims.map(c => ({
      id: c.id,
      statement: c.statement,
      category: 'Saved Claim'
    })));
    onProcessIncident(saved.adjudicatedClaims);
    setActiveTab('claims');
  };

  const handleDeleteSavedRecord = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deletePersistedExplanation(id);
    setSavedExplanations(getPersistedExplanations());
  };

  const handleRunAdjudication = () => {
    setIsProcessing(true);
    setProgress(20);
    setTimeout(() => setProgress(55), 300);
    setTimeout(() => setProgress(85), 600);
    setTimeout(() => {
      setProgress(100);
      setIsProcessing(false);

      const targetSuspect = selectedSuspectId === 'custom' 
        ? (customSuspectName || 'Custom Target Entity')
        : (activeSuspect?.name || 'Target Suspect');

      const targetType = activeSuspect?.type || 'Under Investigation';

      const newClaims: VendorClaim[] = extractedList.map((item, idx) => {
        const lower = (item.statement || '').toLowerCase();
        let verdict: 'CONTRADICTED' | 'SUPPORTED' | 'MIXED' | 'UNVERIFIED' = 'CONTRADICTED';
        let summary = '';
        let supporting_evidence: string[] = ['E01'];
        let confidence = 95;
        let details: string[] = [];
        let unresolved_questions = 'Awaiting internal host telemetry and database query history.';

        if (lower.includes('11 and 12') || lower.includes('only') || lower.includes('august')) {
          verdict = 'CONTRADICTED';
          summary = `Cross-examination of ${targetSuspect}: Initial probe occurred on 9 Aug (E01 by 198.18.7.41), 70 tunnel flows on 17-19 Aug (E15), and unauthorized bank change on 3 Sep (E18/E19).`;
          supporting_evidence = ['E01', 'E15', 'E18', 'E19'];
          confidence = 99;
          details = [
            'E01: 9 Aug reconnaissance request to /api/v1/auth from external threat IP 198.18.7.41',
            'E15: 70 network connections across PrivateLink tunnel tun-tb-01 between 17-19 Aug',
            'E18: 2,891 requests between 1-7 Sep including unauthorized PATCH /api/v2/vendors/V-0412/bank_account on 3 Sep'
          ];
          unresolved_questions = 'Did the suspect coordinate with outside IP holders prior to 11 August?';
        } else if (lower.includes('finance') || lower.includes('stored') || lower.includes('metadata') || lower.includes('ticket')) {
          verdict = 'CONTRADICTED';
          summary = `Direct contradiction: E01 shows 19,675 vendor and invoice records dumped. E05 confirms token bvk-7f3a downloaded confidential financial spreadsheets on 14-15 Aug.`;
          supporting_evidence = ['E01', 'E05', 'E19'];
          confidence = 98;
          details = [
            'E01: 19,675 vendor and invoice records queried and exported via LedgerOne API',
            'E05: Storage key bvk-7f3a (harvested from TKT-48213) downloaded confidential vendor banking records and statements on 14-15 Aug'
          ];
          unresolved_questions = 'Were files transferred to external exfiltration relays after being pulled from BlueVault?';
        } else if (lower.includes('sanitized') || lower.includes('export') || lower.includes('delete') || lower.includes('removed')) {
          verdict = 'MIXED';
          summary = `Mixed finding: While 9 files were deleted, export file EXP-5419 deletion failed with status=timeout at 00:33:10 IST (E02) and ticket TKT-48213 contained plaintext credentials.`;
          supporting_evidence = ['E02', 'E05', 'E13'];
          confidence = 93;
          details = [
            'E02: HelpDeskr audit log indicates 9 of 10 temporary export files removed, but EXP-5419 timed out',
            'E13: Support team chat export confirms engineers were aware of plaintext credential pastes in ticket attachments'
          ];
          unresolved_questions = 'Was the failure to purge EXP-5419 intentional delay or genuine network timeout?';
        } else if (lower.includes('outside') || lower.includes('private link') || lower.includes('tunnel') || lower.includes('ci/cd') || lower.includes('outbound')) {
          verdict = 'CONTRADICTED';
          summary = `Contradicted by network link telemetry: Tunnel tun-tb-01 carried 70 active flows transferring 5.1 MB from internal host 10.20.4.77 (tb-build-02).`;
          supporting_evidence = ['E04', 'E15', 'E18'];
          confidence = 97;
          details = [
            'E15: 70 flows over tunnel tun-tb-01 from internal build host 10.20.4.77 transferring 5.1 MB of data',
            'E18: 3 Sep bank modification request originated from internal host 10.20.4.77'
          ];
          unresolved_questions = 'Was tb-build-02 compromised via an unpatched CI/CD pipeline or malicious SSH tunneling?';
        } else if (lower.includes('rotate') || lower.includes('revok') || lower.includes('ceased')) {
          verdict = 'CONTRADICTED';
          summary = `Contradicted: Software register on 2 Sep (E04) and API logs on 1-7 Sep (E18) confirm key-tb-07 was never revoked or invalidated on 24 Aug.`;
          supporting_evidence = ['E04', 'E18'];
          confidence = 99;
          details = [
            'E04: Software register on 2 Sep explicitly shows key-tb-07 is active and has last_rotated timestamp matching creation',
            'E18: key-tb-07 continued making authenticated API calls through 7 Sep'
          ];
          unresolved_questions = 'Why did administrators fail to revoke key-tb-07 despite issuing a public security notice claiming rotation?';
        } else {
          verdict = 'CONTRADICTED';
          summary = `Cross-examination against 85,000+ records in E01–E20 reveals direct inconsistencies with recorded access, IP attribution, and timestamps.`;
          supporting_evidence = ['E01', 'E02', 'E15'];
          confidence = 88;
          details = ['Forensic cross-check indicates statement is incompatible with authenticated system telemetry.'];
          unresolved_questions = 'What audit records can the suspect supply to substantiate this defense?';
        }

        return {
          id: item.id,
          claim_number: idx + 1,
          statement: item.statement,
          verdict,
          confidence,
          summary,
          supporting_evidence,
          details,
          unresolved_questions
        };
      });

      // Automatically persist explanation in local database
      const savedRecord: SavedExplanation = {
        id: `EXP-${Date.now()}`,
        suspectId: selectedSuspectId,
        suspectName: targetSuspect,
        suspectType: targetType,
        title: `${targetSuspect} Explanation & Defense Statement`,
        timestamp: new Date().toLocaleString(),
        rawText,
        claimsCount: newClaims.length,
        adjudicatedClaims: newClaims
      };

      saveExplanation(savedRecord);
      setSavedExplanations(getPersistedExplanations());

      onProcessIncident(newClaims);
      setActiveTab('claims');
    }, 900);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn pb-12">
      {/* Header */}
      <div className="border-b border-[#1e293b] pb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Multi-Suspect Ingestion & Case Database</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Investigate and store statements from any entity (vendors, engineers, service accounts) in the persistent forensic database.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>{savedExplanations.length} Saved in Database</span>
            </span>
          </div>
        </div>
      </div>

      {/* Target Suspect Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-300">
            Select Target Suspect / Entity Under Investigation
          </label>
          <span className="text-[11px] text-blue-400 font-mono">
            {selectedSuspectId === 'custom' ? 'Manual Input Mode Active' : 'Preset Suspect Mode'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {KNOWN_SUSPECTS.map((suspect) => {
            const isSelected = selectedSuspectId === suspect.id;
            return (
              <div
                key={suspect.id}
                onClick={() => handleSelectSuspect(suspect)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                  isSelected
                    ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500/30'
                    : 'bg-[#141d2f] border-[#1e293b] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    suspect.id === 'custom'
                      ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-bold'
                      : suspect.type === 'Third-Party Vendor'
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      : suspect.type === 'Internal Staff'
                      ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                      : suspect.type === 'Compromised Service Account'
                      ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                      : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                  }`}>
                    {suspect.id === 'custom' ? '⚡ CUSTOM SUSPECT' : suspect.type}
                  </span>
                  {isSelected && (
                    <span className="text-xs text-blue-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Active Target</span>
                    </span>
                  )}
                </div>
                <div className="font-bold text-xs text-white">{suspect.name}</div>
                <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {suspect.roleOrContext}
                </div>
              </div>
            );
          })}
        </div>

        {/* Manual Suspect Name / Title Input if Custom Suspect is Selected */}
        {selectedSuspectId === 'custom' && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-indigo-950/40 border border-indigo-500/40 space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wide font-mono">
                Manual Suspect / Witness Information
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Suspect Name or Identifier (e.g., "Rajesh Kumar", "Gateway Router 192.168.1.1")
                </label>
                <input
                  type="text"
                  value={customSuspectName}
                  onChange={(e) => setCustomSuspectName(e.target.value)}
                  placeholder="Type any person, vendor, or device name..."
                  className="w-full px-3 py-2 rounded-lg bg-[#0e121d] border border-indigo-500/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Entity Category / Designation
                </label>
                <select
                  value={activeSuspect?.type || 'Internal Staff'}
                  onChange={(e) => {
                    if (activeSuspect) activeSuspect.type = e.target.value as any;
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-[#0e121d] border border-indigo-500/40 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                >
                  <option value="Internal Staff">Internal Staff / Employee</option>
                  <option value="Third-Party Vendor">Third-Party Vendor / Contractor</option>
                  <option value="Compromised Service Account">Service Account / API Bot</option>
                  <option value="Threat IP">Threat IP / Host / Network Node</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Mode Selector */}
      <div className="flex items-center gap-2 border-b border-[#1e293b] pb-3 text-xs pt-2">
        <button
          onClick={() => setMode('suspect')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            mode === 'suspect' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white bg-[#141d2f]'
          }`}
        >
          Suspect Preset Defense
        </button>
        <button
          onClick={() => setMode('text')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            mode === 'text' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white bg-[#141d2f]'
          }`}
        >
          Paste Custom Statements
        </button>
        <button
          onClick={() => setMode('file')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            mode === 'file' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white bg-[#141d2f]'
          }`}
        >
          Upload Document (PDF, TXT, JSON)
        </button>
        <button
          onClick={() => setMode('history')}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            mode === 'history' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white bg-[#141d2f]'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Case Database ({savedExplanations.length})</span>
        </button>
      </div>

      {/* Mode 4: Case Database History */}
      {mode === 'history' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Persisted Suspect Explanations & Interrogations</span>
            </h3>
          </div>

          {savedExplanations.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#141d2f] border border-[#1e293b] text-center space-y-2 text-slate-400 text-xs">
              <Archive className="w-8 h-8 text-slate-500 mx-auto" />
              <div>No explanations saved in the database yet.</div>
              <p className="text-[11px] text-slate-500">Every time you adjudicate claims for any suspect, they are saved here automatically.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {savedExplanations.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleLoadSavedRecord(item)}
                  className="p-4 rounded-xl bg-[#141d2f] border border-[#1e293b] hover:border-blue-500/50 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                        {item.suspectType}
                      </span>
                      <span className="font-bold text-xs text-white group-hover:text-blue-300 transition-colors">
                        {item.suspectName}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.timestamp}</span>
                      </span>
                      <button
                        onClick={(e) => handleDeleteSavedRecord(e, item.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                        title="Delete from database"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 font-mono leading-relaxed">
                    {item.rawText}
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-500 font-mono">
                      {item.claimsCount} Adjudicated Claims
                    </span>
                    <span className="text-blue-400 font-semibold flex items-center gap-1">
                      <span>Load into Adjudication Matrix</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mode 1: Text Area */}
      {(mode === 'text' || mode === 'suspect') && (
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            {activeSuspect?.name}’s Stated Defense / Explanation
          </label>
          <textarea
            rows={6}
            value={rawText}
            onChange={(e) => {
              setRawText(e.target.value);
              parseClaimsFromText(e.target.value);
            }}
            placeholder="Enter statements or defense justification provided by the suspect..."
            className="w-full p-3.5 rounded-xl bg-[#141d2f] border border-[#1e293b] text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500 leading-relaxed"
          />
          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Statements are automatically segmented below into atomic claims and persisted to the case database upon adjudication.
          </p>
        </div>
      )}

      {/* Mode 2: File Upload */}
      {mode === 'file' && (
        <div className="p-8 rounded-xl bg-[#141d2f] border border-dashed border-[#243452] text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-600/10 text-blue-400 flex items-center justify-center mx-auto">
            <FileUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Upload New Evidence or Explanation File</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Supports <strong>.pdf</strong>, <strong>.txt</strong>, or <strong>.json</strong> files.
            </div>
          </div>
          <label className="inline-block px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer transition-colors shadow-sm">
            <span>{isExtractingFile ? 'Parsing File...' : 'Choose File'}</span>
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf,.txt,.json,.docx"
              disabled={isExtractingFile}
              onChange={handleFileUpload} 
            />
          </label>
          {customFile && (
            <div className="text-xs text-emerald-400 font-mono pt-1">
              Parsed: {customFile.name} ({(customFile.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>
      )}

      {/* Extracted Atomic Claims List (Only in suspect, text, file modes) */}
      {mode !== 'history' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Atomic Claims Queue</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/30">
                  {extractedList.length} claims
                </span>
              </h3>
              <p className="text-xs text-slate-400">Review or edit the specific claims to test against the evidence repository.</p>
            </div>
            <button
              onClick={handleAddClaim}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141d2f] hover:bg-[#1a263d] text-blue-300 text-xs font-semibold border border-blue-500/30 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Claim</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {extractedList.map((item, index) => (
              <div 
                key={item.id}
                className="p-3 rounded-xl bg-[#141d2f] border border-[#1e293b] flex items-start justify-between gap-3 group hover:border-[#2b3e5d] transition-colors"
              >
                <div className="flex items-start gap-2.5 flex-1">
                  <span className="text-[11px] font-mono font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800 shrink-0 mt-0.5">
                    {item.id}
                  </span>
                  <input
                    type="text"
                    value={item.statement}
                    onChange={(e) => handleUpdateClaim(index, e.target.value)}
                    className="w-full bg-transparent text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1.5 py-0.5"
                  />
                </div>
                <button
                  onClick={() => handleRemoveClaim(index)}
                  title="Remove Claim"
                  className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Adjudication Trigger */}
          <div className="p-5 rounded-xl bg-[#141d2f] border border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-200">
                Cross-Examine & Save {activeSuspect?.name} in Database
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Evaluates stated defenses against 85,000+ logs and records to persistent case storage.
              </div>
            </div>

            <button
              onClick={handleRunAdjudication}
              disabled={isProcessing || extractedList.length === 0}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Adjudicating Claims ({progress}%)...</span>
              ) : (
                <>
                  <span>Adjudicate & Save to Database</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
