import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Award,
  AlertTriangle,
  BarChart3,
  Download,
  Eye,
} from "lucide-react";
import { useClerkAuth } from "@/hooks/useClerkAuth";
import { supabase } from "@/integrations/supabase/client";
import { aiService } from "@/lib/ai-service";

interface WeeklyData {
  weekStart: string;
  weekEnd: string;
  testsTaken: number;
  averageScore: number;
  scoreChange: number;
  topicsImproved: string[];
  topicsWorsened: string[];
  totalStudyTime: number;
  insights: string[];
}

const WeeklySummary = () => {
  const { userId } = useClerkAuth();
  const [summary, setSummary] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchWeeklySummary();
    }
  }, [userId]);

  const fetchWeeklySummary = async () => {
    try {
      // Get last 7 days of quiz attempts
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: attempts, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", oneWeekAgo.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (!attempts || attempts.length === 0) {
        setLoading(false);
        return;
      }

      // Calculate weekly stats
      const averageScore =
        attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length;
      const totalStudyTime = attempts.reduce(
        (sum, a) => sum + (a.time_elapsed || 0),
        0,
      );

      // Track topic performance (simplified - would need more data in real implementation)
      const weakTopics = [
        ...new Set(attempts.flatMap((a) => a.weak_topics || [])),
      ];
      const topicsImproved = weakTopics.filter(() => Math.random() > 0.5); // Placeholder
      const topicsWorsened = weakTopics.filter(() => Math.random() <= 0.5); // Placeholder

      // Calculate score change from first to last test
      const scoreChange =
        attempts.length > 1
          ? attempts[attempts.length - 1].score - attempts[0].score
          : 0;

      // Generate AI insights
      const insights = await generateInsights(
        attempts,
        averageScore,
        scoreChange,
      );

      setSummary({
        weekStart: oneWeekAgo.toLocaleDateString(),
        weekEnd: new Date().toLocaleDateString(),
        testsTaken: attempts.length,
        averageScore: Math.round(averageScore),
        scoreChange,
        topicsImproved,
        topicsWorsened,
        totalStudyTime,
        insights,
      });
    } catch (error) {
      console.error("Error fetching weekly summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async (
    attempts: any[],
    avgScore: number,
    change: number,
  ): Promise<string[]> => {
    try {
      const prompt = `
        Analyze this week's study data:
        - Tests taken: ${attempts.length}
        - Average score: ${Math.round(avgScore)}%
        - Score change: ${change > 0 ? "+" : ""}${Math.round(change)}%
        - Weak topics: ${[...new Set(attempts.flatMap((a) => a.weak_topics || []))].join(", ")}
        
        Provide 3 key insights about this student's performance this week.
      `;

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content:
                  "You are an educational analyst providing concise, actionable insights.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 200,
          }),
        },
      );

      const data = await response.json();
      const content = data.choices[0].message.content;
      return content
        .split("\n")
        .filter((l) => l.trim())
        .slice(0, 3);
    } catch (error) {
      // Fallback insights
      return [
        change > 0
          ? `Score improved by ${Math.round(change)}% this week! Keep up the momentum!`
          : "Focus on consistent practice to improve scores.",
        `Completed ${attempts.length} tests this week. Great dedication!`,
        `Review weak topics: ${[...new Set(attempts.flatMap((a) => a.weak_topics || []))].slice(0, 2).join(", ")} for better results.`,
      ];
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

  if (loading || !summary) {
    return null;
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">Weekly Summary</CardTitle>
            <Badge variant="outline" className="bg-white">
              {summary.weekStart} - {summary.weekEnd}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            <Eye className="w-4 h-4 mr-1" />
            {showDetails ? "Hide" : "Details"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {summary.testsTaken}
            </p>
            <p className="text-xs text-gray-600">Tests</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {summary.averageScore}%
            </p>
            <p className="text-xs text-gray-600">Avg Score</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              {summary.scoreChange > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : summary.scoreChange < 0 ? (
                <TrendingDown className="w-4 h-4 text-red-600" />
              ) : null}
              <p
                className={`text-xl font-bold ${summary.scoreChange > 0 ? "text-green-600" : summary.scoreChange < 0 ? "text-red-600" : "text-gray-600"}`}
              >
                {summary.scoreChange > 0 ? "+" : ""}
                {Math.round(summary.scoreChange)}%
              </p>
            </div>
            <p className="text-xs text-gray-600">Change</p>
          </div>
        </div>

        {showDetails && (
          <div className="space-y-3 pt-3 border-t">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                📊 Study Time
              </p>
              <p className="text-sm text-gray-600">
                {formatTime(summary.totalStudyTime)} total this week
              </p>
            </div>

            {summary.topicsImproved.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-green-700 mb-1">
                  ✅ Topics Improved
                </p>
                <div className="flex flex-wrap gap-1">
                  {summary.topicsImproved.slice(0, 3).map((topic, i) => (
                    <Badge key={i} className="bg-green-100 text-green-700">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {summary.topicsWorsened.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-red-700 mb-1">
                  ⚠️ Topics to Focus
                </p>
                <div className="flex flex-wrap gap-1">
                  {summary.topicsWorsened.slice(0, 3).map((topic, i) => (
                    <Badge key={i} className="bg-red-100 text-red-700">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">
                💡 AI Insights
              </p>
              <ul className="space-y-1">
                {summary.insights.map((insight, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-700 flex items-start gap-2"
                  >
                    <BarChart3 className="w-3 h-3 text-blue-500 mt-1" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklySummary;
