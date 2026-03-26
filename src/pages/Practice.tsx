import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useClerkAuth } from "@/hooks/useClerkAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Clock,
  Target,
  TrendingUp,
  Settings,
  Home,
  LogIn,
  LogOut,
  Brain,
  Calculator,
  Book,
  Languages,
  AlertCircle,
  User,
} from "lucide-react";
import AccountSettings from "@/components/AccountSettings";
import { questionService } from "@/services/questionService";
import { supabase } from "@/integrations/supabase/client";

interface TestCard {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  questionCount: number;
  estimatedTime: string;
  color: string;
  icon: React.ReactNode;
  topics: string[];
}

// Fallback test cards in case database fails
const FALLBACK_TEST_CARDS: TestCard[] = [
  {
    id: "1",
    title: "Mathematics",
    description: "Algebra, Geometry, Statistics, Measures, Pure Mathematics",
    difficulty: "Hard",
    questionCount: 22,
    estimatedTime: "44 min",
    color: "bg-blue-500",
    icon: <Calculator className="w-6 h-6 text-white" />,
    topics: [
      "Algebra",
      "Geometry",
      "Statistics",
      "Measures",
      "Pure Mathematics",
    ],
  },
  {
    id: "2",
    title: "Physics",
    description: "Mechanics, Thermodynamics, Waves, Electricity",
    difficulty: "Medium",
    questionCount: 4,
    estimatedTime: "8 min",
    color: "bg-purple-500",
    icon: <Brain className="w-6 h-6 text-white" />,
    topics: ["Mechanics", "Thermodynamics", "Waves", "Electricity"],
  },
  {
    id: "3",
    title: "Reading Comprehension",
    description: "Main Idea, Detail Questions, Inference, Vocabulary",
    difficulty: "Medium",
    questionCount: 25,
    estimatedTime: "50 min",
    color: "bg-green-500",
    icon: <Book className="w-6 h-6 text-white" />,
    topics: [
      "Main Idea",
      "Detail Questions",
      "Inference",
      "Vocabulary",
      "Author's Purpose",
    ],
  },
  {
    id: "4",
    title: "English Language",
    description: "Grammar, Vocabulary, Sentence Structure, Punctuation",
    difficulty: "Medium",
    questionCount: 25,
    estimatedTime: "45 min",
    color: "bg-orange-500",
    icon: <Languages className="w-6 h-6 text-white" />,
    topics: [
      "Grammar",
      "Vocabulary",
      "Sentence Structure",
      "Punctuation",
      "Style",
    ],
  },
];

