import { supabase } from '@/integrations/supabase/client';

export interface FullQuestion {
  question_id: number;
  question_text: string;
  subject: string | null;
  difficulty: string | null;
  options: string[];
  correct_answer: string;
  topics: string[];
  source_info?: {
    exam: string;
    year: number | null;
    paper: string | null;
  };
}

export interface SubjectStats {
  subject: string;
  questionCount: number;
  topics: string[];
  averageDifficulty: string;
}

export const questionService = {
  // Fetch questions by subject (Mathematics, Critical Thinking, etc.)
  async getQuestionsBySubject(subject: string, limit: number = 30): Promise<FullQuestion[]> {
    try {
      console.log(`Fetching questions for subject: ${subject}`);
      
      // Step 1: Fetch questions from the '2 questions' table
      const { data: questions, error: questionsError } = await supabase
        .from('2 questions')
        .select('*')
        .eq('subject', subject)
        .limit(limit);

      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
        throw questionsError;
      }
      
      if (!questions || questions.length === 0) {
        console.log(`No questions found for subject: ${subject}`);
        return [];
      }

      console.log(`Found ${questions.length} questions for ${subject}`);

      const questionIds = questions.map(q => q.question_id);

      // Step 2: Fetch options for these questions from '3 options' table
      const { data: options, error: optionsError } = await supabase
        .from('3 options')
        .select('*')
        .in('question_id', questionIds);

      if (optionsError) {
        console.error('Error fetching options:', optionsError);
        throw optionsError;
      }

      // Step 3: Fetch correct answers from '4 correct answers' table
      const { data: answers, error: answersError } = await supabase
        .from('4 correct answers')
        .select('*')
        .in('question_id', questionIds);

      if (answersError) {
        console.error('Error fetching answers:', answersError);
        throw answersError;
      }

      // Step 4: Fetch source info if available
      const sourceIds = questions.map(q => q.source_id).filter((id): id is number => id !== null);
      let sourcesMap = new Map<number, { exam: string; year: number | null; paper: string | null }>();
      
      if (sourceIds.length > 0) {
        const { data: sources, error: sourcesError } = await supabase
          .from('1 sources')
          .select('*')
          .in('source_id', sourceIds);

        if (!sourcesError && sources) {
          sources.forEach(src => {
            if (src.source_id) {
              sourcesMap.set(src.source_id, {
                exam: src.exam,
                year: src.year,
                paper: src.paper
              });
            }
          });
        }
      }

      // Step 5: Group options by question
      const optionsMap = new Map<number, string[]>();
      options?.forEach(opt => {
        if (opt.question_id) {
          if (!optionsMap.has(opt.question_id)) {
            optionsMap.set(opt.question_id, []);
          }
          // Format as "A) Option text"
          const formattedOption = `${opt.label}) ${opt.option_text}`;
          optionsMap.get(opt.question_id)!.push(formattedOption);
        }
      });

      // Step 6: Map correct answers
      const answersMap = new Map<number, string>();
      answers?.forEach(ans => {
        if (ans.question_id && ans.answer_expression) {
          answersMap.set(ans.question_id, ans.answer_expression);
        }
      });

      // Step 7: Combine all data into FullQuestion objects
      const fullQuestions: FullQuestion[] = questions.map(q => ({
        question_id: q.question_id,
        question_text: q.question_text || '',
        subject: q.subject,
        difficulty: q.difficulty || 'Medium',
        options: optionsMap.get(q.question_id) || [],
        correct_answer: answersMap.get(q.question_id) || '',
        topics: [q.subject || subject],
        source_info: q.source_id ? sourcesMap.get(q.source_id) : undefined
      }));

      return fullQuestions;
    } catch (error) {
      console.error('Error in getQuestionsBySubject:', error);
      return [];
    }
  },

  // Get all available subjects from the database
  async getSubjects(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('2 questions')
        .select('subject')
        .not('subject', 'is', null);

      if (error) {
        console.error('Error fetching subjects:', error);
        throw error;
      }

      const subjects = [...new Set(data.map(q => q.subject).filter((subject): subject is string => subject !== null))];
      console.log('Available subjects:', subjects);
      return subjects;
    } catch (error) {
      console.error('Error in getSubjects:', error);
      // Return fallback subjects if database query fails
      return ['Mathematics'];
    }
  },

  // Get questions by difficulty level
  async getQuestionsByDifficulty(difficulty: string, limit: number = 30): Promise<FullQuestion[]> {
    try {
      const { data: questions, error } = await supabase
        .from('2 questions')
        .select('*')
        .eq('difficulty', difficulty)
        .limit(limit);

      if (error) throw error;
      if (!questions || questions.length === 0) return [];

      const questionIds = questions.map(q => q.question_id);

      // Fetch options
      const { data: options, error: optionsError } = await supabase
        .from('3 options')
        .select('*')
        .in('question_id', questionIds);

      if (optionsError) throw optionsError;

      // Fetch correct answers
      const { data: answers, error: answersError } = await supabase
        .from('4 correct answers')
        .select('*')
        .in('question_id', questionIds);

      if (answersError) throw answersError;

      // Group options
      const optionsMap = new Map<number, string[]>();
      options?.forEach(opt => {
        if (opt.question_id) {
          if (!optionsMap.has(opt.question_id)) {
            optionsMap.set(opt.question_id, []);
          }
          optionsMap.get(opt.question_id)!.push(`${opt.label}) ${opt.option_text}`);
        }
      });

      // Map answers
      const answersMap = new Map<number, string>();
      answers?.forEach(ans => {
        if (ans.question_id && ans.answer_expression) {
          answersMap.set(ans.question_id, ans.answer_expression);
        }
      });

      const fullQuestions: FullQuestion[] = questions.map(q => ({
        question_id: q.question_id,
        question_text: q.question_text || '',
        subject: q.subject,
        difficulty: q.difficulty,
        options: optionsMap.get(q.question_id) || [],
        correct_answer: answersMap.get(q.question_id) || '',
        topics: [q.subject || 'General']
      }));

      return fullQuestions;
    } catch (error) {
      console.error('Error fetching questions by difficulty:', error);
      return [];
    }
  },

  // Get subject statistics
  async getSubjectStats(): Promise<SubjectStats[]> {
    try {
      const subjects = await this.getSubjects();
      const stats: SubjectStats[] = [];

      for (const subject of subjects) {
        const questions = await this.getQuestionsBySubject(subject, 100);
        
        // Get unique topics - ensure we're working with strings
        const allTopics: string[] = [];
        questions.forEach(q => {
          if (q.topics && Array.isArray(q.topics)) {
            allTopics.push(...q.topics);
          }
        });
        const uniqueTopics: string[] = [...new Set(allTopics)];
        
        // Calculate average difficulty
        const difficulties = questions.map(q => q.difficulty).filter((d): d is string => d !== null);
        const avgDifficulty = this.calculateAverageDifficulty(difficulties);
        
        stats.push({
          subject,
          questionCount: questions.length,
          topics: uniqueTopics,
          averageDifficulty: avgDifficulty
        });
      }
      
      return stats;
    } catch (error) {
      console.error('Error getting subject stats:', error);
      return [];
    }
  },

  // Get question count by subject
  async getQuestionCountBySubject(subject: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('2 questions')
        .select('*', { count: 'exact', head: true })
        .eq('subject', subject);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting question count:', error);
      return 0;
    }
  },

  // Helper function to calculate average difficulty
  calculateAverageDifficulty(difficulties: string[]): string {
    const difficultyMap: { [key: string]: number } = {
      'Easy': 1,
      'Medium': 2,
      'Hard': 3
    };
    
    const reverseMap: { [key: number]: string } = {
      1: 'Easy',
      2: 'Medium',
      3: 'Hard'
    };
    
    const validDifficulties = difficulties.filter(d => difficultyMap[d]);
    if (validDifficulties.length === 0) return 'Medium';
    
    const total = validDifficulties.reduce((sum, d) => sum + difficultyMap[d], 0);
    const avg = Math.round(total / validDifficulties.length);
    
    return reverseMap[avg] || 'Medium';
  },

  // Get random questions for practice mode
  async getRandomQuestions(limit: number = 30): Promise<FullQuestion[]> {
    try {
      const { data: questions, error } = await supabase
        .from('2 questions')
        .select('*')
        .limit(limit);

      if (error) throw error;
      if (!questions || questions.length === 0) return [];

      const questionIds = questions.map(q => q.question_id);

      // Fetch options
      const { data: options, error: optionsError } = await supabase
        .from('3 options')
        .select('*')
        .in('question_id', questionIds);

      if (optionsError) throw optionsError;

      // Fetch correct answers
      const { data: answers, error: answersError } = await supabase
        .from('4 correct answers')
        .select('*')
        .in('question_id', questionIds);

      if (answersError) throw answersError;

      // Group options
      const optionsMap = new Map<number, string[]>();
      options?.forEach(opt => {
        if (opt.question_id) {
          if (!optionsMap.has(opt.question_id)) {
            optionsMap.set(opt.question_id, []);
          }
          optionsMap.get(opt.question_id)!.push(`${opt.label}) ${opt.option_text}`);
        }
      });

      // Map answers
      const answersMap = new Map<number, string>();
      answers?.forEach(ans => {
        if (ans.question_id && ans.answer_expression) {
          answersMap.set(ans.question_id, ans.answer_expression);
        }
      });

      const fullQuestions: FullQuestion[] = questions.map(q => ({
        question_id: q.question_id,
        question_text: q.question_text || '',
        subject: q.subject,
        difficulty: q.difficulty || 'Medium',
        options: optionsMap.get(q.question_id) || [],
        correct_answer: answersMap.get(q.question_id) || '',
        topics: [q.subject || 'General']
      }));

      return fullQuestions;
    } catch (error) {
      console.error('Error fetching random questions:', error);
      return [];
    }
  },

  // Get question by ID
  async getQuestionById(questionId: number): Promise<FullQuestion | null> {
    try {
      const { data: question, error: questionError } = await supabase
        .from('2 questions')
        .select('*')
        .eq('question_id', questionId)
        .single();

      if (questionError) throw questionError;
      if (!question) return null;

      // Fetch options
      const { data: options, error: optionsError } = await supabase
        .from('3 options')
        .select('*')
        .eq('question_id', questionId);

      if (optionsError) throw optionsError;

      // Fetch correct answer
      const { data: answer, error: answerError } = await supabase
        .from('4 correct answers')
        .select('*')
        .eq('question_id', questionId)
        .single();

      if (answerError) throw answerError;

      const formattedOptions: string[] = options?.map(opt => `${opt.label}) ${opt.option_text}`) || [];

      return {
        question_id: question.question_id,
        question_text: question.question_text || '',
        subject: question.subject,
        difficulty: question.difficulty || 'Medium',
        options: formattedOptions,
        correct_answer: answer?.answer_expression || '',
        topics: [question.subject || 'General']
      };
    } catch (error) {
      console.error('Error fetching question by ID:', error);
      return null;
    }
  }
};