import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a single client instance
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

let clientInstance: any = null;
let currentToken: string | null = null;
// Get authenticated client with Clerk token
export const getAuthenticatedSupabase = async (token: string | null) => {
  // Reuse the same client if token hasn't changed
  if (clientInstance && currentToken === token) {
    return clientInstance;
  }
  
  currentToken = token;
  clientInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    },
  });
  
  return clientInstance;
};

// Cache the authenticated client
let authClientCache: any = null;
let cachedToken: string | null = null;

export const withAuth = async <T>(
  getToken: () => Promise<string | null>,
  callback: (client: any) => Promise<T>
): Promise<T> => {
  try {
    const token = await getToken();
    
    if (!token) {
      console.error('No token available for authenticated request');
      throw new Error('No authentication token available');
    }
    
    // Reuse client if token hasn't changed
    if (cachedToken !== token || !authClientCache) {
      authClientCache = await getAuthenticatedSupabase(token);
      cachedToken = token;
    }
    
    return callback(authClientCache);
  } catch (error) {
    console.error('Error in withAuth:', error);
    throw error;
  }
};

// Clear cache when needed
export const clearAuthCache = () => {
  authClientCache = null;
  cachedToken = null;
};

export const authenticatedFetch = async (getToken: () => Promise<string | null>, url: string, options: RequestInit = {}) => {
  const token = await getToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'apikey': supabaseAnonKey,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  return response;
};