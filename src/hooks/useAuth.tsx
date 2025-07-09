import { useState, useEffect, useContext, createContext } from 'react';
import {
  AuthChangeEvent,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signUp: (email: string, password?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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
      }

      setLoading(false);
    };

    getSession();

    supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });
  }, [supabase]);

  const signIn = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      toast({
        title: 'Check your email',
        description: 'We have sent you a magic link to sign in.',
      });
    } catch (error: any) {
      toast({
        title: 'Error signing in',
        description: error.error_description || error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      toast({
        title: 'Check your email',
        description: 'We have sent you a magic link to confirm your email address.',
      });
    } catch (error: any) {
      toast({
        title: 'Error signing up',
        description: error.error_description || error.message,
        variant: 'destructive',
      });
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
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      toast({
        title: 'Check your email',
        description: 'We have sent you a link to reset your password.',
      });
    } catch (error: any) {
      toast({
        title: 'Error resetting password',
        description: error.error_description || error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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

      // Update local user state
      setUser(prev => prev ? {
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
      // Delete user profile first
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // Delete auth user (this will cascade and clean up everything)
      const { error: authError } = await supabase.auth.admin.deleteUser(user?.id || '');
      
      if (authError) throw authError;

      // Sign out locally
      await signOut();
      
      return { error: null };
    } catch (error: any) {
      console.error('Account deletion error:', error);
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, resetPassword, updateProfile, deleteAccount }}>
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
