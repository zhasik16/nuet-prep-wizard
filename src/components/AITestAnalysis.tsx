import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Target,
  TrendingUp,
  BookOpen,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { aiService, TestAnalysis } from "@/lib/ai-service";
import { useToast } from "@/hooks/use-toast";

interface AITestAnalysisProps {
  testTitle: string;
  questions: Array<{
    text: string;
    userAnswer: string;
    correctAnswer: string;
    topic: string;
    isCorrect: boolean;
  }>;
  score: number;
  totalQuestions: number;
}

const AITestAnalysis = ({
  testTitle,
  questions,
  score,
  totalQuestions,
}: AITestAnalysisProps) => {
  const [analysis, setAnalysis] = useState<TestAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const getAnalysis = async () => {
      setLoading(true);
      try {
        const result = await aiService.analyzeTestResults(
          testTitle,
          questions,
          score,
          totalQuestions,
        );
        setAnalysis(result);
      } catch (error) {
        console.error("Failed to get AI analysis:", error);
        toast({
          title: "AI Analysis Unavailable",
          description: "Could not generate AI insights at this time.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    getAnalysis();
  }, [testTitle, questions, score, totalQuestions]);

  if (loading) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">
              AI is analyzing your performance...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  const scorePercentage = (score / totalQuestions) * 100;

  return (
    <Card className="mt-6 border-blue-200 shadow-lg">
      <CardHeader
        className="bg-gradient-to-r from-blue-50 to-purple-50 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-xl">AI-Powered Analysis</CardTitle>
          </div>
          <Button variant="ghost" size="sm">
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="p-6 space-y-6">
          {/* Score Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-700">
                Overall Performance
              </span>
              <Badge
                className={
                  scorePercentage >= 70
                    ? "bg-green-500"
                    : scorePercentage >= 50
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }
              >
                {Math.round(scorePercentage)}%
              </Badge>
            </div>
            <Progress value={scorePercentage} className="h-2" />
            <p className="mt-3 text-sm text-gray-600">{analysis.summary}</p>
          </div>

          {/* Strengths */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-green-700 mb-3">
              <CheckCircle2 className="w-5 h-5" />
              Strengths
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.strengths.map((strength, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  {strength}
                </Badge>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-red-700 mb-3">
              <XCircle className="w-5 h-5" />
              Areas to Improve
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.weaknesses.map((weakness, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="bg-red-50 text-red-700 border-red-200"
                >
                  {weakness}
                </Badge>
              ))}
            </div>
          </div>

          {/* Topics to Focus */}
          {Object.keys(analysis.topicsToFocus).length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-purple-700 mb-3">
                <Target className="w-5 h-5" />
                Priority Topics
              </h3>
              <div className="space-y-2">
                {Object.entries(analysis.topicsToFocus)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([topic, priority]) => (
                    <div key={topic} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{topic}</span>
                        <span className="text-gray-500">
                          {priority}% priority
                        </span>
                      </div>
                      <Progress value={priority} className="h-1" />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-blue-700 mb-3">
              <Lightbulb className="w-5 h-5" />
              Recommendations
            </h3>
            <ul className="space-y-2">
              {analysis.recommendations.map((rec, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Study Plan */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-indigo-700 mb-3">
              <BookOpen className="w-5 h-5" />
              Recommended Study Plan
            </h3>
            <div className="space-y-2">
              {analysis.studyPlan.map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg"
                >
                  <Badge className="bg-indigo-500 w-6 h-6 flex items-center justify-center rounded-full">
                    {i + 1}
                  </Badge>
                  <span className="text-sm text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default AITestAnalysis;
