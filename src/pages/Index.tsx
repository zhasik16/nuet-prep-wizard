import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, Clock, Trophy, Users, CheckCircle, Settings } from 'lucide-react';

const Index = () => {
  const { user, userProfile, signOut } = useAuth();
  const [showConfetti, setShowConfetti] = useState(false);

  const handleStartPractice = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">NUET Prep</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    Welcome, {userProfile?.nickname || userProfile?.full_name || user.email}
                  </span>
                  {user.email === 'zhasco10@gmail.com' && (
                    <Link
                      to="/admin"
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Profile
                  </Link>
                  <Button
                    onClick={signOut}
                    variant="outline"
                    size="sm"
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Link to="/login">
                  <Button>
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <CardTitle className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Ace Your NUET Exam with Confidence
            </CardTitle>
            <CardDescription className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Prepare effectively for the Nazarbayev University Entrance Test with our comprehensive practice platform.
            </CardDescription>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Practice Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Sharpen your skills with a wide range of practice questions covering all tested subjects.
                  </p>
                  <Button asChild className="mt-4 w-full">
                    <Link to="/practice" onClick={handleStartPractice}>
                      Start Practicing
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    Timed Quizzes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Simulate the real exam environment with timed quizzes to improve your speed and accuracy.
                  </p>
                  <Button asChild className="mt-4 w-full">
                    <Link to="/practice">
                      Take a Quiz
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    Performance Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Track your progress and identify areas for improvement with detailed performance analytics.
                  </p>
                  <Button asChild className="mt-4 w-full">
                    <Link to="/results">
                      View Results
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <CardTitle className="text-2xl font-extrabold text-gray-900">
              Key Features
            </CardTitle>
            <CardDescription className="mt-4 max-w-2xl text-gray-500 lg:mx-auto">
              Explore the features that make our platform the best choice for your NUET preparation.
            </CardDescription>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <BookOpen className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <CardTitle className="text-lg font-medium text-gray-900">
                  Extensive Question Bank
                </CardTitle>
                <CardDescription className="mt-2 text-gray-500">
                  Access a vast collection of NUET-style questions covering mathematics, critical thinking, and more.
                </CardDescription>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                  <Users className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <CardTitle className="text-lg font-medium text-gray-900">
                  Community Support
                </CardTitle>
                <CardDescription className="mt-2 text-gray-500">
                  Connect with other students, share your progress, and get your questions answered.
                </CardDescription>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <CardTitle className="text-lg font-medium text-gray-900">
                  Up-to-Date Content
                </CardTitle>
                <CardDescription className="mt-2 text-gray-500">
                  Our content is regularly updated to reflect the latest changes in the NUET exam format and syllabus.
                </CardDescription>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} NUET Prep. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
