
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

    supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });
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
