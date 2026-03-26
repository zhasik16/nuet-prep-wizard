import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Home,
  User,
  Mail,
  Calendar,
  Trash2,
  Edit,
  Save,
  X,
  TrendingUp,
  Award,
  Clock,
  Target,
  BarChart3,
  Activity,
  CheckCircle2,
  XCircle,
  Zap,
  CalendarDays,
  LineChart,
  PieChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  ResponsiveContainer,
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart as ReBarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import { useClerkAuth } from "@/hooks/useClerkAuth";
import { useToast } from "@/hooks/use-toast";
import { AuthGuard } from "@/components/AuthGuard";
import { supabase } from "@/integrations/supabase/client";
import SmartDashboard from "@/components/SmartDashboard";
import WeeklySummary from "@/components/WeeklySummary";

interface ProfileData {
  id: string;
  email: string | null;
  full_name: string | null;
  nickname: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface QuizAttempt {
  id: string;
  test_type: string;
  test_title: string;
  score: number;
  total_questions: number;
  time_elapsed: number;
  weak_topics: string[];
  created_at: string;
}

interface SubjectStats {
  subject: string;
  attempts: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  totalQuestions: number;
  improvement: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const { isSignedIn, user, signOut, userId, getToken } = useClerkAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    full_name: "",
    nickname: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [subjectStats, setSubjectStats] = useState<SubjectStats[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalTests: 0,
    averageScore: 0,
    totalQuestions: 0,
    totalTime: 0,
    bestScore: 0,
    worstScore: 100,
    improvement: 0,
    streak: 0,
  });
  const [recentActivity, setRecentActivity] = useState<QuizAttempt[]>([]);
  const [scoreTrend, setScoreTrend] = useState<
    { date: string; score: number }[]
  >([]);

  useEffect(() => {
    if (isSignedIn && userId) {
      loadProfile();
      loadQuizHistory();
    }
  }, [isSignedIn, userId]);

