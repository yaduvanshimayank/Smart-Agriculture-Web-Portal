import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite environment or localStorage override (useful for testing/demoing)
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const customUrl = typeof window !== 'undefined' ? localStorage.getItem('supabase_custom_url') : null;
const customKey = typeof window !== 'undefined' ? localStorage.getItem('supabase_custom_key') : null;

export const supabaseUrl = customUrl || envUrl || '';
export const supabaseAnonKey = customKey || envAnonKey || '';

export const isSupabaseConfigured = () => {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  if (supabaseUrl.includes('your-project-id') || supabaseAnonKey.includes('your-supabase-anon-key')) return false;
  try {
    const parsed = new URL(supabaseUrl);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

let clientInstance = null;

if (isSupabaseConfigured()) {
  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage
      }
    });
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
}

export const supabase = clientInstance;

/**
 * Update custom Supabase credentials stored in localStorage
 */
export function setCustomSupabaseConfig(url, anonKey) {
  if (!url || !anonKey) {
    localStorage.removeItem('supabase_custom_url');
    localStorage.removeItem('supabase_custom_key');
  } else {
    localStorage.setItem('supabase_custom_url', url.trim());
    localStorage.setItem('supabase_custom_key', anonKey.trim());
  }
  window.location.reload();
}
