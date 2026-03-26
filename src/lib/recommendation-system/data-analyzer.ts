import { TestAttempt, TopicStats, UserPerformanceData } from './types';

export class DataAnalyzer {
  static analyzeUserPerformance(attempts: TestAttempt[]): UserPerformanceData {
    if (!attempts || attempts.length === 0) {
      return this.getEmptyPerformanceData();
    }

    // Calculate base metrics
    const averageScore = attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length;
    const totalTests = attempts.length;
    const timeSpentTotal = attempts.reduce((sum, a) => sum + a.timeSpent, 0);

    // Analyze topics
    const topicStats = this.analyzeTopics(attempts);
    const strongTopics = topicStats.filter(t => t.accuracy >= 70).slice(0, 3);
    const weakTopics = topicStats.filter(t => t.accuracy < 70).sort((a, b) => a.accuracy - b.accuracy);

    // Calculate trends
    const recentTests = attempts.slice(0, Math.min(3, attempts.length));
    const olderTests = attempts.slice(-Math.min(3, attempts.length));
    const recentAvg = recentTests.reduce((sum, t) => sum + t.score, 0) / recentTests.length;
    const olderAvg = olderTests.reduce((sum, t) => sum + t.score, 0) / olderTests.length;
    const improvement = recentAvg - olderAvg;
    
    const performanceTrend: 'improving' | 'declining' | 'stable' = 
      improvement > 5 ? 'improving' : improvement < -5 ? 'declining' : 'stable';

    // Calculate consistency score (0-100)
    const scores = attempts.map(a => a.score);
    const variance = this.calculateVariance(scores);
    const consistencyScore = Math.max(0, 100 - variance * 2);

    // Calculate speed score
    const avgTimePerQuestion = timeSpentTotal / attempts.reduce((sum, t) => sum + t.totalQuestions, 0);
    const speedScore = avgTimePerQuestion < 90 ? 90 : avgTimePerQuestion < 120 ? 70 : 50;

    // Calculate accuracy score
    const accuracyScore = averageScore;

    // Calculate recommended study hours
    const recommendedStudyHours = Math.max(2, Math.floor((80 - averageScore) / 5));

    // Predict future score
    const predictedScore = Math.min(95, averageScore + improvement + (consistencyScore / 10));

    return {
      testHistory: attempts,
      averageScore,
      totalTests,
      improvement,
      strongTopics,
      weakTopics,
      timeSpentTotal,
      recommendedStudyHours,
      performanceTrend,
      predictedScore,
      consistencyScore,
      speedScore,
      accuracyScore
    };
  }

  private static analyzeTopics(attempts: TestAttempt[]): TopicStats[] {
    const topicMap = new Map<string, {
      correct: number;
      total: number;
      frequency: number;
      lastDate: string;
      totalTime: number;
    }>();

    attempts.forEach(attempt => {
      attempt.questions?.forEach(q => {
        const topic = q.topic;
        if (!topicMap.has(topic)) {
          topicMap.set(topic, { correct: 0, total: 0, frequency: 0, lastDate: '', totalTime: 0 });
        }
        const stats = topicMap.get(topic)!;
        stats.total++;
        if (q.isCorrect) stats.correct++;
        stats.frequency++;
        stats.totalTime += q.timeSpent;
        if (new Date(attempt.date) > new Date(stats.lastDate)) {
          stats.lastDate = attempt.date;
        }
      });
    });

    return Array.from(topicMap.entries()).map(([name, stats]) => ({
      name,
      accuracy: (stats.correct / stats.total) * 100,
      frequency: stats.frequency,
      lastAppeared: stats.lastDate,
      trend: 'stable', // Can be calculated with more data
      questionsAttempted: stats.total,
      averageTimePerQuestion: stats.totalTime / stats.total
    }));
  }

  private static calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const variance = numbers.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numbers.length;
    return variance;
  }

  private static getEmptyPerformanceData(): UserPerformanceData {
    return {
      testHistory: [],
      averageScore: 0,
      totalTests: 0,
      improvement: 0,
      strongTopics: [],
      weakTopics: [],
      timeSpentTotal: 0,
      recommendedStudyHours: 2,
      performanceTrend: 'stable',
      predictedScore: 50,
      consistencyScore: 0,
      speedScore: 0,
      accuracyScore: 0
    };
  }
}