  const loadProfile = async () => {
    if (!userId) return;

    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(
        `https://tthxgwmrukvbnggpabbs.supabase.co/rest/v1/profiles?select=*&id=eq.${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setProfile(data[0]);
          setEditData({
            full_name: data[0].full_name || "",
            nickname: data[0].nickname || "",
          });
        } else {
          // Create profile if doesn't exist
          const createResponse = await fetch(
            "https://tthxgwmrukvbnggpabbs.supabase.co/rest/v1/profiles",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                id: userId,
                email: user?.primaryEmailAddress?.emailAddress,
                full_name: user?.fullName || "",
                nickname: user?.username || "",
              }),
            },
          );
          if (createResponse.ok) {
            const newProfile = await createResponse.json();
            setProfile(newProfile[0]);
          }
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuizHistory = async () => {
    if (!userId) return;

    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(
        `https://tthxgwmrukvbnggpabbs.supabase.co/rest/v1/quiz_attempts?select=*&user_id=eq.${userId}&order=created_at.desc`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        },
      );

      if (response.ok) {
        const data: any[] = await response.json();
        setAttempts(data || []);

        // Calculate overall statistics
        if (data && data.length > 0) {
          const totalTests = data.length;
          const avgScore =
            data.reduce((sum: number, a: any) => sum + (a.score || 0), 0) /
            totalTests;
          const totalQuestions = data.reduce(
            (sum: number, a: any) => sum + (a.total_questions || 0),
            0,
          );
          const totalTime = data.reduce(
            (sum: number, a: any) => sum + (a.time_elapsed || 0),
            0,
          );
          const bestScore = Math.max(...data.map((a: any) => a.score || 0));
          const worstScore = Math.min(...data.map((a: any) => a.score || 100));

          // Calculate improvement (first 3 vs last 3)
          const sortedByDate = [...data].sort(
            (a, b) =>
              new Date(a.created_at || 0).getTime() -
              new Date(b.created_at || 0).getTime(),
          );
          const firstHalf = sortedByDate.slice(
            0,
            Math.floor(sortedByDate.length / 2),
          );
          const secondHalf = sortedByDate.slice(
            -Math.floor(sortedByDate.length / 2),
          );
          const firstAvg =
            firstHalf.reduce((sum, a) => sum + (a.score || 0), 0) /
            (firstHalf.length || 1);
          const secondAvg =
            secondHalf.reduce((sum, a) => sum + (a.score || 0), 0) /
            (secondHalf.length || 1);
          const improvement = secondAvg - firstAvg;

          // Calculate streak (consecutive days with tests)
          let streak = 0;
          const dates = [
            ...new Set(data.map((a: any) => a.created_at?.split("T")[0])),
          ]
            .filter(Boolean)
            .sort()
            .reverse();
          for (let i = 0; i < dates.length; i++) {
            const currentDate = new Date(dates[i]);
            const expectedDate = new Date();
            expectedDate.setDate(expectedDate.getDate() - i);
            if (currentDate.toDateString() === expectedDate.toDateString()) {
              streak++;
            } else {
              break;
            }
          }

          setOverallStats({
            totalTests,
            averageScore: Math.round(avgScore),
            totalQuestions,
            totalTime,
            bestScore,
            worstScore,
            improvement: Math.round(improvement),
            streak,
          });

          // Calculate subject-wise statistics
          const subjectMap = new Map<
            string,
            { scores: number[]; total: number; attempts: number }
          >();
          data.forEach((attempt: any) => {
            const subject = attempt.test_type;
            if (!subjectMap.has(subject)) {
              subjectMap.set(subject, { scores: [], total: 0, attempts: 0 });
            }
            const stats = subjectMap.get(subject)!;
            stats.scores.push(attempt.score || 0);
            stats.total += attempt.total_questions || 0;
            stats.attempts++;
          });

          const subjectStatsArray: SubjectStats[] = [];
          subjectMap.forEach((stats, subject) => {
            const scores = stats.scores;
            const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
            const bestScore = Math.max(...scores);
            const worstScore = Math.min(...scores);
            const firstScore = scores[0];
            const lastScore = scores[scores.length - 1];
            const improvement = lastScore - firstScore;

            subjectStatsArray.push({
              subject,
              attempts: stats.attempts,
              averageScore: Math.round(avgScore),
              bestScore,
              worstScore,
              totalQuestions: stats.total,
              improvement: Math.round(improvement),
            });
          });
          setSubjectStats(subjectStatsArray);

          // Set recent activity (last 5 attempts)
          setRecentActivity(data.slice(0, 5));

          // Set score trend for chart (last 10 attempts in chronological order)
          const trendData = [...data]
            .reverse()
            .slice(-10)
            .map((attempt: any) => {
              let dateString = "Unknown";
              if (attempt.created_at) {
                try {
                  const dateObj = new Date(attempt.created_at);
                  if (!isNaN(dateObj.getTime())) {
                    dateString = dateObj.toLocaleDateString();
                  }
                } catch (e) {
                  // Keep default
                }
              }
              return {
                date: dateString,
                score: attempt.score || 0,
                test: attempt.test_type,
              };
            });
          setScoreTrend(trendData);
        }
      }
    } catch (error) {
      console.error("Error loading quiz history:", error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!userId) return;

    setUpdating(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("No token");

      const response = await fetch(
        `https://tthxgwmrukvbnggpabbs.supabase.co/rest/v1/profiles?id=eq.${userId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: editData.full_name,
            nickname: editData.nickname,
            updated_at: new Date().toISOString(),
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to update profile");

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      setIsEditing(false);
      loadProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId || !user) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone.",
    );

    if (!confirmed) return;

    setDeleting(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("No token");

      await fetch(
        `https://tthxgwmrukvbnggpabbs.supabase.co/rest/v1/profiles?id=eq.${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        },
      );

      await fetch(
        `https://tthxgwmrukvbnggpabbs.supabase.co/rest/v1/quiz_attempts?user_id=eq.${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        },
      );

      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      });

      await signOut();
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete account: " + error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const chartConfig = {
    score: { label: "Score", color: "#3b82f6" },
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
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

              <div className="flex items-center space-x-4">
                <Link to="/practice">
                  <Button variant="outline" size="sm">
                    Practice Tests
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" size="sm">
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              My Profile
            </h1>
            <p className="text-xl text-gray-600">
              Track your progress and manage your account
            </p>
          </div>

          {/* Statistics Cards */}
          {overallStats.totalTests > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-4 text-center">
                  <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">
                    {overallStats.totalTests}
                  </p>
                  <p className="text-xs text-gray-600">Tests Taken</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p
                    className={`text-2xl font-bold ${getScoreColor(overallStats.averageScore)}`}
                  >
                    {overallStats.averageScore}%
                  </p>
                  <p className="text-xs text-gray-600">Avg Score</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-4 text-center">
                  <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">
                    {overallStats.bestScore}%
                  </p>
                  <p className="text-xs text-gray-600">Best Score</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
                <CardContent className="p-4 text-center">
                  <Zap className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p
                    className={`text-2xl font-bold ${overallStats.improvement >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {overallStats.improvement >= 0 ? "+" : ""}
                    {overallStats.improvement}%
                  </p>
                  <p className="text-xs text-gray-600">Improvement</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100">
                <CardContent className="p-4 text-center">
                  <Clock className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-cyan-600">
                    {formatTime(overallStats.totalTime)}
                  </p>
                  <p className="text-xs text-gray-600">Study Time</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100">
                <CardContent className="p-4 text-center">
                  <CalendarDays className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-600">
                    {overallStats.streak}
                  </p>
                  <p className="text-xs text-gray-600">Day Streak</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Score Trend Chart */}
          {scoreTrend.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-blue-600" />
                  Score Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReLineChart data={scoreTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#3b82f6", r: 4 }}
                      />
                    </ReLineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Subject Performance */}
          {subjectStats.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Subject Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjectStats.map((subject, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-700">
                          {subject.subject}
                        </span>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            {subject.attempts} attempts
                          </Badge>
                          <span
                            className={`text-sm font-bold ${getScoreColor(subject.averageScore)}`}
                          >
                            {subject.averageScore}%
                          </span>
                        </div>
                      </div>
                      <Progress value={subject.averageScore} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Best: {subject.bestScore}%</span>
                        <span>Worst: {subject.worstScore}%</span>
                        <span
                          className={
                            subject.improvement >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {subject.improvement >= 0 ? "+" : ""}
                          {subject.improvement}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((attempt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {attempt.score >= 80 ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : attempt.score >= 60 ? (
                          <Activity className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {attempt.test_title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(attempt.created_at).toLocaleDateString()}{" "}
                            • {attempt.total_questions} questions
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-lg font-bold ${getScoreColor(attempt.score)}`}
                        >
                          {attempt.score}%
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTime(attempt.time_elapsed)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Profile Information */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Profile Information
                </h2>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={handleUpdateProfile}
                      disabled={updating}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updating ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setEditData({
                          full_name: profile?.full_name || "",
                          nickname: profile?.nickname || "",
                        });
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">
                      {user?.primaryEmailAddress?.emailAddress}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <Input
                      value={editData.full_name}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          full_name: e.target.value,
                        }))
                      }
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">
                        {profile?.full_name || user?.fullName || "Not set"}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nickname
                  </label>
                  {isEditing ? (
                    <Input
                      value={editData.nickname}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          nickname: e.target.value,
                        }))
                      }
                      placeholder="Enter your nickname"
                    />
                  ) : (
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">
                        {profile?.nickname || user?.username || "Not set"}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member Since
                  </label>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Account Actions */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Account Actions
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">
                    Change Password
                  </h3>
                  <p className="text-sm text-yellow-700 mb-3">
                    Update your password to keep your account secure.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.location.href =
                        "https://accounts.clerk.com/reset-password";
                      toast({
                        title: "Password Reset",
                        description:
                          "You'll be redirected to reset your password.",
                      });
                    }}
                  >
                    Reset Password
                  </Button>
                </div>

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">
                    Delete Account
                  </h3>
                  <p className="text-sm text-red-700 mb-3">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deleting ? "Deleting..." : "Delete Account"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Weekly Summary */}
          <div className="mt-8">
            <WeeklySummary />
          </div>

          {/* AI-Powered Smart Dashboard */}
          <div className="mt-8">
            <SmartDashboard />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Profile;
