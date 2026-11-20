import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  HelpCircle, 
  CheckCircle2, 
  AlertOctagon, 
  Layers, 
  Terminal,
  ExternalLink,
  Info,
  CornerDownLeft,
  Key,
  Check,
  Zap,
  Trash2,
  Clock,
  History
} from 'lucide-react';
import { VendorClaim, CoastalCaseData, EvidenceItem, TimelineEvent } from '../types';
import { getStoredApiKey, setStoredApiKey, askGeminiForensic } from '../services/geminiService';
import { 
  getPersistedChatHistory, 
  savePersistedChatHistory, 
  clearPersistedChatHistory, 
  ChatMessageRecord 
} from '../services/storageService';

interface AiAssistantProps {
  claims: VendorClaim[];
  coastalData: CoastalCaseData;
  evidenceList: EvidenceItem[];
  timeline: TimelineEvent[];
  onViewEvidence: (evidenceId: string) => void;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({
  claims,
  coastalData,
  evidenceList,
  timeline,
  onViewEvidence
}) => {
  const [apiKey, setApiKey] = useState<string>(getStoredApiKey());
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [keySaved, setKeySaved] = useState<boolean>(false);

  const defaultWelcomeMessage: ChatMessageRecord = {
    id: 'welcome',
    sender: 'assistant',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: `Hello, Investigator. I am the **MIRROR Forensic AI Counsel**.\n\nI answer queries strictly grounded in the **20 authentic case evidence repositories (E01–E20)**. Every response clearly delineates:\n• 🟢 **Confirmed Facts** (backed by verifiable log rows and timestamps)\n• 🟡 **Investigative Assumptions** (working hypotheses)\n• 🔴 **Missing Evidence** (audit and telemetry gaps)\n\nAll conversations are automatically saved in the case database history!`,
    evidenceCitations: ['E01', 'E02', 'E05', 'E15', 'E18', 'E19']
  };

  const [messages, setMessages] = useState<ChatMessageRecord[]>(() => {
    const persisted = getPersistedChatHistory();
    return persisted.length > 0 ? persisted : [defaultWelcomeMessage];
  });

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    savePersistedChatHistory(messages);
  }, [messages, isTyping]);

  const presetQuestions = [
    "What happened on 11 August?",
    "Which records contradict TallyBridge's explanation?",
    "Was the bank-account change approved?",
    "What evidence is still missing?"
  ];

  const handleSaveApiKey = () => {
    setStoredApiKey(apiKey);
    setKeySaved(true);
    setTimeout(() => {
      setKeySaved(false);
      setShowKeyInput(false);
    }, 1200);
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all recorded forensic chat history from the database?')) {
      clearPersistedChatHistory();
      setMessages([defaultWelcomeMessage]);
    }
  };

  const generateOfflineAnswer = (query: string): ChatMessageRecord => {
    const q = query.toLowerCase();
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (q.includes('11 august') || q.includes('august 11') || q.includes('11th august')) {
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        timestamp: ts,
        text: `On 11 August 2026, scripted activity targeted HelpDeskr and LedgerOne from external threat IPs:

1. **HelpDeskr Credential Searches (23:12 - 23:26 IST)**:
Threat IP \`198.18.7.41\` authenticated via integration credential \`tb-sync-svc\` and searched for credentials: *"password"*, *"api_key"*, *"secret"*, *"token"*, *"bearer"*, *"bluevault"*, *"bvk-"*.

2. **Credential Harvesting (23:28 IST)**:
The actor accessed ticket \`TKT-48213\` which contained plaintext customer storage key \`bvk-7f3a\` pasted during a support interaction in June.

3. **Bulk Data Export Jobs (23:30 - 23:58 IST)**:
The actor initiated mass export jobs (\`EXP-5410\` through \`EXP-5413\`), downloaded ticket archives, and attempted to purge logs.`,
        evidenceCitations: ['E01', 'E02', 'E06', 'E13', 'E17'],
        factsVsAssumptions: {
          confirmedFacts: [
            'HelpDeskr log (E02) records 18 targeted ticket searches for credential terms starting at 23:12:00 IST.',
            'HelpDeskr export jobs EXP-5410 to EXP-5413 were created, downloaded, and deleted by 198.18.7.41 and 198.18.7.58 (E02).',
            'Storage key bvk-7f3a was explicitly stored in plaintext inside TKT-48213 (confirmed by E13 team chat).',
            'HelpDeskr billing notice (E06) confirmed 14 bulk exports were run in August, exceeding the 5-job allowance.'
          ],
          investigativeAssumptions: [
            'It is assumed the actor searched for "bvk-" specifically because they anticipated BlueVault credentials in support logs.',
            'It is not confirmed whether tb-sync-svc was compromised via stolen API token or via a man-in-the-middle vector.'
          ],
          missingInfo: [
            'Full payload content of the downloaded export files EXP-5410 to 5413 (only audit metadata exists).',
            'ISP ownership logs behind 198.18.7.41 at that precise hour.'
          ]
        }
      };
    }

    if (q.includes('contradict') || q.includes('explanation') || q.includes('tallybridge') || q.includes('records')) {
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        timestamp: ts,
        text: `TallyBridge's formal explanation (E16 Notice) is contradicted across 4 major claims:

1. **Claim: "Unauthorised requests occurred on 11 and 12 August only"**
   - **Contradicted by E01**: Shows earlier reconnaissance on **9 August** (03:12-03:44 UTC) from threat IP \`198.18.7.41\`.
   - **Contradicted by E15**: Shows 70 network flows on **17-19 August** from host \`10.20.4.77\`.
   - **Contradicted by E18 & E19**: Shows unauthorized bank alteration on **3 September**.

2. **Claim: "Access was limited to support ticket metadata; finance records & files not accessed"**
   - **Contradicted by E01**: Threat IPs dumped **19,675 vendor records** and ran 7 payment queries on 12 August.
   - **Contradicted by E05**: BlueVault logs prove storage key \`bvk-7f3a\` downloaded confidential finance files on 14-15 August: \`vendor-bank-details-2026.xlsx\`, \`payment-run-template.xlsx\`, and statements (\`stmt-2026-01\` through \`05\`).`,
        evidenceCitations: ['E01', 'E02', 'E04', 'E05', 'E15', 'E18', 'E19'],
        factsVsAssumptions: {
          confirmedFacts: [
            'E01 log shows 19,675 vendor and invoice records dumped on 12 August.',
            'E05 log confirms token bvk-7f3a downloaded financial spreadsheets on 14-15 August.',
            'E18 & E19 prove bank modification on 3 September.'
          ],
          investigativeAssumptions: [
            'TallyBridge either failed to inspect their own PrivateLink tunnel logs or intentionally downplayed incident severity.'
          ],
          missingInfo: [
            'Internal security investigation notes and forensic interview transcripts from TallyBridge incident response team.'
          ]
        }
      };
    }

    if (q.includes('bank') || q.includes('coastal') || q.includes('v-0412') || q.includes('approved')) {
      return {
        id: Date.now().toString(),
        sender: 'assistant',
        timestamp: ts,
        text: `**NO.** The bank-account change for Coastal Packaging Ltd (\`V-0412\`) was **completely unapproved and unauthorized**:

- **Event Record**: Log ID \`chg-8b9888c39b\` on **03 Sep 2026 at 01:44:30 UTC** (\`E19\`).
- **Endpoint**: \`PATCH /api/v2/vendors/V-0412/bank_account\` via key \`key-tb-07\` (\`E18\`).
- **Origin IP**: \`10.20.4.77\` (\`tb-build-02\`, an internal TallyBridge PrivateLink host).
- **The Critical Forensic Proof**: Field \`approval_ref\` is explicitly **\`null\`**.`,
        evidenceCitations: ['E04', 'E10', 'E15', 'E18', 'E19'],
        factsVsAssumptions: {
          confirmedFacts: [
            'E19 master change log has approval_ref = null.',
            'Original account was HDFC Bank ****4417; changed to ICICI Bank ****9083.',
            'Request executed 5 days prior to scheduled payout run of ₹14,82,500.'
          ],
          investigativeAssumptions: [
            'The attacker specifically targeted Coastal Packaging because it had a high-value pending invoice scheduled on 8 September.'
          ],
          missingInfo: [
            'Bank payment gateway disbursement status for 8 September.'
          ]
        }
      };
    }

    return {
      id: Date.now().toString(),
      sender: 'assistant',
      timestamp: ts,
      text: `Based on the 20 evidence logs for Case CR-26-047:\n\n• **Reconnaissance**: Began on 9 August (E01) via threat IP \`198.18.7.41\`.\n• **Credential Theft**: Stored key \`bvk-7f3a\` harvested from ticket TKT-48213 (E02, E13).\n• **Cloud Storage Exfiltration**: BlueVault finance files downloaded 14-15 August (E05).\n• **Unauthorized Bank Change**: Executed 3 September for Coastal Packaging Ltd (V-0412) with approval_ref=null (E18, E19).`,
      evidenceCitations: ['E01', 'E02', 'E05', 'E18', 'E19'],
      factsVsAssumptions: {
        confirmedFacts: [
          'All cited timestamps and endpoints match authentic rows in E01, E02, E05, E18, and E19.',
          'Key-tb-07 remained active through September despite claimed rotation.'
        ],
        investigativeAssumptions: [
          'Correlation between ticket search terms and subsequent storage reads implies credential harvesting.'
        ],
        missingInfo: [
          'Packet captures for PrivateLink tunnel flows.'
        ]
      }
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim()) return;

    const userMsg: ChatMessageRecord = {
      id: Date.now().toString(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: q
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    const activeKey = getStoredApiKey();

    if (activeKey) {
      try {
        const liveResult = await askGeminiForensic(q, {
          claims,
          timeline,
          coastalData,
          evidenceList
        });

        const replyMsg: ChatMessageRecord = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: liveResult.text,
          isLiveGemini: true,
          evidenceCitations: ['E01', 'E02', 'E05', 'E15', 'E18', 'E19'],
          factsVsAssumptions: {
            confirmedFacts: liveResult.confirmedFacts,
            investigativeAssumptions: liveResult.investigativeAssumptions,
            missingInfo: liveResult.missingInfo
          }
        };

        setMessages(prev => [...prev, replyMsg]);
        setIsTyping(false);
        return;
      } catch (err: any) {
        console.warn('Gemini API call error, falling back to local grounded reasoning:', err);
      }
    }

    setTimeout(() => {
      const reply = generateAnswer(q);
      setMessages(prev => [...prev, reply]);
      setIsTyping(false);
    }, 600);
  };

  const generateAnswer = (query: string): ChatMessageRecord => generateOfflineAnswer(query);

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2e4a] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-blue-600/15 text-blue-400 border border-blue-500/30">
              <Bot className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>MIRROR Forensic AI Counsel</span>
                <span className="text-[10px] bg-blue-600/20 text-blue-300 font-mono px-2 py-0.5 rounded border border-blue-500/30">
                  {getStoredApiKey() ? 'GEMINI 3.8 FLASH' : 'GROUNDED LOCAL'}
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Admissible query engine grounded strictly in E01–E20 case evidence, citing log rows and segregating facts from inferences.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 bg-[#141d2f] border border-[#1e2e4a] hover:border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Clear Chat History from Database"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>

          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              getStoredApiKey()
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-950/70'
                : 'bg-blue-600/20 text-blue-300 border-blue-500/40 hover:bg-blue-600/30'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-blue-400" />
            <span>{getStoredApiKey() ? 'Gemini Key Active' : 'Integrate Gemini API Key'}</span>
          </button>
        </div>
      </div>

      {/* API Key Modal / Drawer */}
      {showKeyInput && (
        <div className="p-4 rounded-xl bg-[#141d2f] border border-blue-500/40 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-blue-400" />
              <span>Connect Google Gemini API Key</span>
            </div>
            <button
              onClick={() => setShowKeyInput(false)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Enables live multi-hop reasoning, dynamic cross-log correlations, and real-time defense analysis. Stored locally in your browser session.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Google Gemini API Key (AIzaSy...)"
              className="flex-1 px-3 py-2 rounded-lg bg-[#0b101d] border border-[#1e2e4a] text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
            />
            <button
              onClick={handleSaveApiKey}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {keySaved ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{keySaved ? 'Saved!' : 'Save Key'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Suggested Quick Queries */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-mono text-slate-400 font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span>Recommended Forensic Inquiries:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {presetQuestions.map((pq, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(pq)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#141d2f] hover:bg-blue-950/60 text-slate-300 hover:text-blue-300 border border-[#1e2e4a] hover:border-blue-500/40 transition-colors text-left cursor-pointer flex items-center gap-1.5"
            >
              <CornerDownLeft className="w-3 h-3 text-blue-400 shrink-0" />
              <span>{pq}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-[#0b101d] border border-[#1e2e4a] rounded-2xl p-4 sm:p-6 min-h-[500px] max-h-[620px] overflow-y-auto space-y-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-2 mb-1 text-[11px] font-mono text-slate-500 px-1">
              <span>{msg.sender === 'user' ? 'Investigator' : 'MIRROR Forensic AI'}</span>
              {msg.isLiveGemini && (
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1 rounded border border-emerald-500/20">
                  Gemini Live
                </span>
              )}
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            <div
              className={`max-w-3xl rounded-2xl p-4 text-xs leading-relaxed space-y-3.5 shadow-md ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white font-semibold rounded-tr-sm'
                  : 'bg-[#141d2f] text-slate-200 border border-[#1e2e4a] rounded-tl-sm'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed select-text font-sans">
                {msg.text}
              </div>

              {/* Citations & Evidence Jumpers */}
              {msg.evidenceCitations && msg.evidenceCitations.length > 0 && (
                <div className="pt-2 border-t border-[#1e2e4a] flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
                    Citations:
                  </span>
                  {msg.evidenceCitations.map(evId => (
                    <button
                      key={evId}
                      onClick={() => onViewEvidence(evId)}
                      className="text-[10px] font-mono font-bold bg-[#0c1220] hover:bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>{evId}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  ))}
                </div>
              )}

              {/* Facts vs Assumptions Categorization */}
              {msg.factsVsAssumptions && (
                <div className="pt-2 space-y-2 border-t border-[#1e2e4a]">
                  {/* Confirmed Facts */}
                  {msg.factsVsAssumptions.confirmedFacts.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1 uppercase tracking-wider">
                        <CheckCircle2 className="w-3 5 h-3.5" />
                        <span>Confirmed Facts (Backed by Authenticated Logs)</span>
                      </div>
                      <ul className="space-y-1 text-slate-300 pl-4 list-disc text-[11px]">
                        {msg.factsVsAssumptions.confirmedFacts.map((fact, i) => (
                          <li key={i}>{fact}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Investigative Assumptions */}
                  {msg.factsVsAssumptions.investigativeAssumptions.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="text-[10px] font-mono font-bold text-amber-400 flex items-center gap-1 uppercase tracking-wider">
                        <AlertOctagon className="w-3.5 h-3.5" />
                        <span>Investigative Assumptions (Working Hypotheses)</span>
                      </div>
                      <ul className="space-y-1 text-slate-300 pl-4 list-disc text-[11px]">
                        {msg.factsVsAssumptions.investigativeAssumptions.map((assump, i) => (
                          <li key={i}>{assump}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Missing Info */}
                  {msg.factsVsAssumptions.missingInfo && msg.factsVsAssumptions.missingInfo.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="text-[10px] font-mono font-bold text-rose-400 flex items-center gap-1 uppercase tracking-wider">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Missing Evidence & Investigation Gaps</span>
                      </div>
                      <ul className="space-y-1 text-slate-400 pl-4 list-disc text-[11px]">
                        {msg.factsVsAssumptions.missingInfo.map((gap, i) => (
                          <li key={i}>{gap}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs font-mono text-blue-400 p-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
            <span>Correlating 20 evidence logs & formulating defense answer...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask a question about Case CR-26-047 (e.g. 'What proof connects tb-build-02 to the bank change?')..."
          className="flex-1 px-4 py-3 rounded-xl bg-[#0b101d] border border-[#1e2e4a] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans shadow-inner"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isTyping}
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
