import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Bot,
  Send,
  X,
  Minimize2,
  Maximize2,
  MessageSquare,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useClerkAuth } from "@/hooks/useClerkAuth";
import { supabase } from "@/integrations/supabase/client";
import { aiService } from "@/lib/ai-service";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const AIAssistant = () => {
  const { userId, user } = useClerkAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Hi! I'm your NUET AI Study Assistant. I can help you with:\n\n• Understanding your test results\n• Creating personalized study plans\n• Answering questions about topics\n• Tracking your progress\n\nWhat would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userProgress, setUserProgress] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userId) {
      fetchUserProgress();
    }
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchUserProgress = async () => {
    try {
      const { data: attempts, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (attempts && attempts.length > 0) {
        const averageScore =
          attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length;
        const weakTopics = [
          ...new Set(attempts.flatMap((a) => a.weak_topics || [])),
        ];

        setUserProgress({
          totalTests: attempts.length,
          averageScore: Math.round(averageScore),
          weakTopics,
          recentTests: attempts.slice(0, 3),
        });
      }
    } catch (error) {
      console.error("Error fetching user progress:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Prepare context for AI
      const context = `
        User Context:
        - Tests Completed: ${userProgress?.totalTests || 0}
        - Average Score: ${userProgress?.averageScore || 0}%
        - Weak Topics: ${userProgress?.weakTopics?.join(", ") || "None identified"}
        - Recent Performance: ${userProgress?.recentTests?.map((t: any) => `${t.test_type}: ${t.score}%`).join(", ") || "No recent tests"}
        
        User Question: ${inputMessage}
        
        Provide a helpful, encouraging response. If the user asks about their progress, use their actual data. If they ask for study tips, provide specific advice. Be conversational but informative.
      `;

      // Use AI to generate response
      const response = await fetchAIResponse(context);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          "I'm having trouble connecting to my brain right now. Please try again in a moment!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAIResponse = async (context: string): Promise<string> => {
    try {
      // Use OpenAI API directly or through your backend
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
                  "You are a friendly, knowledgeable NUET exam preparation assistant. You help students prepare for the Nazarbayev University Entrance Test. Be encouraging, provide specific advice, and use the user's actual progress data when available. Keep responses concise but helpful.",
              },
              {
                role: "user",
                content: context,
              },
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        },
      );

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      // Fallback responses if API fails
      if (context.includes("weak topics")) {
        return `Based on your recent tests, I recommend focusing on: ${userProgress?.weakTopics?.slice(0, 3).join(", ") || "your weaker areas"}. Would you like me to create a study plan for these topics?`;
      } else if (context.includes("study plan")) {
        return "Here's a suggested study plan:\n\n1. Review weak topics (30 min daily)\n2. Take practice quizzes (45 min)\n3. Review mistakes (20 min)\n4. Take one full-length test weekly\n\nWould you like me to adjust this based on your schedule?";
      } else if (context.includes("motivation")) {
        return "You're making great progress! Remember, every expert was once a beginner. Keep practicing consistently, and you'll see improvement. Your dedication will pay off! 💪";
      } else {
        return "I'm here to help you with your NUET preparation! You can ask me about:\n\n• Analyzing your test results\n• Creating study plans\n• Explaining difficult concepts\n• Tracking your progress\n\nWhat would you like help with?";
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 z-50"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card
      className={`fixed z-50 shadow-2xl transition-all duration-300 ${
        isMinimized
          ? "bottom-6 right-6 w-80 h-14"
          : "bottom-6 right-6 w-96 h-[600px]"
      }`}
    >
      <CardHeader className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <CardTitle className="text-lg">NUET AI Assistant</CardTitle>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          <CardContent className="p-0 flex flex-col h-[calc(100%-60px)]">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex gap-2 max-w-[80%] ${
                        message.type === "user"
                          ? "flex-row-reverse"
                          : "flex-row"
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback
                          className={
                            message.type === "user"
                              ? "bg-blue-500 text-white"
                              : "bg-purple-500 text-white"
                          }
                        >
                          {message.type === "user" ? "U" : "AI"}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`p-3 rounded-lg ${
                          message.type === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-purple-500 text-white">
                          AI
                        </AvatarFallback>
                      </Avatar>
                      <div className="p-3 bg-gray-100 rounded-lg">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me anything about your NUET preparation..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Ask about your progress, study plans, or specific topics!
              </p>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
};

export default AIAssistant;
