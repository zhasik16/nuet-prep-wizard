import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookOpen, Clock, ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useClerkAuth } from "@/hooks/useClerkAuth";
import { AuthGuard } from "@/components/AuthGuard";
import { useToast } from "@/hooks/use-toast";

interface Question {
  question_id: number;
  question_text: string;
  subject: string;
  difficulty: string;
  has_figure: string;
  answer_type: string;
}

interface Option {
  option_id: number;
  question_id: number;
  label: string;
  option_text: string;
}

interface CorrectAnswer {
  answer_id: number;
  question_id: number;
  answer_expression: string;
}

interface FullQuestion {
  id: number;
  text: string;
  subject: string;
  difficulty: string;
  options: string[];
  correctAnswer: string;
  topic: string;
}

const Quiz = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { userId, getToken } = useClerkAuth();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<FullQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");

  // Map test IDs to subjects - CASE SENSITIVE - match your database exactly
  const testSubjects: { [key: string]: string } = {
    "1": "Math",
    "2": "Physics",
    math: "Math",
    physics: "Physics",
    Math: "Math",
    Physics: "Physics",
  };

  // Get subject from testId (case-insensitive)
  const getSubjectFromTestId = (id: string): string | null => {
    const lowerId = id.toLowerCase();

    if (lowerId === "math" || lowerId === "mathematics" || lowerId === "1") {
      return "Math";
    }
    if (lowerId === "physics" || lowerId === "2") {
      return "Physics";
    }

    // Direct mapping
    return testSubjects[id] || null;
  };

  const subject = getSubjectFromTestId(testId as string);
  const testTitle = subject ? `NUET - ${subject}` : "Practice Test";

  useEffect(() => {
    console.log("=== Quiz Debug ===");
    console.log("testId from URL:", testId);
    console.log("Mapped subject:", subject);
    console.log("testTitle:", testTitle);

    if (!subject) {
      console.log("No subject found for testId:", testId);
      toast({
        title: "Invalid Test",
        description: `No test found for ID: ${testId}`,
        variant: "destructive",
      });
      setTimeout(() => navigate("/practice"), 2000);
      return;
    }

    loadQuestions();
  }, [subject]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setDebugInfo("Loading questions...");

      console.log("Loading questions for subject:", subject);

      // Get auth token
      const token = await getToken();
      console.log("Token available:", !!token);

      if (!token) {
        console.error("No auth token available");
        setDebugInfo("Error: No auth token");
        toast({
          title: "Authentication Error",
          description: "Please sign out and sign back in.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Step 1: Fetch questions for the subject
      const { data: questionsData, error: questionsError } = await supabase
        .from("2 questions")
        .select("*")
        .eq("subject", subject)
        .limit(30);

      if (questionsError) {
        console.error("Questions fetch error:", questionsError);
        setDebugInfo(`Error: ${questionsError.message}`);
        throw questionsError;
      }

      console.log("Questions data:", questionsData);
      console.log("Number of questions found:", questionsData?.length || 0);
      setDebugInfo(`Found ${questionsData?.length || 0} questions`);

      if (!questionsData || questionsData.length === 0) {
        console.log(`No questions found for subject: ${subject}`);
        setDebugInfo(`No questions found for ${subject}`);
        toast({
          title: "No Questions Available",
          description: `No ${subject} questions are available yet. Please check back later.`,
          variant: "destructive",
        });
        setQuestions([]);
        setLoading(false);
        return;
      }

      const questionIds = questionsData.map((q) => q.question_id);
      console.log("Question IDs:", questionIds);

      // Step 2: Fetch options for these questions
      const { data: optionsData, error: optionsError } = await supabase
        .from("3 options")
        .select("*")
        .in("question_id", questionIds);

      if (optionsError) {
        console.error("Options fetch error:", optionsError);
        throw optionsError;
      }
      console.log("Options found:", optionsData?.length || 0);

      // Step 3: Fetch correct answers
      const { data: answersData, error: answersError } = await supabase
        .from("4 correct answers")
        .select("*")
        .in("question_id", questionIds);

      if (answersError) {
        console.error("Answers fetch error:", answersError);
        throw answersError;
      }
      console.log("Answers found:", answersData?.length || 0);

      // Step 4: Group options by question
      const optionsMap = new Map<number, string[]>();
      optionsData?.forEach((opt) => {
        if (opt.question_id) {
          if (!optionsMap.has(opt.question_id)) {
            optionsMap.set(opt.question_id, []);
          }
          // Format as "A) Option text"
          const formattedOption = `${opt.label}) ${opt.option_text}`;
          optionsMap.get(opt.question_id)!.push(formattedOption);
        }
      });

      // Step 5: Map correct answers
      const answersMap = new Map<number, string>();
      answersData?.forEach((ans) => {
        if (ans.question_id && ans.answer_expression) {
          answersMap.set(ans.question_id, ans.answer_expression);
        }
      });

      // Step 6: Combine everything
      const fullQuestions: FullQuestion[] = questionsData.map((q) => ({
        id: q.question_id,
        text: q.question_text,
        subject: q.subject || subject,
        difficulty: q.difficulty || "Medium",
        options: optionsMap.get(q.question_id) || [],
        correctAnswer: answersMap.get(q.question_id) || "",
        topic: q.subject || subject,
      }));

      // Log sample question for debugging
      if (fullQuestions.length > 0) {
        console.log("Sample question:", {
          text: fullQuestions[0].text?.substring(0, 100),
          optionsCount: fullQuestions[0].options.length,
          correctAnswer: fullQuestions[0].correctAnswer,
        });
      }

      setQuestions(fullQuestions);
      setDebugInfo(`Loaded ${fullQuestions.length} questions successfully`);
    } catch (error) {
      console.error("Error loading questions:", error);
      setDebugInfo(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      toast({
        title: "Error",
        description: "Failed to load questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: answer }));
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your results.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (questions.length === 0) {
      toast({
        title: "Error",
        description: "No questions to submit.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Get the token for authentication
      const token = await getToken();

      if (!token) {
        throw new Error("No authentication token available");
      }

      // Calculate score
      const questionsWithAnswers = questions.map((q, index) => ({
        text: q.text,
        userAnswer: answers[index] || "",
        correctAnswer: q.correctAnswer,
        topic: q.topic,
        isCorrect: answers[index] === q.correctAnswer,
      }));

      const correctAnswersCount = questionsWithAnswers.filter(
        (q) => q.isCorrect,
      ).length;
      const score = Math.round((correctAnswersCount / questions.length) * 100);

      // Identify weak topics
      const weakTopicsMap = new Map<string, number>();
      questionsWithAnswers.forEach((q) => {
        if (!q.isCorrect && q.userAnswer) {
          weakTopicsMap.set(q.topic, (weakTopicsMap.get(q.topic) || 0) + 1);
        }
      });

      const weakTopics = Array.from(weakTopicsMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([topic]) => topic);

      // Use fetch directly with the token (bypassing supabase client)
      const response = await fetch(
        "https://tthxgwmrukvbnggpabbs.supabase.co/rest/v1/quiz_attempts",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            apikey:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0aHhnd21ydWt2Ym5nZ3BhYmJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMTMxNzMsImV4cCI6MjA4NTc4OTE3M30.11Igk3-oFtnGBh_voGxpIrJExyrjuJ__QS_vQbRKZEI",
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            user_id: userId,
            test_type: subject,
            test_title: testTitle,
            score,
            total_questions: questions.length,
            time_elapsed: timeElapsed,
            answers: answers,
            weak_topics: weakTopics,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Save error:", errorData);
        throw new Error(errorData.message || "Failed to save quiz");
      }

      const savedData = await response.json();
      console.log("Quiz saved successfully:", savedData);

      // Store results for results page
      const results = {
        testType: testTitle,
        testId: testId,
        subject,
        score,
        totalQuestions: questions.length,
        timeElapsed,
        answers,
        questions: questionsWithAnswers,
        weakTopics,
      };

      localStorage.setItem("latestResults", JSON.stringify(results));
      navigate("/results");
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{debugInfo || "Loading questions..."}</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No Questions Available
          </h1>
          <p className="text-gray-600 mb-2">
            {debugInfo ||
              `Questions for ${subject} are being added to the database.`}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Test ID: {testId} | Subject: {subject}
          </p>
          <Button onClick={() => navigate("/practice")}>
            Back to Practice
          </Button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {testTitle}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Question {currentQuestion + 1} of {questions.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="font-mono text-lg">
                    {formatTime(timeElapsed)}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {currentQ.subject}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      currentQ.difficulty === "Easy"
                        ? "bg-green-100 text-green-800"
                        : currentQ.difficulty === "Hard"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {currentQ.difficulty}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {Object.keys(answers).length} of {questions.length} answered
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
                {currentQ.text}
              </h2>
            </div>

            <div className="space-y-3 mb-8">
              {currentQ.options.map((option, index) => {
                const optionLetter = option.charAt(0);
                const isSelected = answers[currentQuestion] === optionLetter;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(optionLetter)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-900"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="font-medium">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentQuestion((prev) => Math.max(0, prev - 1))
                }
                disabled={currentQuestion === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  {submitting ? "Submitting..." : "Finish Test"}
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    setCurrentQuestion((prev) =>
                      Math.min(questions.length - 1, prev + 1),
                    )
                  }
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Quiz;
