
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Home, Clock, Target, ChevronRight, Lock, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const Practice = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [questionCounts, setQuestionCounts] = useState<{[key: string]: number}>({});

  useEffect(() => {
    loadQuestionCounts();
  }, []);

  const loadQuestionCounts = async () => {
    const testTypes = [
      'NUET - Mathematics',
      'NUET - Critical Thinking', 
      'NUET - Reading Comprehension',
      'NUET - English Language'
    ];

    const counts: {[key: string]: number} = {};
    
    for (const testType of testTypes) {
      const { count } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('test_type', testType);
      
      counts[testType] = count || 0;
    }
    
    setQuestionCounts(counts);
  };

  const practiceTests = [
    {
      id: 1,
      type: 'NUET - Mathematics',
      description: 'Algebra, Geometry, Statistics, and Problem Solving',
      difficulty: 'Mixed',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      type: 'NUET - Critical Thinking',
      description: 'Logical Reasoning, Pattern Recognition, and Analysis',
      difficulty: 'Mixed',
      color: 'bg-purple-500'
    },
    {
      id: 3,
      type: 'NUET - Reading Comprehension',
      description: 'Text Analysis, Vocabulary, and Reading Skills',
      difficulty: 'Mixed',
      color: 'bg-green-500'
    },
    {
      id: 4,
      type: 'NUET - English Language',
      description: 'Grammar, Vocabulary, and Language Usage',
      difficulty: 'Mixed',
      color: 'bg-orange-500'
    }
  ];

  const handleStartTest = (testId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/quiz/${testId}`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NUET Prep
              </span>
            </Link>
            
            <div className="flex items-center space-x-4">
              {!user ? (
                <Link to="/login">
                  <Button>Sign In</Button>
                </Link>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">{user.email}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              )}
              <Link to="/">
                <Button variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            NUET Practice Tests
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Master the Nazarbayev University Entrance Test with our comprehensive practice tests. 
            Each test contains carefully crafted questions designed to simulate the real exam experience.
          </p>
        </div>

        {/* Practice Tests Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {practiceTests.map((test, index) => (
            <div key={test.id} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${test.color} rounded-lg flex items-center justify-center`}>
                  <Target className="w-6 h-6 text-white" />
                </div>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                  #{index + 1}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {test.type}
              </h3>
              <p className="text-gray-600 mb-4">
                {test.description}
              </p>
              
              <div className="flex items-center space-x-4 mb-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Untimed
                </div>
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-1" />
                  {questionCounts[test.type] || 0} Questions
                </div>
                <div>
                  {test.difficulty}
                </div>
              </div>

              <Button 
                onClick={() => handleStartTest(test.id)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                disabled={!questionCounts[test.type]}
              >
                {!user ? (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Sign In to Start
                  </>
                ) : !questionCounts[test.type] ? (
                  'Loading...'
                ) : (
                  <>
                    Start Practice Test
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Why Choose Our Practice Tests?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Real NUET Format</h3>
              <p className="text-gray-600 text-sm">
                Questions designed to match the actual NUET exam structure and difficulty
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Detailed Explanations</h3>
              <p className="text-gray-600 text-sm">
                Every question comes with comprehensive explanations to help you learn
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Progress Tracking</h3>
              <p className="text-gray-600 text-sm">
                Monitor your performance and identify areas for improvement
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;
