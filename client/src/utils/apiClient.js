import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

/**
 * Get active Supabase JWT access token or demo token
 */
export async function getAuthToken() {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        return session.access_token;
      }
    } catch (e) {
      console.warn('Error obtaining session token:', e);
    }
  }

  // Fallback demo mode token
  try {
    const saved = localStorage.getItem('agri_demo_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.session?.access_token || null;
    }
  } catch {}

  return null;
}

/**
 * Authenticated fetch helper that adds Authorization: Bearer <token>
 */
export async function authenticatedFetch(url, options = {}) {
  const token = await getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers
  });
}

/**
 * Install global fetch interceptor so that all internal /api/* calls automatically
 * attach the user's Supabase access token.
 */
export function setupFetchInterceptor() {
  if (typeof window === 'undefined') return;

  const originalFetch = window.fetch;
  window.fetch = async function (input, init = {}) {
    const url = typeof input === 'string' ? input : input instanceof Request ? input.url : '';

    // Only intercept requests directed to our backend /api endpoints
    if (url.startsWith('/api') || url.includes('/api/')) {
      const token = await getAuthToken();
      if (token) {
        init = init || {};
        const headers = new Headers(init.headers || (input instanceof Request ? input.headers : {}));
        if (!headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${token}`);
        }
        init.headers = headers;
      }
    }

    return originalFetch.call(this, input, init);
  };
}
