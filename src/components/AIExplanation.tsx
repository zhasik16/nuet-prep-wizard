import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Lightbulb,
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2,
  Calculator,
} from "lucide-react";
import {
  explanationService,
  AIExplanation as AIExplanationType,
} from "@/services/explanationService";

interface AIExplanationProps {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  topic: string;
  options?: string[];
  isCorrect: boolean;
}

const AIExplanation = ({
  question,
  userAnswer,
  correctAnswer,
  topic,
  options,
  isCorrect,
}: AIExplanationProps) => {
  const [explanation, setExplanation] = useState<AIExplanationType | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only generate explanation when expanded and not already loaded
    if (expanded && !explanation && !loading) {
      loadExplanation();
    }
  }, [expanded]);

  const loadExplanation = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await explanationService.generateExplanation(
        question,
        userAnswer,
        correctAnswer,
        topic,
        options,
      );
      setExplanation(result);
    } catch (err) {
      console.error("Error loading explanation:", err);
      setError("Failed to load AI explanation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
      >
        <Brain className="w-4 h-4" />
        {expanded ? "Hide AI Explanation" : "Get AI Explanation"}
        {expanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </Button>

      {expanded && (
        <Card className="mt-3 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI-Powered Explanation
              {!isCorrect && (
                <Badge variant="destructive" className="ml-2">
                  Need Review
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                <span className="ml-2 text-gray-600">
                  Generating explanation...
                </span>
              </div>
            ) : error ? (
              <div className="text-red-600 text-center py-4">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                <p>{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadExplanation}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            ) : explanation ? (
              <div className="space-y-4">
                {/* Step by Step Solution */}
                <div>
                  <h4 className="font-semibold text-blue-800 flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4" />
                    Step-by-Step Solution
                  </h4>
                  <div className="bg-white rounded-lg p-4 space-y-2">
                    {explanation.stepByStep.map((step, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className="font-bold text-blue-600">
                          {idx + 1}.
                        </span>
                        <span className="text-gray-700">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Concepts */}
                <div>
                  <h4 className="font-semibold text-green-800 flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4" />
                    Key Concepts
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {explanation.keyConcepts.map((concept, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        {concept}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Formula Used (if Math) */}
                {explanation.formulaUsed && (
                  <div>
                    <h4 className="font-semibold text-orange-800 flex items-center gap-2 mb-2">
                      <Calculator className="w-4 h-4" />
                      Formula Used
                    </h4>
                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <code className="text-sm text-orange-800">
                        {explanation.formulaUsed}
                      </code>
                    </div>
                  </div>
                )}

                {/* Common Mistake */}
                <div>
                  <h4 className="font-semibold text-red-800 flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    Common Mistake
                  </h4>
                  <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                    <p className="text-sm text-red-700">
                      {explanation.commonMistake}
                    </p>
                  </div>
                </div>

                {/* Study Tips */}
                <div>
                  <h4 className="font-semibold text-purple-800 flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4" />
                    Study Tips
                  </h4>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <p className="text-sm text-purple-700">
                      {explanation.tips}
                    </p>
                  </div>
                </div>

                {/* Related Topics */}
                <div>
                  <h4 className="font-semibold text-indigo-800 flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4" />
                    Related Topics to Review
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {explanation.relatedTopics.map((topic, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="bg-indigo-50 text-indigo-700"
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIExplanation;
