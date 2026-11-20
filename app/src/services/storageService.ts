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

export function getPersistedExplanations(): SavedExplanation[] {
  try {
    const raw = localStorage.getItem(EXPLANATIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read persisted explanations:', err);
    return [];
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
