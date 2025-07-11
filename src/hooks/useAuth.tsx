
import { useState, useEffect, useContext, createContext } from 'react';
import {
  AuthChangeEvent,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  full_name: string | null;
  nickname: string | null;
  email: string | null;
}

interface AuthContextProps {
  user: User | null;
  userProfile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, nickname: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  updateProfile: (fullName: string, nickname: string) => Promise<any>;
  deleteAccount: () => Promise<any>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface Props {
  supabase: SupabaseClient<Database>;
  children: React.ReactNode;
}

export const AuthProvider: React.FC<Props> = ({ supabase, children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);

      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      }

      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, nickname, email')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Check if user already exists
      const { data: existingUser, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        return { error: userError };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { error };
      }
      
      return { error: null };
    } catch (error: any) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, nickname: string) => {
    setLoading(true);
    try {
      // Check if email already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        return { error: { message: 'An account with this email already exists' } };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            nickname: nickname,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      return { error };
    } catch (error: any) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: 'Error signing out',
        description: error.error_description || error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      
      return { error };
    } catch (error: any) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const updateProfile = async (fullName: string, nickname: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          nickname: nickname,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id)
        .select()
        .single();

      if (error) throw error;

      // Update local user profile state
      setUserProfile(prev => prev ? {
        ...prev,
        full_name: fullName,
        nickname: nickname
      } : null);

      return { data, error: null };
    } catch (error: any) {
      console.error('Profile update error:', error);
      return { data: null, error };
    }
  };

  const deleteAccount = async () => {
    try {
      if (!session?.access_token) {
        return { error: { message: 'No active session' } };
      }

      // Call the Edge Function to delete the account
      const response = await fetch('https://zhyscghkxsjwsczhviwg.supabase.co/functions/v1/delete-user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete account');
      }

      // Clear local state
      setUser(null);
      setUserProfile(null);
      setSession(null);

      return { error: null };
    } catch (error: any) {
      console.error('Account deletion error:', error);
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      session, 
      loading, 
      signIn, 
      signUp, 
      signOut, 
      resetPassword, 
      updatePassword, 
      updateProfile, 
      deleteAccount 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
