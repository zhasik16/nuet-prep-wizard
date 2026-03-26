import { useUser, useAuth, useClerk } from "@clerk/clerk-react";
import { useState, useEffect, useCallback } from "react";
import { withAuth } from "@/services/supabaseService";

export const useClerkAuth = () => {
  const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth();
  const { user } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to get the Supabase-compatible token with the template
  const getSupabaseToken = useCallback(async () => {
    try {
      // Request token with the 'supabase' template
      const token = await getToken({ template: 'supabase' });
      return token;
    } catch (err) {
      console.error('Error getting Supabase token:', err);
      return null;
    }
  }, [getToken]);

  useEffect(() => {
    const syncUserWithSupabase = async () => {
      if (!isLoaded || !isSignedIn || !userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const token = await getSupabaseToken();
        
        if (!token) {
          console.error('No Supabase token available');
          setLoading(false);
          return;
        }

        // Use withAuth with the token
        const existingProfile = await withAuth(async () => token, async (supabase) => {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          
          if (error && error.code !== 'PGRST116') throw error;
          return data;
        });

        if (existingProfile) {
          setUserProfile(existingProfile);
        } else {
          // Create profile if it doesn't exist
          const newProfile = {
            id: userId,
            email: user?.primaryEmailAddress?.emailAddress || null,
            full_name: user?.fullName || null,
            nickname: user?.username || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const createdProfile = await withAuth(async () => token, async (supabase) => {
            const { data, error } = await supabase
              .from('profiles')
              .insert([newProfile])
              .select()
              .maybeSingle();
            
            if (error) throw error;
            return data;
          });

          if (createdProfile) {
            setUserProfile(createdProfile);
          }
        }
      } catch (err) {
        console.error('Error in syncUserWithSupabase:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    syncUserWithSupabase();
  }, [isLoaded, isSignedIn, userId, user, getSupabaseToken]);

  const updateUserProfile = useCallback(async (updates: { full_name?: string; nickname?: string }) => {
    if (!userId) {
      throw new Error('No user ID available');
    }

    const token = await getSupabaseToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    try {
      const updatedProfile = await withAuth(async () => token, async (supabase) => {
        const { data, error } = await supabase
          .from('profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .maybeSingle();

        if (error) throw error;
        return data;
      });

      if (updatedProfile) {
        setUserProfile(updatedProfile);
      }
      
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }, [userId, getSupabaseToken]);

  const signOut = async () => {
    try {
      await clerkSignOut();
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    isLoaded,
    isSignedIn,
    userId,
    sessionId,
    user,
    userProfile,
    loading,
    error,
    getToken: getSupabaseToken, // Return the Supabase token function
    signOut,
    updateUserProfile,
    getUserEmail: () => user?.primaryEmailAddress?.emailAddress,
    getUserFullName: () => user?.fullName || userProfile?.full_name,
    getUserNickname: () => user?.username || userProfile?.nickname,
    getUserImageUrl: () => user?.imageUrl,
  };
};