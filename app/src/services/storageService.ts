/**
 * Hybrid Persistence Service (Local Storage + Cloud Supabase)
 * Stores suspect explanations, uploaded defenses, and chat histories locally and syncs to Supabase when connected.
 */
import { VendorClaim } from '../types';
import { getSupabaseClient } from './supabaseClient';

export interface SavedExplanation {
  id: string;
  suspectId: string;
  suspectName: string;
  suspectType: string;
  title: string;
  timestamp: string;
  rawText: string;
  claimsCount: number;
  adjudicatedClaims: VendorClaim[];
}

export interface ChatMessageRecord {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  isLiveGemini?: boolean;
  evidenceCitations?: string[];
  factsVsAssumptions?: {
    confirmedFacts: string[];
    investigativeAssumptions: string[];
    missingInfo?: string[];
  };
}

const EXPLANATIONS_KEY = 'mirror_persisted_explanations';
const CHAT_HISTORY_KEY = 'mirror_chat_history';

// ---------------- EXPLANATION REPOSITORY ----------------

export const DEFAULT_SUSPECT_PROFILES: SavedExplanation[] = [
  {
    id: 'tallybridge',
    suspectId: 'tallybridge',
    suspectName: 'TallyBridge Software Pvt Ltd',
    suspectType: 'Third-Party Vendor',
    title: 'Formal Legal Notice E16: Incident findings and next steps',
    timestamp: '28 Aug 2026, 18:10 IST',
    rawText: `1. Unauthorised requests were made using a customer connection credential on 11 and 12 August 2026 only.
2. The access was limited to support ticket metadata. We have found no evidence that finance records or stored files were accessed.
3. All temporary export files created during the activity have been removed.
4. The activity originated entirely from outside our network. No systems inside our environment or on the private link were involved.
5. Affected credentials were rotated on 24 August 2026.
6. A list of indicators is attached to assist your review (file: indicator_list.csv).
7. From 1 September 2026, TallyBridge Connect will also synchronise vendor contact details between your systems. No action is needed.`,
    claimsCount: 7,
    adjudicatedClaims: []
  },
  {
    id: 'kavita_helpdesk',
    suspectId: 'kavita_helpdesk',
    suspectName: 'Kavita Rao (HelpDeskr Support Eng)',
    suspectType: 'Internal Staff',
    title: 'Support Ticket TKT-48213 Deposition & Credential Leak Examination',
    timestamp: '19 Aug 2026, 11:30 IST',
    rawText: `1. I only handled standard ticket triaging for export job EXP-5419 on 11 August.
2. I did not attach or expose any plaintext storage keys (bvk-7f3a) or passwords in the ticket body.
3. All attached logs were sanitized in accordance with our data handling policy.
4. I have never accessed BlueVault bucket storage directly from my personal workstation.`,
    claimsCount: 4,
    adjudicatedClaims: []
  },
  {
    id: 'tb_sync_svc',
    suspectId: 'tb_sync_svc',
    suspectName: 'tb-sync-svc (Service Account)',
    suspectType: 'Compromised Service Account',
    title: 'Automated Synchronization Account Audit Statement',
    timestamp: '24 Aug 2026, 09:00 IST',
    rawText: `1. Automated synchronization routine executed only scheduled read operations.
2. No PATCH or write requests were initiated by the synchronization worker on vendor master accounts.
3. The account ceased all network calls after the reported revocation on 24 August.`,
    claimsCount: 3,
    adjudicatedClaims: []
  },
  {
    id: 'ip_10_20_4_77',
    suspectId: 'ip_10_20_4_77',
    suspectName: 'Host 10.20.4.77 (tb-build-02)',
    suspectType: 'Threat IP',
    title: 'PrivateLink Build Node Network Ingress/Egress Statement',
    timestamp: '03 Sep 2026, 04:00 IST',
    rawText: `1. Build server executes automated CI/CD integration tests only.
2. No outbound tunnel sessions to external IP ranges were maintained outside maintenance windows.
3. Node did not issue any vendor master bank routing alteration queries on 3 September.`,
    claimsCount: 3,
    adjudicatedClaims: []
  }
];

export function getPersistedExplanations(): SavedExplanation[] {
  try {
    const raw = localStorage.getItem(EXPLANATIONS_KEY);
    if (!raw) {
      // Seed default profiles so user immediately sees all 4 deponents!
      localStorage.setItem(EXPLANATIONS_KEY, JSON.stringify(DEFAULT_SUSPECT_PROFILES));
      return DEFAULT_SUSPECT_PROFILES;
    }
    const parsed = JSON.parse(raw);
    if (parsed.length === 0) {
      localStorage.setItem(EXPLANATIONS_KEY, JSON.stringify(DEFAULT_SUSPECT_PROFILES));
      return DEFAULT_SUSPECT_PROFILES;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to read persisted explanations:', err);
    return DEFAULT_SUSPECT_PROFILES;
  }
}

export async function saveExplanation(record: SavedExplanation): Promise<void> {
  try {
    // 1. Save locally
    const existing = getPersistedExplanations();
    const filtered = existing.filter(e => e.id !== record.id);
    const updated = [record, ...filtered];
    localStorage.setItem(EXPLANATIONS_KEY, JSON.stringify(updated));

    // 2. Sync to Supabase if connected
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('investigation_audit_log').insert([
          {
            action: 'SAVE_SUSPECT_EXPLANATION',
            details: {
              suspectId: record.suspectId,
              suspectName: record.suspectName,
              title: record.title,
              claimsCount: record.claimsCount,
              rawText: record.rawText
            }
          }
        ]);
      } catch (err) {
        console.warn('Supabase audit log sync notice:', err);
      }
    }
  } catch (err) {
    console.error('Failed to save explanation:', err);
  }
}

export function deletePersistedExplanation(id: string): void {
  try {
    const existing = getPersistedExplanations();
    const updated = existing.filter(e => e.id !== id);
    localStorage.setItem(EXPLANATIONS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete explanation:', err);
  }
}

// ---------------- CHAT HISTORY PERSISTENCE ----------------

export function getPersistedChatHistory(): ChatMessageRecord[] {
  try {
    const raw = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load chat history:', err);
    return [];
  }
}

export async function savePersistedChatHistory(messages: ChatMessageRecord[]): Promise<void> {
  try {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  } catch (err) {
    console.error('Failed to persist chat history:', err);
  }
}

export function clearPersistedChatHistory(): void {
  try {
    localStorage.removeItem(CHAT_HISTORY_KEY);
  } catch (err) {
    console.error('Failed to clear chat history:', err);
  }
}
