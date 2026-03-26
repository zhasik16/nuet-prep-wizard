import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  AlertCircle,
  TrendingUp,
  Brain,
  Target,
  Flame,
} from "lucide-react";
import { useClerkAuth } from "@/hooks/useClerkAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { aiService } from "@/lib/ai-service";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  estimatedTime: string;
  reason: string;
  completed: boolean;
  topic?: string;
  createdAt: string;
}

interface DailyPlan {
  date: string;
  tasks: Task[];
  streak: number;
  productivityScore: number;
}

const SmartStudyPlanner = () => {
  const { userId, getToken } = useClerkAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [streak, setStreak] = useState(0);
  const [productivityScore, setProductivityScore] = useState(0);
  const [todayDate, setTodayDate] = useState("");

  useEffect(() => {
    const date = new Date().toISOString().split("T")[0];
    setTodayDate(date);
    loadTodayPlan();
  }, [userId]);

  const loadTodayPlan = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("No token");

      const response = await fetch(
        `https://tthxgwmrukvbnggpabbs.supabase.co/rest/v1/daily_plans?select=*&user_id=eq.${userId}&date=eq.${todayDate}`,
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
          setTasks(data[0].tasks || []);
          setStreak(data[0].streak || 0);
          setProductivityScore(data[0].productivity_score || 0);
        } else {
          // Generate AI recommendations for today
          await generateDailyPlan();
        }
      } else {
        await generateDailyPlan();
      }
    } catch (error) {
      console.error("Error loading plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateDailyPlan = async () => {
    if (!userId) return;

    setGenerating(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("No token");

      // Fetch user's recent quiz attempts
      const quizResponse = await fetch(
        `https://tthxgwmrukvbnggpabbs.supabase.co/rest/v1/quiz_attempts?select=*&user_id=eq.${userId}&order=created_at.desc&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        },
      );

      const attempts = await quizResponse.json();

      // Analyze weak topics
      const weakTopicsMap = new Map<string, number>();
      attempts.forEach((attempt: any) => {
        (attempt.weak_topics || []).forEach((topic: string) => {
          weakTopicsMap.set(topic, (weakTopicsMap.get(topic) || 0) + 1);
        });
      });

      const weakTopics = Array.from(weakTopicsMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([topic]) => topic)
        .slice(0, 3);

      // Generate AI recommendations
      const prompt = `
        Generate a daily study plan for a NUET student.
        
        Weak topics: ${weakTopics.join(", ") || "None identified yet"}
        Completed tests: ${attempts.length}
        Average score: ${attempts.reduce((sum: number, a: any) => sum + a.score, 0) / (attempts.length || 1)}%
        
        Create 3-5 study tasks for today. Each task should have:
        - Title (short, actionable)
        - Description (brief)
        - Priority (high/medium/low)
        - Estimated time (e.g., "30 min")
        - Reason (why this task matters)
        
        Format as JSON array.
      `;

      const aiResponse = await fetch(
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
                  "You are a NUET study coach. Create personalized, actionable study tasks.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        },
      );

      const aiData = await aiResponse.json();
      let generatedTasks = [];

      try {
        const content = aiData.choices[0].message.content;
        generatedTasks = JSON.parse(content);
      } catch {
        // Fallback tasks
        generatedTasks = [
          {
            title: "Review Weak Topics",
            description: `Focus on ${weakTopics[0] || "your weak areas"}`,
            priority: "high",
            estimatedTime: "45 min",
            reason:
              "These topics need the most attention based on your test results.",
          },
          {
            title: "Take a Practice Test",
            description: "Complete one full-length practice test",
            priority: "high",
            estimatedTime: "60 min",
            reason: "Regular practice builds stamina and identifies gaps.",
          },
          {
            title: "Review Mistakes",
            description: "Go through incorrect answers from recent tests",
            priority: "medium",
            estimatedTime: "30 min",
            reason: "Understanding mistakes prevents repeating them.",
          },
        ];
      }

      const tasksWithIds = generatedTasks.map((task: any, index: number) => ({
        id: `${Date.now()}-${index}`,
        title: task.title,
        description: task.description,
        priority: task.priority || "medium",
        estimatedTime: task.estimatedTime || "30 min",
        reason: task.reason || "Recommended for your improvement",
        completed: false,
        topic: weakTopics[index] || "General",
        createdAt: new Date().toISOString(),
      }));

      // Save to database
      const saveResponse = await fetch(
        "https://tthxgwmrukvbnggpabbs.supabase.co/rest/v1/daily_plans",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            date: todayDate,
            tasks: tasksWithIds,
            streak: 0,
            productivity_score: 0,
          }),
        },
      );

      if (saveResponse.ok) {
        setTasks(tasksWithIds);
        toast({
          title: "Daily Plan Ready!",
          description: "Your AI-powered study plan has been generated.",
        });
      }
    } catch (error) {
      console.error("Error generating plan:", error);
      toast({
        title: "Error",
        description: "Could not generate daily plan. Using default tasks.",
        variant: "destructive",
      });

      // Fallback tasks
      const fallbackTasks: Task[] = [
        {
          id: `fallback-1`,
          title: "Review Mathematics Fundamentals",
          description: "Practice algebra and geometry problems",
          priority: "high",
          estimatedTime: "45 min",
          reason: "Mathematics is crucial for NUET success",
          completed: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: `fallback-2`,
          title: "Critical Thinking Practice",
          description: "Solve 20 critical reasoning questions",
          priority: "high",
          estimatedTime: "60 min",
          reason: "Critical Thinking is a key NUET component",
          completed: false,
          createdAt: new Date().toISOString(),
        },
      ];
      setTasks(fallbackTasks);
    } finally {
      setGenerating(false);
    }
  };

  const toggleTask = async (taskId: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task,
    );
    setTasks(updatedTasks);

    // Calculate new productivity score
    const completedCount = updatedTasks.filter((t) => t.completed).length;
    const newScore = Math.round((completedCount / updatedTasks.length) * 100);
    setProductivityScore(newScore);

    // Update streak if all tasks completed
    const allCompleted = updatedTasks.every((t) => t.completed);
    if (allCompleted && newScore === 100) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      toast({
        title: "🔥 Perfect Day!",
        description: `You completed all tasks! ${newStreak} day streak!`,
      });
    }

    // Save to database
    try {
      const token = await getToken();
      if (!token) return;

      await fetch(
        `https://tthxgwmrukvbnggpabbs.supabase.co/rest/v1/daily_plans?user_id=eq.${userId}&date=eq.${todayDate}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tasks: updatedTasks,
            productivity_score: newScore,
            streak: allCompleted ? streak + 1 : streak,
          }),
        },
      );
    } catch (error) {
      console.error("Error saving tasks:", error);
    }
  };

  const addCustomTask = async () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: `custom-${Date.now()}`,
      title: newTaskTitle,
      description: "Custom task added by you",
      priority: "medium",
      estimatedTime: "30 min",
      reason: "You added this task to your study plan",
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    setNewTaskTitle("");

    // Save to database
    try {
      const token = await getToken();
      if (!token) return;

      await fetch(
        `https://tthxgwmrukvbnggpabbs.supabase.co/rest/v1/daily_plans?user_id=eq.${userId}&date=eq.${todayDate}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tasks: updatedTasks }),
        },
      );
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="w-4 h-4" />;
      case "medium":
        return <Clock className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Loading your study plan...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Today's Study Plan</h3>
            <p className="text-xs text-gray-500">{todayDate}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="text-center">
            <div className="flex items-center gap-1 text-orange-600">
              <Flame className="w-4 h-4" />
              <span className="font-bold">{streak}</span>
            </div>
            <p className="text-xs text-gray-500">Day Streak</p>
          </div>
          <div className="text-center">
            <div className="font-bold text-green-600">{productivityScore}%</div>
            <p className="text-xs text-gray-500">Productivity</p>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Sparkles className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No tasks for today</p>
            <Button
              variant="outline"
              size="sm"
              onClick={generateDailyPlan}
              className="mt-2"
              disabled={generating}
            >
              {generating ? "Generating..." : "Generate AI Plan"}
            </Button>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-lg border transition-all ${
                task.completed
                  ? "bg-green-50 border-green-200 opacity-75"
                  : "bg-white border-gray-200 hover:shadow-md"
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4
                      className={`font-semibold ${task.completed ? "line-through text-gray-500" : "text-gray-900"}`}
                    >
                      {task.title}
                    </h4>
                    <Badge className={getPriorityColor(task.priority)}>
                      <span className="flex items-center gap-1">
                        {getPriorityIcon(task.priority)}
                        {task.priority.toUpperCase()}
                      </span>
                    </Badge>
                    <Badge variant="outline" className="bg-gray-50">
                      <Clock className="w-3 h-3 mr-1" />
                      {task.estimatedTime}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {task.description}
                  </p>
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-700 flex items-start gap-1">
                      <Brain className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{task.reason}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Custom Task */}
      <div className="flex gap-2 mt-4">
        <Input
          placeholder="Add a custom task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addCustomTask()}
          className="flex-1"
        />
        <Button onClick={addCustomTask} variant="outline" size="icon">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Regenerate Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={generateDailyPlan}
        disabled={generating}
        className="w-full mt-2 text-purple-600 hover:text-purple-700"
      >
        {generating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating new plan...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Regenerate with AI
          </>
        )}
      </Button>
    </div>
  );
};

export default SmartStudyPlanner;
