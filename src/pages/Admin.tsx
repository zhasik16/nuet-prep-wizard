import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useClerkAuth } from "@/hooks/useClerkAuth";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  Users,
  FileText,
  Plus,
  Save,
  BarChart3,
  Settings,
  X,
  LogOut,
  Calculator,
  Brain,
  Edit,
  Trash2,
  Eye,
  Search,
  ListChecks,
  Database,
} from "lucide-react";

interface Question {
  question_id: number;
  question_text: string;
  subject: string;
  difficulty: string;
  source_id: number | null;
  source_qnum: number | null;
  has_figure: string;
  answer_type: string;
  options: { label: string; option_text: string }[];
  correct_answer: string;
  explanation?: string;
  topics?: string[];
}

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isSignedIn, userId, getToken } = useClerkAuth();
  const [userCount, setUserCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  // Question form state
  const [questionForm, setQuestionForm] = useState({
    question_text: "",
    subject: "",
    difficulty: "Medium",
    has_figure: "no",
    answer_type: "multiple_choice",
    source_id: null as number | null,
    source_qnum: null as number | null,
    options: ["", "", "", ""],
    correct_answer: "",
    explanation: "",
  });

  // Test management state
  const [existingQuestions, setExistingQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchQuestions();
      fetchSubjects();
    }
  }, [isAuthenticated]);

  const handlePasswordSubmit = () => {
    if (password === "imashzhasco") {
      setIsAuthenticated(true);
      setPassword("");
    } else {
      toast({
        title: "Error",
        description: "Incorrect password",
        variant: "destructive",
      });
      setPassword("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate("/");
  };

  const fetchStats = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      // Get user count from profiles
      const usersResponse = await fetch(
        "https://tthxgwmrukvbnggpabbs.supabase.co/rest/v1/profiles?select=id",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        },
      );
      if (usersResponse.ok) {
        const users = await usersResponse.json();
        setUserCount(users.length);
      }

      // Get question count from questions table
      const questionsResponse = await fetch(
        "https://tthxgwmrukvbnggpabbs.supabase.co/rest/v1/2%20questions?select=question_id",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        },
      );
      if (questionsResponse.ok) {
        const questions = await questionsResponse.json();
        setQuestionCount(questions.length);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(
        "https://tthxgwmrukvbnggpabbs.supabase.co/rest/v1/2%20questions?select=subject",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        },
      );

      if (response.ok) {
        const data: any[] = await response.json();
        const uniqueSubjects = [
          ...new Set(
            data
              .map((q: any) => q.subject)
              .filter((s: any) => s !== null && s !== undefined),
          ),
        ];
        setSubjects(uniqueSubjects as string[]);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      // Fetch questions
      const questionsResponse = await fetch(
        "https://tthxgwmrukvbnggpabbs.supabase.co/rest/v1/2%20questions?select=*&order=question_id.desc",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        },
      );

      if (!questionsResponse.ok) throw new Error("Failed to fetch questions");
      const questionsData: any[] = await questionsResponse.json();

      // Fetch options for all questions
      const questionIds = questionsData.map((q: any) => q.question_id);
      if (questionIds.length > 0) {
        const optionsResponse = await fetch(
          `https://tthxgwmrukvbnggpabbs.supabase.co/rest/v1/3%20options?select=*&question_id=in.(${questionIds.join(",")})`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
          },
        );

        const optionsData: any[] = optionsResponse.ok
          ? await optionsResponse.json()
          : [];

        // Fetch correct answers
        const answersResponse = await fetch(
          `https://tthxgwmrukvbnggpabbs.supabase.co/rest/v1/4%20correct%20answers?select=*&question_id=in.(${questionIds.join(",")})`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
          },
        );

        const answersData: any[] = answersResponse.ok
          ? await answersResponse.json()
          : [];

        // Group options by question
        const optionsMap = new Map<
          number,
          { label: string; option_text: string }[]
        >();
        optionsData.forEach((opt: any) => {
          if (!optionsMap.has(opt.question_id)) {
            optionsMap.set(opt.question_id, []);
          }
          optionsMap.get(opt.question_id)!.push({
            label: opt.label,
            option_text: opt.option_text,
          });
        });

        // Group answers by question
        const answersMap = new Map<number, string>();
        answersData.forEach((ans: any) => {
          if (ans.question_id && ans.answer_expression) {
            answersMap.set(ans.question_id, ans.answer_expression);
          }
        });

        // Combine data
        const fullQuestions: Question[] = questionsData.map((q: any) => ({
          question_id: q.question_id,
          question_text: q.question_text,
          subject: q.subject,
          difficulty: q.difficulty,
          source_id: q.source_id,
          source_qnum: q.source_qnum,
          has_figure: q.has_figure,
          answer_type: q.answer_type,
          options: optionsMap.get(q.question_id) || [],
          correct_answer: answersMap.get(q.question_id) || "",
        }));

        setExistingQuestions(fullQuestions);
      } else {
        setExistingQuestions([]);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch questions",
        variant: "destructive",
      });
    }
  };

  const addQuestion = async () => {
    if (
      !questionForm.question_text.trim() ||
      !questionForm.subject.trim() ||
      !questionForm.correct_answer
    ) {
      toast({
        title: "Error",
        description:
          "Please fill in all required fields (question, subject, correct answer)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("No token");

      // Step 1: Insert question
      const questionResponse = await fetch(
        "https://tthxgwmrukvbnggpabbs.supabase.co/rest/v1/2%20questions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            question_text: questionForm.question_text,
            subject: questionForm.subject,
            difficulty: questionForm.difficulty,
            has_figure: questionForm.has_figure,
            answer_type: questionForm.answer_type,
            source_id: questionForm.source_id,
            source_qnum: questionForm.source_qnum,
          }),
        },
      );

      if (!questionResponse.ok) throw new Error("Failed to insert question");
      const newQuestion = await questionResponse.json();
      const newQuestionId = newQuestion[0]?.question_id;

      if (!newQuestionId) throw new Error("Failed to get question ID");

      // Step 2: Insert options
      const letters = ["A", "B", "C", "D"];
      for (let i = 0; i < questionForm.options.length; i++) {
        if (questionForm.options[i].trim()) {
          await fetch(
            "https://tthxgwmrukvbnggpabbs.supabase.co/rest/v1/3%20options",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                question_id: newQuestionId,
                label: letters[i],
                option_text: questionForm.options[i],
              }),
            },
          );
        }
      }

      // Step 3: Insert correct answer
      await fetch(
        "https://tthxgwmrukvbnggpabbs.supabase.co/rest/v1/4%20correct%20answers",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question_id: newQuestionId,
            answer_expression: questionForm.correct_answer,
          }),
        },
      );

      toast({
        title: "Success",
        description: "Question added successfully!",
      });

      // Reset form
      setQuestionForm({
        question_text: "",
        subject: "",
        difficulty: "Medium",
        has_figure: "no",
        answer_type: "multiple_choice",
        source_id: null,
        source_qnum: null,
        options: ["", "", "", ""],
        correct_answer: "",
        explanation: "",
      });

      fetchQuestions();
      fetchStats();
      fetchSubjects();
    } catch (error) {
      console.error("Error adding question:", error);
      toast({
        title: "Error",
        description: "Failed to add question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (questionId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this question? This will also delete its options and correct answer.",
      )
    )
      return;

    try {
      const token = await getToken();
      if (!token) return;

      // Delete options
      await fetch(
        `https://tthxgwmrukvbnggpabbs.supabase.co/rest/v1/3%20options?question_id=eq.${questionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        },
      );

      // Delete correct answer
      await fetch(
        `https://tthxgwmrukvbnggpabbs.supabase.co/rest/v1/4%20correct%20answers?question_id=eq.${questionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        },
      );

      // Delete question
      await fetch(
        `https://tthxgwmrukvbnggpabbs.supabase.co/rest/v1/2%20questions?question_id=eq.${questionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        },
      );

      toast({ title: "Success", description: "Question deleted successfully" });
      fetchQuestions();
      fetchStats();
    } catch (error) {
      console.error("Error deleting question:", error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const updateQuestion = async () => {
    if (!editingQuestion) return;

    try {
      const token = await getToken();
      if (!token) return;

      // Update question
      await fetch(
        `https://tthxgwmrukvbnggpabbs.supabase.co/rest/v1/2%20questions?question_id=eq.${editingQuestion.question_id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question_text: editingQuestion.question_text,
            subject: editingQuestion.subject,
            difficulty: editingQuestion.difficulty,
          }),
        },
      );

      // Update correct answer
      await fetch(
        `https://tthxgwmrukvbnggpabbs.supabase.co/rest/v1/4%20correct%20answers?question_id=eq.${editingQuestion.question_id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answer_expression: editingQuestion.correct_answer,
          }),
        },
      );

      toast({ title: "Success", description: "Question updated successfully" });
      setEditingQuestion(null);
      fetchQuestions();
    } catch (error) {
      console.error("Error updating question:", error);
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive",
      });
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const filteredQuestions = existingQuestions.filter((q: Question) => {
    const matchesSearch =
      q.question_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterSubject === "all" || q.subject === filterSubject;
    return matchesSearch && matchesFilter;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handlePasswordSubmit()}
            />
            <Button onClick={handlePasswordSubmit} className="w-full">
              Access Admin Panel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">Manage NUET questions</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="px-4 py-2">
                <Settings className="w-4 h-4 mr-2" />
                Administrator
              </Badge>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Add Question</TabsTrigger>
            <TabsTrigger value="manage">Manage Questions</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Registered Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userCount}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Questions
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{questionCount}</div>
                </CardContent>
              </Card>
            </div>

            {/* Add Question Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Question
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Subject *</Label>
                      <Input
                        value={questionForm.subject}
                        onChange={(e) =>
                          setQuestionForm({
                            ...questionForm,
                            subject: e.target.value,
                          })
                        }
                        placeholder="e.g., Mathematics, Physics, Critical Thinking"
                      />
                    </div>
                    <div>
                      <Label>Difficulty</Label>
                      <Select
                        value={questionForm.difficulty}
                        onValueChange={(v) =>
                          setQuestionForm({ ...questionForm, difficulty: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Question Text *</Label>
                    <Textarea
                      value={questionForm.question_text}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          question_text: e.target.value,
                        })
                      }
                      placeholder="Enter the question text"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Answer Options</Label>
                    <div className="space-y-2 mt-2">
                      {["A", "B", "C", "D"].map((letter, idx) => (
                        <Input
                          key={idx}
                          value={questionForm.options[idx]}
                          onChange={(e) =>
                            handleOptionChange(idx, e.target.value)
                          }
                          placeholder={`Option ${letter}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Correct Answer *</Label>
                      <Select
                        value={questionForm.correct_answer}
                        onValueChange={(v) =>
                          setQuestionForm({
                            ...questionForm,
                            correct_answer: v,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select correct answer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="D">D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={addQuestion}
                    disabled={loading}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Saving..." : "Add Question"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle>Manage Questions</CardTitle>
                <div className="flex gap-4 mt-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search questions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select
                    value={filterSubject}
                    onValueChange={setFilterSubject}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
            </Card>

            {/* Questions List */}
            <div className="space-y-4">
              {filteredQuestions.map((question) => (
                <Card key={question.question_id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary">
                            ID: {question.question_id}
                          </Badge>
                          <Badge variant="outline">{question.subject}</Badge>
                          <Badge
                            className={
                              question.difficulty === "Easy"
                                ? "bg-green-100 text-green-800"
                                : question.difficulty === "Medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {question.difficulty}
                          </Badge>
                        </div>
                        <p className="font-medium">{question.question_text}</p>
                        <div className="space-y-1">
                          {question.options.map((opt, idx) => (
                            <div
                              key={idx}
                              className={`text-sm ${opt.label === question.correct_answer ? "text-green-600 font-medium" : "text-gray-600"}`}
                            >
                              {opt.label}) {opt.option_text}
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">
                          <strong>Correct:</strong> {question.correct_answer}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingQuestion(question)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteQuestion(question.question_id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredQuestions.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No questions found.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="statistics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  System Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {userCount}
                    </div>
                    <div className="text-gray-600">Registered Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {questionCount}
                    </div>
                    <div className="text-gray-600">Questions Available</div>
                  </div>
                </div>
                {subjects.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-semibold text-gray-700 mb-4">
                      Subjects Available:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {subjects.map((subject) => (
                        <Badge
                          key={subject}
                          variant="outline"
                          className="px-3 py-1"
                        >
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Question Dialog */}
        {editingQuestion && (
          <Dialog
            open={!!editingQuestion}
            onOpenChange={() => setEditingQuestion(null)}
          >
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Question</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Subject</Label>
                  <Input
                    value={editingQuestion.subject || ""}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        subject: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <Select
                    value={editingQuestion.difficulty || "Medium"}
                    onValueChange={(v) =>
                      setEditingQuestion({ ...editingQuestion, difficulty: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Question Text</Label>
                  <Textarea
                    value={editingQuestion.question_text || ""}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        question_text: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Options</Label>
                  <div className="space-y-2">
                    {editingQuestion.options.map((opt, idx) => (
                      <Input
                        key={idx}
                        value={`${opt.label}) ${opt.option_text}`}
                        onChange={(e) => {
                          const newOptions = [...editingQuestion.options];
                          newOptions[idx] = {
                            ...opt,
                            option_text: e.target.value.split(") ")[1] || "",
                          };
                          setEditingQuestion({
                            ...editingQuestion,
                            options: newOptions,
                          });
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Correct Answer</Label>
                  <Select
                    value={editingQuestion.correct_answer}
                    onValueChange={(v) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        correct_answer: v,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingQuestion(null)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={updateQuestion}>Save Changes</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Admin;
