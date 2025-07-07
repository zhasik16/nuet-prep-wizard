
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
  updatePassword: (password: string) => Promise<{ error: any }>;
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

        // Handle email verification and password recovery
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in successfully:', session.user.email);
          // If user was redirected after email verification, redirect to practice page
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('type') === 'signup' || urlParams.get('type') === 'email_change') {
            setTimeout(() => {
              window.location.href = '/practice';
            }, 1000);
          }
        }

        if (event === 'PASSWORD_RECOVERY') {
          console.log('Password recovery event triggered');
          // User clicked on password reset link
          // The session will contain the user info needed for password update
        }
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
      
      // First attempt to sign up - Supabase will handle duplicate email detection
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login?type=signup`,
          data: {
            full_name: fullName.trim(),
            nickname: nickname.trim(),
          },
        },
      });
      
      if (error) {
        console.error('Sign up error:', error);
        
        // Handle specific error cases
        if (error.message.includes('User already registered')) {
          return { error: { message: 'This email is already registered. Please try signing in instead.' } };
        }
        
        if (error.message.includes('already been registered')) {
          return { error: { message: 'This email is already registered. Please try signing in instead.' } };
        }
        
        if (error.message.includes('already registered')) {
          return { error: { message: 'This email is already registered. Please try signing in instead.' } };
        }
        
        return { error };
      }
      
      // If no error but user is null, it might be a duplicate email that Supabase handled silently
      if (!data.user) {
        console.log('No user returned, possible duplicate email');
        return { error: { message: 'This email is already registered. Please try signing in instead.' } };
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
        redirectTo: `${window.location.origin}/login?type=recovery`,
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

  const updatePassword = async (password: string) => {
    try {
      console.log('Attempting to update password');
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        console.error('Password update error:', error);
        return { error };
      }
      
      console.log('Password updated successfully');
      return { error: null };
    } catch (err) {
      console.error('Unexpected password update error:', err);
      return { error: { message: 'An unexpected error occurred during password update' } };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
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
