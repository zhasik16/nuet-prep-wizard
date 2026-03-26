import { useEffect, useState } from "react";
import { useClerkAuth } from "@/hooks/useClerkAuth";
import { supabase } from "@/integrations/supabase/client";
import { X, Bell, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

const SimpleReminder = () => {
  const { userId, getToken } = useClerkAuth();
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [action, setAction] = useState<{
    text: string;
    onClick: () => void;
  } | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Check for reminders every 30 minutes
    const interval = setInterval(checkForReminder, 30 * 60 * 1000);
    checkForReminder(); // Check immediately

    return () => clearInterval(interval);
  }, [userId]);

  const checkForReminder = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      // Get recent quiz attempts
      const response = await fetch(
        `https://tthxgwmrukvbnggpabbs.supabase.co/rest/v1/quiz_attempts?select=*&user_id=eq.${userId}&order=created_at.desc&limit=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        },
      );

      const attempts = await response.json();
      if (!attempts.length) return;

      // Check if it's been more than 2 days since last test
      const lastTestDate = new Date(attempts[0].created_at);
      const daysSinceLastTest = Math.floor(
        (Date.now() - lastTestDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysSinceLastTest >= 2) {
        setMessage(
          `It's been ${daysSinceLastTest} days since your last practice test. Ready to take one?`,
        );
        setAction({
          text: "Take Test",
          onClick: () => (window.location.href = "/practice"),
        });
        showReminder();
      } else {
        // Check weak topics
        const weakTopics = [
          ...new Set(attempts.flatMap((a: any) => a.weak_topics || [])),
        ];
        if (weakTopics.length > 0) {
          setMessage(
            `You struggled with ${weakTopics[0]} recently. Want to review?`,
          );
          setAction({
            text: "Review Now",
            onClick: () => {
              const event = new CustomEvent("openAIAssistant", {
                detail: { tab: "planner", topic: weakTopics[0] },
              });
              window.dispatchEvent(event);
            },
          });
          showReminder();
        }
      }
    } catch (error) {
      console.error("Error checking reminders:", error);
    }
  };

  const showReminder = () => {
    // Clear any existing timeout
    if (timeoutId) clearTimeout(timeoutId);

    setShow(true);

    // Auto-hide after 12 seconds
    const newTimeoutId = setTimeout(() => {
      setShow(false);
    }, 12000);

    setTimeoutId(newTimeoutId);
  };

  const dismiss = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 animate-in slide-in-from-right-5 duration-300">
      <div className="bg-white rounded-lg shadow-2xl border-l-4 border-l-purple-500 w-80 p-4">
        <div className="flex gap-3">
          <div className="p-2 bg-purple-100 rounded-full h-10 w-10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-800">{message}</p>
            {action && (
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto mt-2 text-purple-600"
                onClick={() => {
                  action.onClick();
                  dismiss();
                }}
              >
                {action.text} →
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={dismiss}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SimpleReminder;
