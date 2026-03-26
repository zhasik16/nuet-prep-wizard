import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  Target,
  Calendar,
  TrendingUp,
  Lightbulb,
  Clock,
  Award,
  ArrowRight,
  Brain,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { aiService, UserProgress, SmartRecommendation } from "@/lib/ai-service";
import { supabase } from "@/integrations/supabase/client";
import { useClerkAuth } from "@/hooks/useClerkAuth";
import { useToast } from "@/hooks/use-toast";

const SmartDashboard = () => {
  const { userId } = useClerkAuth();
  const { toast } = useToast();
  const [recommendations, setRecommendations] =
    useState<SmartRecommendation | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserProgress();
    }
  }, [userId]);

  const fetchUserProgress = async () => {
    try {
      // Fetch quiz attempts
      const { data: attempts, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!attempts || attempts.length === 0) {
        setUserProgress(null);
        setLoading(false);
        return;
      }

      // Process attempts to create progress data with required fields
      const testHistory = attempts.map((attempt) => ({
        testId: attempt.test_type || attempt.test_id || "unknown",
        testTitle: attempt.test_title || attempt.test_type || "Practice Test",
        score: attempt.score,
        totalQuestions: attempt.total_questions,
        date: attempt.created_at || new Date().toISOString(),
        weakTopics: attempt.weak_topics || [],
        timeSpent: attempt.time_elapsed || 0,
      }));

      const averageScore =
        testHistory.reduce(
          (sum, t) => sum + (t.score / t.totalQuestions) * 100,
          0,
        ) / testHistory.length;

      // Calculate improvement (compare first half vs second half)
      const sortedByDate = [...testHistory].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      const firstHalf = sortedByDate.slice(
        0,
        Math.floor(sortedByDate.length / 2),
      );
      const secondHalf = sortedByDate.slice(
        -Math.floor(sortedByDate.length / 2),
      );

      const firstAvg =
        firstHalf.reduce(
          (sum, t) => sum + (t.score / t.totalQuestions) * 100,
          0,
        ) / (firstHalf.length || 1);
      const secondAvg =
        secondHalf.reduce(
          (sum, t) => sum + (t.score / t.totalQuestions) * 100,
          0,
        ) / (secondHalf.length || 1);

      const improvement = secondAvg - firstAvg;

      // Collect strong and weak topics
      const weakTopicsMap = new Map<string, number>();
      testHistory.forEach((test) => {
        test.weakTopics.forEach((topic) => {
          weakTopicsMap.set(topic, (weakTopicsMap.get(topic) || 0) + 1);
        });
      });

      const weakTopics = Array.from(weakTopicsMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([topic]) => topic)
        .slice(0, 5);

      // Strong topics are those not in weak topics (simplified for now)
      const allTopics = [
        "Mathematics",
        "Critical Thinking",
        "Algebra",
        "Geometry",
        "Statistics",
      ];
      const strongTopics = allTopics
        .filter((t) => !weakTopics.includes(t))
        .slice(0, 3);

      const timeSpentTotal = testHistory.reduce(
        (sum, t) => sum + t.timeSpent,
        0,
      );
      const recommendedStudyHours = Math.max(
        1,
        Math.floor((80 - averageScore) / 10),
      );

      const progress: UserProgress = {
        testHistory,
        averageScore,
        totalTests: testHistory.length,
        improvement,
        strongTopics,
        weakTopics,
        timeSpentTotal,
        recommendedStudyHours,
      };

      setUserProgress(progress);

      // Get AI recommendations - using generateSmartRecommendations
      const aiRecommendations =
        await aiService.generateSmartRecommendations(progress);
      setRecommendations(aiRecommendations);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      toast({
        title: "Error",
        description: "Could not load your progress data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading your insights...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userProgress || userProgress.totalTests === 0) {
    return (
      <Card className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="p-8 text-center">
          <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Ready for AI-Powered Insights?
          </h3>
          <p className="text-gray-600 mb-4">
            Take your first practice test to get personalized recommendations
            and AI analysis!
          </p>
          <Button onClick={() => (window.location.href = "/practice")}>
            Start Your First Test
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      {/* AI Welcome Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Your AI Study Assistant
              </h2>
              <p className="text-blue-100">
                Based on your performance, here are personalized insights to
                help you succeed
              </p>
            </div>
            <Brain className="w-12 h-12 opacity-50" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(userProgress.averageScore)}%
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
            <Progress value={userProgress.averageScore} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tests Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {userProgress.totalTests}
                </p>
              </div>
              <Award className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Improvement Trend</p>
                <p
                  className={`text-2xl font-bold ${userProgress.improvement >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {userProgress.improvement >= 0 ? "+" : ""}
                  {Math.round(userProgress.improvement)}%
                </p>
              </div>
              <TrendingUp
                className={`w-8 h-8 ${userProgress.improvement >= 0 ? "text-green-500" : "text-red-500"}`}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Study Time</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatTime(userProgress.timeSpentTotal)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      {recommendations && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Priority Topics to Focus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {recommendations.priorityTopics.map(
                  (topic: string, i: number) => (
                    <Badge
                      key={i}
                      className="bg-purple-100 text-purple-700 border-purple-200 text-sm py-2"
                    >
                      {topic}
                    </Badge>
                  ),
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Your Daily Study Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.dailyStudyPlan.map(
                  (task: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg"
                    >
                      <Badge className="bg-blue-500 w-6 h-6 flex items-center justify-center rounded-full text-white">
                        {i + 1}
                      </Badge>
                      <span className="text-gray-700">{task}</span>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-500" />
                  Estimated Preparation Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  {recommendations.estimatedPreparationTime}
                </p>
                <p className="text-sm text-gray-600">
                  Based on your current progress and NUET exam requirements
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Motivational Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg italic text-gray-700">
                  "{recommendations.motivationalMessage}"
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  Predicted Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-purple-600 mb-2">
                  {recommendations.predictedScore}%
                </p>
                <p className="text-sm text-gray-600">
                  Your predicted score after following the study plan
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-orange-500" />
                  Weekly Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendations.weeklyGoals.map(
                    (goal: string, i: number) => (
                      <li
                        key={i}
                        className="text-sm text-gray-700 flex items-start gap-2"
                      >
                        <span className="text-orange-500 mt-1">•</span>
                        <span>{goal}</span>
                      </li>
                    ),
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>

          {recommendations.insights && recommendations.insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-indigo-500" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recommendations.insights.map(
                    (insight: string, i: number) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-gray-700"
                      >
                        <span className="text-indigo-500 mt-1">•</span>
                        <span>{insight}</span>
                      </li>
                    ),
                  )}
                </ul>
              </CardContent>
            </Card>
          )}

          {recommendations.recommendedResources &&
            recommendations.recommendedResources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-green-600" />
                    Recommended Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendations.recommendedResources.map((resource, i) => (
                      <div
                        key={i}
                        className="border-b border-gray-100 pb-3 last:border-0"
                      >
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {resource.topic}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {resource.resources.map((res, j) => (
                            <Badge
                              key={j}
                              variant="outline"
                              className="bg-gray-50"
                            >
                              {res}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
        </>
      )}
    </div>
  );
};

export default SmartDashboard;
