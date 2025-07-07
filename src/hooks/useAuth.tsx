
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, nickname: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }
      
      console.log('Sign in successful:', data.user?.email);
      return { error: null };
    } catch (err) {
      console.error('Unexpected sign in error:', err);
      return { error: { message: 'An unexpected error occurred during sign in' } };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, nickname: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      console.log('Attempting to sign up with email:', cleanEmail);
      
      // Check if user already exists first
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', cleanEmail)
        .maybeSingle();
        
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" which is okay
        console.error('Error checking existing user:', checkError);
        return { error: { message: 'Error checking user existence' } };
      }
      
      if (existingUser) {
        console.log('User already exists:', cleanEmail);
        return { error: { message: 'An account with this email already exists. Please try signing in instead.' } };
      }

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName.trim(),
            nickname: nickname.trim(),
          },
        },
      });
      
      if (error) {
        console.error('Sign up error:', error);
        if (error.message.includes('already registered')) {
          return { error: { message: 'An account with this email already exists. Please try signing in instead.' } };
        }
        return { error };
      }
      
      console.log('Sign up successful:', data.user?.email);
      return { error: null };
    } catch (err) {
      console.error('Unexpected sign up error:', err);
      return { error: { message: 'An unexpected error occurred during sign up' } };
    }
  };

  const signOut = async () => {
    try {
      console.log('Attempting to sign out');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      } else {
        console.log('Sign out successful');
      }
    } catch (err) {
      console.error('Unexpected sign out error:', err);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      console.log('Attempting password reset for email:', cleanEmail);
      
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        console.error('Password reset error:', error);
        return { error };
      }
      
      console.log('Password reset email sent successfully');
      return { error: null };
    } catch (err) {
      console.error('Unexpected password reset error:', err);
      return { error: { message: 'An unexpected error occurred during password reset' } };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
