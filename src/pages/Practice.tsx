
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Target, TrendingUp, Settings, Home, LogIn, User, LogOut } from 'lucide-react';
import AccountSettings from '@/components/AccountSettings';

const Practice = () => {
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  // NUET Test Categories
  const nuetTests = [
    {
      id: '1',
      title: 'Mathematics',
      description: 'Numbers, Algebra, Measures, Geometry, Statistics',
      difficulty: 'Hard',
      questions: 30,
      estimatedTime: '60 min',
      color: 'bg-blue-500',
      topics: ['Pure Mathematics', 'Algebra', 'Geometry', 'Statistics', 'Measures']
    },
    {
      id: '2', 
      title: 'Critical Thinking',
      description: 'Problem Solving, Reasoning, Logic Analysis',
      difficulty: 'Hard',
      questions: 30,
      estimatedTime: '60 min',
      color: 'bg-purple-500',
      topics: ['Problem Solving', 'Finding Procedures', 'Identifying Similarity', 'Drawing Conclusions', 'Reasoning Errors']
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const handleStartTest = (testId: string) => {
    navigate(`/quiz/${testId}`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
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
                <h1 className="text-2xl font-bold text-gray-900">NUET Practice Mode</h1>
                <p className="text-gray-600">Nazarbayev University Entrance Test Preparation</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Only show Home button if user is not authenticated */}
              {!user && (
                <Link to="/">
                  <Button variant="outline" size="sm">
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                </Link>
              )}
              
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Welcome back,</p>
                    <p className="font-semibold text-gray-900">
                      {userProfile?.full_name || userProfile?.nickname || user.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAccountSettings(true)}
                      className="flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Account
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSignOut}
                      className="flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              ) : (
                <Link to="/login">
                  <Button size="sm">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* NUET Test Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">NUET Test Sections</h2>
          <p className="text-gray-600">Choose a section to start practicing for the Nazarbayev University Entrance Test</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {nuetTests.map((test) => (
            <Card key={test.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${test.color} rounded-lg flex items-center justify-center`}>
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <Badge className={getDifficultyColor(test.difficulty)}>
                    {test.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {test.title}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {test.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{test.questions} Questions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{test.estimatedTime}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Topics covered:</p>
                  <div className="flex flex-wrap gap-1">
                    {test.topics.map((topic, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => handleStartTest(test.id)}
                >
                  Start {test.title} Test
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Performance Summary for logged-in users */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Your NUET Practice Progress
              </CardTitle>
              <CardDescription>
                Track your performance across Mathematics and Critical Thinking sections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">60</div>
                  <div className="text-sm text-gray-600">Questions Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">75%</div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">8h 15m</div>
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