const Practice = () => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const { user, signOut, userProfile, userId } = useClerkAuth();
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [testCards, setTestCards] = useState<TestCard[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userStats, setUserStats] = useState({
    totalQuestions: 0,
    averageScore: 0,
    totalTime: 0,
    testsCompleted: 0,
  });

  // Subject icons mapping
  const subjectIcons: {
    [key: string]: {
      icon: React.ReactNode;
      color: string;
      description: string;
    };
  } = {
    Math: {
      icon: <Calculator className="w-6 h-6 text-white" />,
      color: "bg-blue-500",
      description: "Algebra, Geometry, Statistics, Measures, Pure Mathematics",
    },
    Physics: {
      icon: <Brain className="w-6 h-6 text-white" />,
      color: "bg-purple-500",
      description:
        "Mechanics, Thermodynamics, Waves, Electricity, Modern Physics",
    },
    "Reading Comprehension": {
      icon: <Book className="w-6 h-6 text-white" />,
      color: "bg-green-500",
      description:
        "Main Idea, Detail Questions, Inference, Vocabulary, Author's Purpose",
    },
    "English Language": {
      icon: <Languages className="w-6 h-6 text-white" />,
      color: "bg-orange-500",
      description:
        "Grammar, Vocabulary, Sentence Structure, Punctuation, Style",
    },
  };

  useEffect(() => {
    // Load test cards immediately with fallback while loading from DB
    setTestCards(FALLBACK_TEST_CARDS);
    loadSubjectsAndQuestions();
  }, []);

  useEffect(() => {
    if (isSignedIn && userId) {
      loadUserStats();
    }
  }, [isSignedIn, userId]);

  const loadSubjectsAndQuestions = async () => {
    try {
      setLoadingSubjects(true);
      setError(null);

      // Try to get subjects from database
      const availableSubjects = await questionService.getSubjects();

      if (availableSubjects && availableSubjects.length > 0) {
        // Create test cards from available subjects
        const cards: TestCard[] = [];

        for (const subject of availableSubjects) {
          try {
            // Get question count for this subject
            const questions = await questionService.getQuestionsBySubject(
              subject,
              100,
            );
            const questionCount = questions?.length || 0;

            // Get unique topics for this subject
            const topics = [
              ...new Set(
                questions?.map((q) => q.topics?.[0]).filter(Boolean) || [],
              ),
            ];

            const subjectInfo = subjectIcons[subject] || {
              icon: <BookOpen className="w-6 h-6 text-white" />,
              color: "bg-gray-500",
              description: "Practice questions for this subject",
            };

            cards.push({
              id: subject.toLowerCase().replace(/\s+/g, "-"),
              title: subject,
              description: subjectInfo.description,
              difficulty:
                questionCount > 50
                  ? "Hard"
                  : questionCount > 20
                    ? "Medium"
                    : "Easy",
              questionCount: questionCount,
              estimatedTime: `${Math.ceil(questionCount * 2)} min`,
              color: subjectInfo.color,
              icon: subjectInfo.icon,
              topics: topics.slice(0, 5),
            });
          } catch (err) {
            console.error(`Error loading subject ${subject}:`, err);
            // Continue with other subjects
          }
        }

        if (cards.length > 0) {
          setTestCards(cards);
        }
      }
    } catch (error) {
      console.error("Error loading subjects:", error);
      setError(
        "Could not load subjects from database. Using default test cards.",
      );
      // Keep using fallback cards
    } finally {
      setLoadingSubjects(false);
    }
  };

  const loadUserStats = async () => {
    if (!userId) return;

    try {
      const { data: attempts, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;

      if (attempts && attempts.length > 0) {
        const totalQuestionsAttempted = attempts.reduce(
          (sum, a) => sum + (a.total_questions || 0),
          0,
        );
        const averageScore =
          attempts.reduce((sum, a) => sum + (a.score || 0), 0) /
          attempts.length;
        const totalTimeSpent = attempts.reduce(
          (sum, a) => sum + (a.time_elapsed || 0),
          0,
        );

        setUserStats({
          totalQuestions: totalQuestionsAttempted,
          averageScore: Math.round(averageScore),
          totalTime: totalTimeSpent,
          testsCompleted: attempts.length,
        });
      }
    } catch (error) {
      console.error("Error loading user stats:", error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const handleStartTest = (testId: string) => {
    console.log("Starting test with ID:", testId);
    console.log("Test title:", testCards.find((t) => t.id === testId)?.title);
    navigate(`/quiz/${testId}`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  NUET Practice Mode
                </h1>
                <p className="text-gray-600">
                  Nazarbayev University Entrance Test Preparation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/profile">
                <Button variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>

              {isSignedIn ? (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Welcome back,</p>
                    <p className="font-semibold text-gray-900">
                      {userProfile?.full_name ||
                        userProfile?.nickname ||
                        user?.fullName ||
                        user?.primaryEmailAddress?.emailAddress}
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
                  <Button
                    size="sm"
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <LogIn className="w-4 h-4" />
                    Login to Start
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Available Practice Tests
          </h2>
          <p className="text-gray-600">
            Choose a section to start practicing for the Nazarbayev University
            Entrance Test
          </p>
          {error && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">{error}</p>
            </div>
          )}
        </div>

        {loadingSubjects ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading practice tests...</p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {testCards.map((test) => (
              <Card
                key={test.id}
                className="hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 ${test.color} rounded-lg flex items-center justify-center shadow-md`}
                    >
                      {test.icon}
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
                      <span>{test.questionCount} Questions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{test.estimatedTime}</span>
                    </div>
                  </div>

                  {test.topics.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        Topics covered:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {test.topics.map((topic, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => handleStartTest(test.id)}
                    disabled={!isSignedIn || test.questionCount === 0}
                  >
                    {!isSignedIn
                      ? "Login to Start Test"
                      : test.questionCount === 0
                        ? "Coming Soon"
                        : `Start ${test.title} Test`}
                  </Button>

                  {!isSignedIn && (
                    <p className="text-xs text-center text-gray-500 mt-2">
                      Please sign in to take practice tests
                    </p>
                  )}
                  {isSignedIn && test.questionCount === 0 && (
                    <p className="text-xs text-center text-amber-600 mt-2">
                      Questions for this subject are being added
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Performance Summary for logged-in users */}
        {isSignedIn && userStats.testsCompleted > 0 && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Your NUET Practice Progress
              </CardTitle>
              <CardDescription>
                Track your performance across all practice tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {userStats.testsCompleted}
                  </div>
                  <div className="text-sm text-gray-600">Tests Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {userStats.averageScore}%
                  </div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {userStats.totalQuestions}
                  </div>
                  <div className="text-sm text-gray-600">
                    Questions Answered
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatTime(userStats.totalTime)}
                  </div>
                  <div className="text-sm text-gray-600">Total Study Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isSignedIn && userStats.testsCompleted === 0 && (
          <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
            <CardContent className="p-8 text-center">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Start Your NUET Journey
              </h3>
              <p className="text-gray-600">
                Take your first practice test to track your progress and get
                personalized AI insights!
              </p>
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
