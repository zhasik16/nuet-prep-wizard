
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/AuthGuard';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

interface Question {
  id: string;
  subject: string;
  question: string;
  options: Json;
  correct_answer: string;
  explanation: string;
  test_type: string;
}

const Quiz = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Test type mapping
  const testTypes = {
    '1': 'NUET - Mathematics',
    '2': 'NUET - Critical Thinking', 
    '3': 'NUET - Reading Comprehension',
    '4': 'NUET - English Language'
  };

  const testType = testTypes[testId as keyof typeof testTypes];

  useEffect(() => {
    if (!testType) {
      navigate('/practice');
      return;
    }

    loadQuestions();
  }, [testType]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('test_type', testType)
        .limit(30);

      if (error) throw error;

      setQuestions(data || []);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast({
        title: "Error",
        description: "Failed to load questions. Please try again.",
        variant: "destructive",
      });
      navigate('/practice');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: answer }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setSubmitting(true);
    
    try {
      // Calculate score
      const correctAnswers = questions.filter((q, index) => 
        answers[index] === q.correct_answer
      ).length;
      const score = Math.round((correctAnswers / questions.length) * 100);

      // Save quiz attempt
      const { error } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          test_type: testType,
          score,
          total_questions: questions.length,
          time_elapsed: timeElapsed,
          answers: answers
        });

      if (error) throw error;

      // Store results for results page
      const results = {
        testType,
        score,
        totalQuestions: questions.length,
        timeElapsed,
        answers,
        questions: questions.map(q => ({
          question: q.question,
          options: q.options,
          correct: q.correct_answer,
          explanation: q.explanation,
          subject: q.subject
        }))
      };
      
      localStorage.setItem('latestResults', JSON.stringify(results));
      navigate('/results');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Questions Available</h1>
          <Button onClick={() => navigate('/practice')}>Back to Practice</Button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  // Parse options as string array
  const optionsArray = Array.isArray(currentQ.options) ? currentQ.options as string[] : [];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{testType}</h1>
                  <p className="text-sm text-gray-600">
                    Question {currentQuestion + 1} of {questions.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="font-mono text-lg">{formatTime(timeElapsed)}</span>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {currentQ.subject}
                </span>
                <span className="text-sm text-gray-500">
                  {Object.keys(answers).length} of {questions.length} answered
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
                {currentQ.question}
              </h2>
            </div>

            <div className="space-y-3 mb-8">
              {optionsArray.map((option, index) => {
                const optionLetter = option.charAt(0);
                const isSelected = answers[currentQuestion] === optionLetter;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(optionLetter)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex space-x-3">
                {currentQuestion === questions.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    {submitting ? 'Submitting...' : 'Finish Test'}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Quiz;
