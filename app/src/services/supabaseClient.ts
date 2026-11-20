import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL_KEY = 'mirror_supabase_url';
const SUPABASE_ANON_KEY = 'mirror_supabase_anon_key';

export function getStoredSupabaseConfig(): { url: string; anonKey: string } {
  try {
    const meta = import.meta as any;
    const url = localStorage.getItem(SUPABASE_URL_KEY) || (meta.env?.VITE_SUPABASE_URL as string) || '';
    const anonKey = localStorage.getItem(SUPABASE_ANON_KEY) || (meta.env?.VITE_SUPABASE_ANON_KEY as string) || '';
    return { url, anonKey };
  } catch {
    return { url: '', anonKey: '' };
  }
}

export function setStoredSupabaseConfig(url: string, anonKey: string): void {
  try {
    if (url.trim() && anonKey.trim()) {
      localStorage.setItem(SUPABASE_URL_KEY, url.trim());
      localStorage.setItem(SUPABASE_ANON_KEY, anonKey.trim());
    } else {
      localStorage.removeItem(SUPABASE_URL_KEY);
      localStorage.removeItem(SUPABASE_ANON_KEY);
    }
  } catch (e) {
    console.error('Failed to store Supabase configuration:', e);
  }
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getStoredSupabaseConfig();
  if (!url || !anonKey) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient(url, anonKey);
  }
  return cachedClient;
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<boolean> {
  try {
    const client = createClient(url, anonKey);
    const { error } = await client.from('investigations').select('count', { count: 'exact', head: true });
    // If table doesn't exist yet, it will return error 42P01 (relation does not exist) or similar, but the HTTP connection succeeded!
    return !error || error.code === '42P01' || error.message.includes('relation');
  } catch (err) {
    console.error('Supabase connection test failed:', err);
    return false;
  }
}
