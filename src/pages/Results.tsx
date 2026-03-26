import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Home,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import AITestAnalysis from "@/components/AITestAnalysis";
import AIExplanationComponent from "@/components/AIExplanation";

interface QuestionData {
  text: string;
  userAnswer: string;
  correctAnswer: string;
  topic: string;
  isCorrect: boolean;
  options?: string[];
}

interface ResultsData {
  testType: string;
  testId: string;
  subject: string;
  score: number;
  totalQuestions: number;
  timeElapsed: number;
  answers: Record<number, string>;
  questions: QuestionData[];
  weakTopics: string[];
}

const Results = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [showExplanations, setShowExplanations] = useState<{
    [key: number]: boolean;
  }>({});

  useEffect(() => {
    const savedResults = localStorage.getItem("latestResults");
    if (!savedResults) {
      navigate("/practice");
      return;
    }
    const parsedResults = JSON.parse(savedResults);
    console.log("Loaded results:", parsedResults);
    setResults(parsedResults);
  }, [navigate]);

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const correctAnswers = results.questions.filter(
    (q: QuestionData) => q.isCorrect,
  ).length;
  const wrongAnswers = results.totalQuestions - correctAnswers;
  const unanswered = results.questions.filter(
    (q: QuestionData) => !q.userAnswer,
  ).length;

  // Chart data
  const scoreData = [
    { name: "Correct", value: correctAnswers, color: "#10b981" },
    { name: "Incorrect", value: wrongAnswers, color: "#ef4444" },
    { name: "Unanswered", value: unanswered, color: "#6b7280" },
  ];

  const subjectBreakdown = results.questions.reduce(
    (acc: any, question: QuestionData) => {
      const topic = question.topic || "General";
      if (!acc[topic]) {
        acc[topic] = { correct: 0, total: 0 };
      }
      acc[topic].total++;
      if (question.isCorrect) {
        acc[topic].correct++;
      }
      return acc;
    },
    {},
  );

  const subjectData = Object.entries(subjectBreakdown).map(
    ([topic, data]: [string, any]) => ({
      subject: topic.length > 20 ? topic.substring(0, 20) + "..." : topic,
      percentage: Math.round((data.correct / data.total) * 100),
      correct: data.correct,
      total: data.total,
    }),
  );

  const chartConfig = {
    correct: { label: "Correct", color: "#10b981" },
    incorrect: { label: "Incorrect", color: "#ef4444" },
    unanswered: { label: "Unanswered", color: "#6b7280" },
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Generate options display based on user answer and correct answer
  const generateOptionsDisplay = (question: QuestionData) => {
    const options = [];
    const letters = ["A", "B", "C", "D"];
    const userAnswerLetter = question.userAnswer?.toUpperCase();
    const correctAnswerLetter = question.correctAnswer?.toUpperCase();

    for (const letter of letters) {
      let status = "";
      let text = "";

      if (letter === correctAnswerLetter) {
        status = "correct";
        text = `${letter}) ${question.correctAnswer}`;
      } else if (
        letter === userAnswerLetter &&
        userAnswerLetter !== correctAnswerLetter
      ) {
        status = "wrong";
        text = `${letter}) ${question.userAnswer}`;
      } else {
        status = "neutral";
        text = `${letter}) Option ${letter}`;
      }

      options.push({ letter, text, status });
    }

    return options;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NUET Prep
              </span>
            </Link>
            <Link to="/">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Results Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Test Results
            </h1>
            <p className="text-lg text-gray-600">{results.testType}</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-white">
                  {results.score}%
                </span>
              </div>
              <div className="text-gray-600 font-medium">Overall Score</div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">
                {correctAnswers}
              </div>
              <div className="text-gray-600 font-medium">Correct</div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600 mb-1">
                {wrongAnswers}
              </div>
              <div className="text-gray-600 font-medium">Incorrect</div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {formatTime(results.timeElapsed)}
              </div>
              <div className="text-gray-600 font-medium">Time Taken</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/practice">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Take Another Test
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="lg">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>

        {/* AI-Powered Test Analysis */}
        <AITestAnalysis
          testTitle={results.testType}
          questions={results.questions.map((q: QuestionData) => ({
            text: q.text,
            userAnswer: q.userAnswer || "",
            correctAnswer: q.correctAnswer,
            topic: q.topic,
            isCorrect: q.isCorrect,
          }))}
          score={correctAnswers}
          totalQuestions={results.totalQuestions}
        />

        {/* Performance Charts */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Score Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={scoreData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {scoreData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="flex justify-center mt-4 gap-4">
                {scoreData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Topic Performance */}
          {subjectData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Topic Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjectData.map((topic, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{topic.subject}</span>
                        <span className="text-gray-600">
                          {topic.percentage}% ({topic.correct}/{topic.total})
                        </span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            topic.percentage >= 80
                              ? "bg-green-500"
                              : topic.percentage >= 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${topic.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Performance Feedback */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Performance Analysis
            </h2>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <p className="text-gray-700 mb-4">
              {results.score >= 90
                ? "🎉 Excellent! You're very well prepared for the NUET. Keep up the great work!"
                : results.score >= 80
                  ? "👏 Great job! You have a strong understanding of the material. Review the incorrect answers to perfect your knowledge."
                  : results.score >= 70
                    ? "👍 Good work! You're on the right track. Focus on your weak areas and practice more."
                    : results.score >= 60
                      ? "📚 You're making progress! Spend more time studying the concepts you missed."
                      : "💪 Don't give up! This is a learning process. Review all explanations and take more practice tests."}
            </p>
            <div className="text-sm text-gray-600">
              <strong>Recommendation:</strong>{" "}
              {results.score < 80
                ? "Check out the AI-powered analysis above for detailed insights and personalized study recommendations to improve your weak areas."
                : "You're ready for the actual NUET! Continue practicing to maintain your strong performance and aim for a perfect score!"}
            </div>
            {results.weakTopics && results.weakTopics.length > 0 && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm font-semibold text-blue-800">
                  Topics to focus on:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {results.weakTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Question Review
          </h2>
          <div className="space-y-6">
            {results.questions.map((question: QuestionData, index: number) => {
              const userAnswer = question.userAnswer;
              const isCorrect = question.isCorrect;
              const wasAnswered = userAnswer !== undefined && userAnswer !== "";
              const options = generateOptionsDisplay(question);

              return (
                <Card
                  key={index}
                  className={`p-6 border-l-4 ${
                    !wasAnswered
                      ? "border-l-gray-400 bg-gray-50"
                      : isCorrect
                        ? "border-l-green-500 bg-green-50"
                        : "border-l-red-500 bg-red-50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-semibold text-gray-600">
                        Question {index + 1}
                      </span>
                      <span className="text-sm text-gray-500">
                        {question.topic}
                      </span>
                      {!wasAnswered ? (
                        <span className="bg-gray-500 text-white px-2 py-1 rounded text-xs">
                          Unanswered
                        </span>
                      ) : isCorrect ? (
                        <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                          Correct
                        </span>
                      ) : (
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                          Incorrect
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setShowExplanations((prev) => ({
                          ...prev,
                          [index]: !prev[index],
                        }))
                      }
                    >
                      {showExplanations[index] ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          Hide Explanation
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Show Explanation
                        </>
                      )}
                    </Button>
                  </div>

                  <h3 className="font-medium text-gray-900 mb-4">
                    {question.text}
                  </h3>

                  <div className="grid gap-2 mb-4">
                    {options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`p-3 rounded-lg border-2 ${
                          option.status === "correct"
                            ? "border-green-500 bg-green-100 text-green-800"
                            : option.status === "wrong"
                              ? "border-red-500 bg-red-100 text-red-800"
                              : "border-gray-200 bg-white text-gray-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option.text}</span>
                          <div className="flex space-x-2">
                            {option.status === "correct" && (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                            {option.status === "wrong" && (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {showExplanations[index] && (
                    <div className="mt-4">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-3">
                        <h4 className="font-semibold text-blue-800 mb-2">
                          Quick Explanation:
                        </h4>
                        <p className="text-blue-700">
                          {isCorrect
                            ? `Correct! The answer is ${question.correctAnswer}.`
                            : `The correct answer is ${question.correctAnswer}. Your answer was ${userAnswer || "not answered"}.`}
                        </p>
                      </div>

                      {/* AI-Powered Detailed Explanation */}
                      <AIExplanationComponent
                        question={question.text}
                        userAnswer={userAnswer || ""}
                        correctAnswer={question.correctAnswer}
                        topic={question.topic}
                        options={options.map((opt) => opt.text)}
                        isCorrect={isCorrect}
                      />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
