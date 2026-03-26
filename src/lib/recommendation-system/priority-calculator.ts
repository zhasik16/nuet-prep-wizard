import { TopicStats, Recommendation, UserPerformanceData } from './types';

export class PriorityCalculator {
  static calculateTopicPriority(topic: TopicStats, userData: UserPerformanceData): number {
    let priority = 0;
    
    // Accuracy factor (lower accuracy = higher priority)
    const accuracyPenalty = Math.max(0, 70 - topic.accuracy);
    priority += accuracyPenalty * 1.5;
    
    // Frequency factor (more frequent = higher priority)
    const frequencyBonus = Math.min(50, topic.frequency * 10);
    priority += frequencyBonus;
    
    // Recency factor (more recent = higher priority)
    const daysSinceLastAppeared = Math.floor(
      (Date.now() - new Date(topic.lastAppeared).getTime()) / (1000 * 60 * 60 * 24)
    );
    const recencyBonus = Math.max(0, 30 - daysSinceLastAppeared);
    priority += recencyBonus;
    
    // Time factor (if taking too long per question)
    if (topic.averageTimePerQuestion > 120) {
      priority += 20;
    }
    
    return Math.min(100, priority);
  }
  
  static calculateRecommendationPriority(rec: Recommendation, userData: UserPerformanceData): number {
    let priority = rec.score;
    
    // Boost based on user's performance trend
    if (userData.performanceTrend === 'declining' && rec.category === 'strategy') {
      priority += 20;
    }
    
    // Boost time management if user is slow
    if (userData.speedScore < 70 && rec.category === 'time_management') {
      priority += 25;
    }
    
    // Boost topic recommendations for weak areas
    if (rec.category === 'topic' && userData.weakTopics.length > 0) {
      priority += 15;
    }
    
    return Math.min(100, priority);
  }
  
  static getPriorityLevel(score: number): 'critical' | 'high' | 'medium' | 'low' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }
}