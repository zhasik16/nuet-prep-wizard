export interface UserPerformanceData {
  testHistory: TestAttempt[];
  averageScore: number;
  totalTests: number;
  improvement: number;
  strongTopics: TopicStats[];
  weakTopics: TopicStats[];
  timeSpentTotal: number;
  recommendedStudyHours: number;
  performanceTrend: 'improving' | 'declining' | 'stable';
  predictedScore: number;
  consistencyScore: number;
  speedScore: number;
  accuracyScore: number;
}

export interface TestAttempt {
  id: string;
  testId: string;
  testTitle: string;
  score: number;
  totalQuestions: number;
  date: string;
  weakTopics: string[];
  timeSpent: number;
  answers: Record<string, string>;
  questions?: {
    text: string;
    userAnswer: string;
    correctAnswer: string;
    topic: string;
    isCorrect: boolean;
    timeSpent: number;
  }[];
}

export interface TopicStats {
  name: string;
  accuracy: number;
  frequency: number;
  lastAppeared: string;
  trend: 'improving' | 'declining' | 'stable';
  questionsAttempted: number;
  averageTimePerQuestion: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  reason: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  score: number; // 0-100 priority score
  actionableSteps: ActionableStep[];
  estimatedTimeToComplete: string;
  expectedImpact: {
    scoreImprovement: number;
    description: string;
  };
  category: 'topic' | 'strategy' | 'time_management' | 'resource' | 'motivation';
  metadata: {
    basedOn: string[];
    confidence: number;
    requiresFollowUp: boolean;
    followUpRecommendation?: string;
  };
}

export interface ActionableStep {
  id: string;
  description: string;
  duration: string;
  resources?: string[];
  verificationMethod?: string;
}

export interface RecommendationContext {
  user: {
    id: string;
    studyGoal?: number;
    targetScore?: number;
    examDate?: Date;
    dailyStudyHours?: number;
  };
  recentPerformance: {
    lastWeekScore: number;
    lastMonthScore: number;
    trendDirection: string;
  };
  timeContext: {
    daysUntilExam: number | null;
    studyHoursAvailable: number;
  };
}