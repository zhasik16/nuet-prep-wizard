import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


// Create a custom Supabase client that will use Clerk's token
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Disable Supabase auth since we use Clerk
    autoRefreshToken: false,
  },
  global: {
    headers: {
      // We'll add the auth header dynamically
    },
  },
});

// Helper to get authenticated supabase client
export const getAuthenticatedSupabase = async (getToken: () => Promise<string | null>) => {
  const token = await getToken();
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    },
  });
};