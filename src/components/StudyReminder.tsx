import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Clock,
  X,
  Check,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { useClerkAuth } from "@/hooks/useClerkAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  DataAnalyzer,
  RecommendationEngine,
  InsightGenerator,
  Recommendation,
} from "@/lib/recommendation-system";

const StudyReminder = () => {
  const { userId, isSignedIn } = useClerkAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [completedReminders, setCompletedReminders] = useState<Set<string>>(
    new Set(),
  );
  const [show, setShow] = useState(true);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    if (isSignedIn && userId) {
      loadRecommendations();
      loadCompletedReminders();
    }
  }, [userId, isSignedIn]);

  const loadCompletedReminders = async () => {
    try {
      const { data, error } = await supabase
        .from("completed_reminders")
        .select("reminder_id")
        .eq("user_id", userId);

      if (error) throw error;
      setCompletedReminders(new Set(data?.map((d) => d.reminder_id) || []));
    } catch (error) {
      console.error("Error loading completed reminders:", error);
    }
  };

  const loadRecommendations = async () => {
    try {
      setLoading(true);

      // Fetch quiz attempts
      const { data: attempts, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch detailed question data for each attempt (if needed)
      const testAttempts = await Promise.all(
        (attempts || []).map(async (attempt) => {
          let questions = [];
          try {
            // If you store question details, fetch them here
            // For now, use the stored weak topics
            questions =
              attempt.weak_topics?.map((topic) => ({
                text: "",
                userAnswer: "",
                correctAnswer: "",
                topic,
                isCorrect: false,
                timeSpent:
                  attempt.time_elapsed / (attempt.total_questions || 1),
              })) || [];
          } catch (err) {
            console.error("Error fetching questions:", err);
          }

          return {
            id: attempt.id,
            testId: attempt.test_type,
            testTitle: attempt.test_title || attempt.test_type,
            score: attempt.score,
            totalQuestions: attempt.total_questions,
            date: attempt.created_at,
            weakTopics: attempt.weak_topics || [],
            timeSpent: attempt.time_elapsed,
            answers: attempt.answers || {},
            questions,
          };
        }),
      );

      // Analyze user performance
      const userData = DataAnalyzer.analyzeUserPerformance(testAttempts);

      // Generate insights
      const generatedInsights = InsightGenerator.generateKeyInsights(userData);
      setInsights(generatedInsights);

      // Calculate context
      const context = {
        user: {
          id: userId,
          studyGoal: 80,
          targetScore: 85,
        },
        recentPerformance: {
          lastWeekScore:
            userData.testHistory.slice(0, 3).reduce((s, t) => s + t.score, 0) /
            Math.min(3, userData.testHistory.length),
          lastMonthScore: userData.averageScore,
          trendDirection: userData.performanceTrend,
        },
        timeContext: {
          daysUntilExam: null, // You can set this from user settings
          studyHoursAvailable: userData.recommendedStudyHours,
        },
      };

      // Generate recommendations
      const allRecommendations =
        await RecommendationEngine.generateRecommendations(userData, context);

      // Filter out completed recommendations
      const activeRecommendations = allRecommendations.filter(
        (r) => !completedReminders.has(r.id),
      );

      // Show top 3 recommendations
      setRecommendations(activeRecommendations.slice(0, 3));
    } catch (error) {
      console.error("Error loading recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const completeRecommendation = async (rec: Recommendation) => {
    try {
      const { error } = await supabase.from("completed_reminders").insert({
        user_id: userId,
        reminder_id: rec.id,
        completed_at: new Date().toISOString(),
      });

      if (error) throw error;

      setCompletedReminders((prev) => new Set([...prev, rec.id]));
      setRecommendations((prev) => prev.filter((r) => r.id !== rec.id));

      if (recommendations.length === 1) {
        setTimeout(() => setShow(false), 2000);
      }
    } catch (error) {
      console.error("Error completing recommendation:", error);
    }
  };

  const dismissAll = () => setShow(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "border-l-red-600 bg-red-50";
      case "high":
        return "border-l-orange-500 bg-orange-50";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50";
      default:
        return "border-l-blue-500 bg-blue-50";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return (
          <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
            Critical
          </span>
        );
      case "high":
        return (
          <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded">
            High Priority
          </span>
        );
      case "medium":
        return (
          <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded">
            Medium Priority
          </span>
        );
      default:
        return (
          <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
            Low Priority
          </span>
        );
    }
  };

  if (!isSignedIn || loading || !show || recommendations.length === 0) {
    return null;
  }

  return (
    <Card className="fixed bottom-24 right-6 w-[400px] shadow-2xl border-l-4 border-l-purple-500 z-40 animate-in slide-in-from-right-5 duration-300">
      <CardHeader className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <CardTitle className="text-sm font-semibold">
              AI Study Assistant
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white hover:bg-white/20"
            onClick={dismissAll}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        {insights.length > 0 && (
          <div className="mt-2 text-xs text-white/90 border-t border-white/20 pt-2">
            <TrendingUp className="w-3 h-3 inline mr-1" />
            {insights[0]}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className={`p-4 rounded-lg border-l-4 ${getPriorityColor(rec.priority)} transition-all hover:shadow-md bg-white`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <h4 className="font-semibold text-sm text-gray-900">
                    {rec.title}
                  </h4>
                  {getPriorityBadge(rec.priority)}
                </div>
                <p className="text-sm text-gray-700 mb-2">{rec.description}</p>

                <div className="bg-gray-50 p-2 rounded-md mb-2">
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">Why this matters:</span>{" "}
                    {rec.reason}
                  </p>
                </div>

                <div className="flex items-center gap-3 mb-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{rec.estimatedTimeToComplete}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-green-600">
                      +{rec.expectedImpact.scoreImprovement}% expected
                    </span>
                  </div>
                </div>

                <div className="space-y-1 mb-3">
                  {rec.actionableSteps.slice(0, 2).map((step) => (
                    <p
                      key={step.id}
                      className="text-xs text-gray-600 flex items-start gap-1"
                    >
                      <span className="text-purple-500">•</span>
                      {step.description} ({step.duration})
                    </p>
                  ))}
                </div>

                {rec.metadata.confidence > 0.8 && (
                  <div className="text-xs text-purple-600 bg-purple-50 inline-block px-2 py-0.5 rounded">
                    AI confidence: {Math.round(rec.metadata.confidence * 100)}%
                  </div>
                )}
              </div>
            </div>
            <Button
              size="sm"
              className="w-full mt-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              onClick={() => completeRecommendation(rec)}
            >
              <Check className="w-4 h-4 mr-1" />
              Mark as Complete
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default StudyReminder;
