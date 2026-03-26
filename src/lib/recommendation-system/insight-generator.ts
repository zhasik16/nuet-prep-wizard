import { UserPerformanceData, Recommendation } from './types';

export class InsightGenerator {
  static generateKeyInsights(userData: UserPerformanceData): string[] {
    const insights: string[] = [];
    
    // Pattern recognition insights
    if (userData.weakTopics.length > 0) {
      insights.push(`You struggle most with ${userData.weakTopics[0].name}. Focus here for biggest score gains.`);
    }
    
    if (userData.consistencyScore < 60) {
      insights.push(`Your performance varies by ${Math.round(100 - userData.consistencyScore)}%. Consistent practice will stabilize your scores.`);
    }
    
    if (userData.speedScore < 70) {
      insights.push(`You spend ${Math.round(100 - userData.speedScore)}% more time per question than optimal. Time management practice recommended.`);
    }
    
    if (userData.performanceTrend === 'improving') {
      insights.push(`Your scores are trending up by ${Math.round(userData.improvement)}%! Keep up the momentum.`);
    } else if (userData.performanceTrend === 'declining') {
      insights.push(`Recent scores show a ${Math.round(Math.abs(userData.improvement))}% decline. Let's identify what changed in your study routine.`);
    }
    
    // Add personalized insights
    if (userData.testHistory.length >= 5) {
      const improvement = userData.predictedScore - userData.averageScore;
      insights.push(`If you maintain your current improvement rate, you could reach ${Math.round(userData.predictedScore)}% in ${Math.max(1, Math.floor(30 / userData.testHistory.length))} weeks.`);
    }
    
    return insights.slice(0, 5);
  }
  
  static generateWeeklySummary(userData: UserPerformanceData): {
    summary: string;
    achievements: string[];
    challenges: string[];
    focusNextWeek: string[];
  } {
    const achievements: string[] = [];
    const challenges: string[] = [];
    const focusNextWeek: string[] = [];
    
    // Achievements
    if (userData.improvement > 0) {
      achievements.push(`Improved overall score by ${Math.round(userData.improvement)}%`);
    }
    if (userData.totalTests >= 3) {
      achievements.push(`Completed ${userData.totalTests} practice tests`);
    }
    if (userData.strongTopics.length > 0) {
      achievements.push(`Mastered ${userData.strongTopics.map(t => t.name).join(', ')}`);
    }
    
    // Challenges
    if (userData.weakTopics.length > 0) {
      challenges.push(`Need improvement in ${userData.weakTopics.map(t => t.name).join(', ')}`);
    }
    if (userData.speedScore < 70) {
      challenges.push(`Time management needs attention`);
    }
    if (userData.consistencyScore < 60) {
      challenges.push(`Score consistency could be improved`);
    }
    
    // Focus for next week
    if (userData.weakTopics.length > 0) {
      focusNextWeek.push(`Focus on ${userData.weakTopics[0].name}`);
    }
    if (userData.speedScore < 70) {
      focusNextWeek.push(`Practice timed questions`);
    }
    focusNextWeek.push(`Take at least 2 practice tests`);
    
    const summary = `This week you completed ${userData.totalTests} tests with an average score of ${Math.round(userData.averageScore)}%. ${userData.improvement > 0 ? `Great improvement of ${Math.round(userData.improvement)}%!` : 'Keep practicing to see improvement.'}`;
    
    return {
      summary,
      achievements,
      challenges,
      focusNextWeek
    };
  }
}