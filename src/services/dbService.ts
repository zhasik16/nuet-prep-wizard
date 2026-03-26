import { getAuthenticatedSupabase } from '@/integrations/supabase/client';

export const dbService = {
  async getQuestions(subject: string, limit: number = 30, getToken: () => Promise<string | null>) {
    const supabase = await getAuthenticatedSupabase(getToken);
    
    const { data, error } = await supabase
      .from('2 questions')
      .select('*')
      .eq('subject', subject)
      .limit(limit);
    
    if (error) throw error;
    return data;
  },
  
  async getSubjects(getToken: () => Promise<string | null>) {
    const supabase = await getAuthenticatedSupabase(getToken);
    
    const { data, error } = await supabase
      .from('2 questions')
      .select('subject')
      .not('subject', 'is', null);
    
    if (error) throw error;
    return [...new Set(data.map(q => q.subject).filter(Boolean))];
  },
  
  async getUserProfile(userId: string, getToken: () => Promise<string | null>) {
    const supabase = await getAuthenticatedSupabase(getToken);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },
  
  async getUserQuizAttempts(userId: string, getToken: () => Promise<string | null>) {
    const supabase = await getAuthenticatedSupabase(getToken);
    
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  async saveQuizAttempt(attempt: any, getToken: () => Promise<string | null>) {
    const supabase = await getAuthenticatedSupabase(getToken);
    
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert(attempt)
      .select();
    
    if (error) throw error;
    return data;
  }
};