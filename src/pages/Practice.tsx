
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Target, TrendingUp, User, Settings } from 'lucide-react';
import AccountSettings from '@/components/AccountSettings';

const Practice = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  const practiceCategories = [
    {
      id: 'mathematics',
      title: 'Mathematics',
      description: 'Algebra, Calculus, Geometry, and Statistics',
      difficulty: 'Mixed',
      questions: 150,
      estimatedTime: '45 min',
      color: 'bg-blue-500',
    },
    {
      id: 'physics',
      title: 'Physics',
      description: 'Mechanics, Thermodynamics, Electricity & Magnetism',
      difficulty: 'Hard',
      questions: 120,
      estimatedTime: '40 min',
      color: 'bg-purple-500',
    },
    {
      id: 'chemistry',
      title: 'Chemistry',
      description: 'Organic, Inorganic, and Physical Chemistry',
      difficulty: 'Medium',
      questions: 100,
      estimatedTime: '35 min',
      color: 'bg-green-500',
    },
    {
      id: 'biology',
      title: 'Biology',
      description: 'Cell Biology, Genetics, Ecology, and Human Biology',
      difficulty: 'Medium',
      questions: 90,
      estimatedTime: '30 min',
      color: 'bg-orange-500',
    },
    {
      id: 'english',
      title: 'English',
      description: 'Reading Comprehension, Grammar, and Vocabulary',
      difficulty: 'Easy',
      questions: 80,
      estimatedTime: '25 min',
      color: 'bg-red-500',
    },
    {
      id: 'general-knowledge',
      title: 'General Knowledge',
      description: 'Current Affairs, History, Geography, and Science',
      difficulty: 'Mixed',
      questions: 200,
      estimatedTime: '50 min',
      color: 'bg-indigo-500',
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const handleStartPractice = (categoryId: string) => {
    navigate(`/quiz?category=${categoryId}&mode=practice`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Practice Mode</h1>
                <p className="text-gray-600">Choose a subject to start practicing</p>
              </div>
            </div>
            
            {user && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Welcome back,</p>
                  <p className="font-semibold text-gray-900">{user.full_name || user.email}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAccountSettings(true)}
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Account
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Practice Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {practiceCategories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center`}>
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <Badge className={getDifficultyColor(category.difficulty)}>
                    {category.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {category.title}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {category.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{category.questions} Questions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{category.estimatedTime}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => handleStartPractice(category.id)}
                >
                  Start Practice
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Performance Summary for logged-in users */}
        {user && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Your Practice Summary
              </CardTitle>
              <CardDescription>
                Track your progress across different subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">127</div>
                  <div className="text-sm text-gray-600">Questions Answered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">78%</div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">12h 30m</div>
                  <div className="text-sm text-gray-600">Total Study Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Account Settings Modal */}
      <AccountSettings 
        isOpen={showAccountSettings}
        onClose={() => setShowAccountSettings(false)}
      />
    </div>
  );
};

export default Practice;
