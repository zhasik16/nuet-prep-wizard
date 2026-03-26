import { useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { useMemo, useCallback } from 'react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create base Supabase client without auth
const baseSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const useSupabase = () => {
  const { getToken, isSignedIn } = useAuth();

  // Function to get authenticated client with current token
  const getAuthenticatedClient = useCallback(async () => {
    const token = await getToken();
    
    // Create a new client with the auth header
    const authenticatedClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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
    
    return authenticatedClient;
  }, [getToken]);

  // Wrapper functions that automatically add auth
  const query = useCallback(async <T>(
    callback: (client: any) => Promise<T>
  ): Promise<T> => {
    const client = await getAuthenticatedClient();
    return callback(client);
  }, [getAuthenticatedClient]);

  return {
    query,
    getAuthenticatedClient,
    isSignedIn,
    supabase: baseSupabase, // For unauthenticated queries if needed
  };
};