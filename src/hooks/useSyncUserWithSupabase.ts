import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

export const useSyncUserWithSupabase = () => {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    const syncUser = async () => {
      if (!isSignedIn || !user) return;

      try {
        // Check if user exists in Supabase profiles
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!existingProfile) {
          // Create profile if it doesn't exist
          await supabase.from('profiles').insert([
            {
              id: user.id,
              email: user.primaryEmailAddress?.emailAddress,
              full_name: user.fullName,
              nickname: user.username,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);
        } else {
          // Update existing profile with latest Clerk data
          await supabase
            .from('profiles')
            .update({
              email: user.primaryEmailAddress?.emailAddress,
              full_name: user.fullName,
              nickname: user.username,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
        }
      } catch (error) {
        console.error('Error syncing user with Supabase:', error);
      }
    };

    syncUser();
  }, [user, isSignedIn]);
};