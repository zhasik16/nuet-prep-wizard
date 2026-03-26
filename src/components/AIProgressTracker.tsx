import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Target,
  Calendar,
  Clock,
  BookOpen,
  Award,
  Brain,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { aiService, SmartRecommendation, UserProgress } from "@/lib/ai-service";
import { supabase } from "@/integrations/supabase/client";
import { useClerkAuth } from "@/hooks/useClerkAuth";

interface AIProgressTrackerProps {
  userId: string;
}

const AIProgressTracker = ({ userId }: AIProgressTrackerProps) => {
  const [recommendations, setRecommendations] =
    useState<SmartRecommendation | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchUserProgress();
  }, [userId]);

  const fetchUserProgress = async () => {
    try {
      // Fetch all quiz attempts
      const { data: attempts, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (!attempts || attempts.length === 0) {
        setLoading(false);
        return;
      }

      // Process attempts
      const testHistory = attempts.map((attempt) => ({
        testId: attempt.test_type,
        testTitle: attempt.test_title || attempt.test_type,
        score: attempt.score,
        totalQuestions: attempt.total_questions,
        date: attempt.created_at,
        weakTopics: attempt.weak_topics || [],
        timeSpent: attempt.time_elapsed,
      }));

      const averageScore =
        testHistory.reduce((sum, t) => sum + t.score, 0) / testHistory.length;

      // Calculate improvement
      const firstHalf = testHistory.slice(
        0,
        Math.floor(testHistory.length / 2),
      );
      const secondHalf = testHistory.slice(-Math.floor(testHistory.length / 2));
      const firstAvg =
        firstHalf.reduce((sum, t) => sum + t.score, 0) /
        (firstHalf.length || 1);
      const secondAvg =
        secondHalf.reduce((sum, t) => sum + t.score, 0) /
        (secondHalf.length || 1);
      const improvement = secondAvg - firstAvg;

      // Collect strong and weak topics
      const topicStats = new Map<string, { correct: number; total: number }>();
      // Note: You'll need to fetch detailed question data for accurate topic stats
      // For now, use weak topics from attempts
      const weakTopics = [
        ...new Set(attempts.flatMap((a) => a.weak_topics || [])),
      ];
      const strongTopics =
        weakTopics.length > 0 ? ["General Knowledge"] : ["Mathematics"];

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

      // Generate AI recommendations
      setGenerating(true);
      const aiRecommendations =
        await aiService.generateSmartRecommendations(progress);
      setRecommendations(aiRecommendations);
    } catch (error) {
      console.error("Error fetching user progress:", error);
    } finally {
      setLoading(false);
      setGenerating(false);
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
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Analyzing your progress...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userProgress || userProgress.totalTests === 0) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-8 text-center">
          <Brain className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            AI Progress Tracker
          </h3>
          <p className="text-gray-600 mb-4">
            Take your first practice test to get AI-powered insights and
            personalized study recommendations!
          </p>
          <Button onClick={() => (window.location.href = "/practice")}>
            Start Your First Test
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
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
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
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
                <p className="text-sm text-gray-600">Improvement</p>
                <p
                  className={`text-2xl font-bold ${userProgress.improvement >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {userProgress.improvement >= 0 ? "+" : ""}
                  {Math.round(userProgress.improvement)}%
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Study Time</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatTime(userProgress.timeSpentTotal)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      {recommendations && !generating && (
        <>
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI Study Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Priority Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recommendations.priorityTopics.map((topic, i) => (
                    <Badge key={i} className="bg-purple-100 text-purple-700">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Daily Study Plan
                </h3>
                <ul className="space-y-2">
                  {recommendations.dailyStudyPlan.map((task, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <ChevronRight className="w-4 h-4 text-purple-500 mt-0.5" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Weekly Goals
                  </h3>
                  <ul className="space-y-1">
                    {recommendations.weeklyGoals.map((goal, i) => (
                      <li key={i} className="text-sm text-gray-700">
                        • {goal}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Predicted Score
                  </h3>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>
                        Current: {Math.round(userProgress.averageScore)}%
                      </span>
                      <span>Target: {recommendations.predictedScore}%</span>
                    </div>
                    <Progress
                      value={userProgress.averageScore}
                      max={100}
                      className="h-2"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Follow your study plan to reach your target score!
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 mt-2">
                <p className="text-lg italic text-gray-700">
                  "{recommendations.motivationalMessage}"
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Key Insights
                </h3>
                <ul className="space-y-1">
                  {recommendations.insights.map((insight, i) => (
                    <li
                      key={i}
                      className="text-sm text-gray-700 flex items-start gap-2"
                    >
                      <Brain className="w-4 h-4 text-blue-500 mt-0.5" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

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
                        <Badge key={j} variant="outline" className="bg-gray-50">
                          {res}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {generating && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              AI is generating personalized recommendations...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIProgressTracker;
