import { UserPerformanceData, Recommendation, ActionableStep, RecommendationContext } from './types';
import { PriorityCalculator } from './priority-calculator';
import { InsightGenerator } from './insight-generator';

export class RecommendationEngine {
  static async generateRecommendations(
    userData: UserPerformanceData,
    context: RecommendationContext
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    
    // 1. Topic-based recommendations
    const topicRecommendations = this.generateTopicRecommendations(userData);
    recommendations.push(...topicRecommendations);
    
    // 2. Strategy recommendations
    const strategyRecommendations = await this.generateStrategyRecommendations(userData, context);
    recommendations.push(...strategyRecommendations);
    
    // 3. Time management recommendations
    const timeRecommendations = this.generateTimeManagementRecommendations(userData);
    recommendations.push(...timeRecommendations);
    
    // 4. Resource recommendations
    const resourceRecommendations = this.generateResourceRecommendations(userData);
    recommendations.push(...resourceRecommendations);
    
    // 5. Motivation recommendations
    const motivationRecommendations = this.generateMotivationRecommendations(userData);
    recommendations.push(...motivationRecommendations);
    
    // Calculate priority scores and sort
    recommendations.forEach(rec => {
      rec.score = PriorityCalculator.calculateRecommendationPriority(rec, userData);
      rec.priority = PriorityCalculator.getPriorityLevel(rec.score);
    });
    
    return recommendations.sort((a, b) => b.score - a.score);
  }
  
  private static generateTopicRecommendations(userData: UserPerformanceData): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    for (const topic of userData.weakTopics.slice(0, 3)) {
      const priorityScore = PriorityCalculator.calculateTopicPriority(topic, userData);
      
      const actionableSteps: ActionableStep[] = [
        {
          id: `step-${topic.name}-1`,
          description: `Review ${topic.name} fundamentals and key formulas`,
          duration: '45 min',
          resources: ['Khan Academy', 'Textbook chapters', 'Video tutorials']
        },
        {
          id: `step-${topic.name}-2`,
          description: `Complete 20 practice questions on ${topic.name}`,
          duration: '1 hour',
          verificationMethod: 'Score at least 70%'
        },
        {
          id: `step-${topic.name}-3`,
          description: `Take a focused quiz on ${topic.name}`,
          duration: '30 min',
          verificationMethod: 'Score improvement of 15%'
        }
      ];
      
      recommendations.push({
        id: `topic-${topic.name}`,
        title: `Master ${topic.name}`,
        description: `You're scoring ${Math.round(topic.accuracy)}% on ${topic.name}, which is below the target of 70%.`,
        reason: `${topic.name} appears in ${topic.frequency} of your recent tests. Improving this area could boost your overall score significantly.`,
        priority: 'high',
        score: priorityScore,
        actionableSteps,
        estimatedTimeToComplete: '2-3 hours',
        expectedImpact: {
          scoreImprovement: Math.min(20, Math.round((70 - topic.accuracy) / 2)),
          description: `Increase ${topic.name} accuracy to 70%`
        },
        category: 'topic',
        metadata: {
          basedOn: [`Low accuracy (${Math.round(topic.accuracy)}%)`, `Appears in ${topic.frequency} tests`],
          confidence: 0.85,
          requiresFollowUp: true,
          followUpRecommendation: `Take a follow-up test on ${topic.name} after practice`
        }
      });
    }
    
    return recommendations;
  }
  
  private static generateTimeManagementRecommendations(userData: UserPerformanceData): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // Check if time management is an issue
    if (userData.speedScore < 70) {
      const avgTimePerQuestion = userData.timeSpentTotal / 
        userData.testHistory.reduce((sum, t) => sum + t.totalQuestions, 0);
      
      const actionableSteps: ActionableStep[] = [
        {
          id: 'time-step-1',
          description: 'Practice with a timer - aim for 90 seconds per question',
          duration: '1 hour',
          resources: ['Stopwatch app', 'Timer browser extension']
        },
        {
          id: 'time-step-2',
          description: 'Learn to identify and skip difficult questions quickly',
          duration: '30 min',
          verificationMethod: 'Reduce average time by 15 seconds'
        },
        {
          id: 'time-step-3',
          description: 'Take a full-length timed practice test',
          duration: '2 hours',
          verificationMethod: 'Complete all questions within time limit'
        }
      ];
      
      recommendations.push({
        id: 'time-management-1',
        title: 'Improve Your Speed',
        description: `You're spending an average of ${Math.round(avgTimePerQuestion)} seconds per question, which is above the recommended 90 seconds.`,
        reason: 'NUET requires quick thinking and efficient time management. Spending too much time on questions means you might not finish all sections.',
        priority: 'high',
        score: 75,
        actionableSteps,
        estimatedTimeToComplete: '3-4 hours',
        expectedImpact: {
          scoreImprovement: 10,
          description: 'Complete 15% more questions with same accuracy'
        },
        category: 'time_management',
        metadata: {
          basedOn: [`Average time: ${Math.round(avgTimePerQuestion)}s/question`],
          confidence: 0.9,
          requiresFollowUp: true,
          followUpRecommendation: 'Retake a timed test to measure improvement'
        }
      });
    }
    
    return recommendations;
  }
  
  private static async generateStrategyRecommendations(
    userData: UserPerformanceData,
    context: RecommendationContext
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    
    // Check consistency
    if (userData.consistencyScore < 60) {
      recommendations.push({
        id: 'strategy-consistency',
        title: 'Build Consistent Study Habits',
        description: 'Your scores vary significantly between tests, indicating inconsistent preparation.',
        reason: 'Consistent daily practice leads to better retention and more stable performance. Students who study regularly score 20% higher on average.',
        priority: 'high',
        score: 70,
        actionableSteps: [
          {
            id: 'consistency-1',
            description: 'Set a fixed daily study time (e.g., 7:00 PM - 8:00 PM)',
            duration: 'Daily'
          },
          {
            id: 'consistency-2',
            description: 'Use a study tracker to log your progress',
            duration: '5 min/day'
          },
          {
            id: 'consistency-3',
            description: 'Take at least 2 practice tests per week',
            duration: '3 hours/week'
          }
        ],
        estimatedTimeToComplete: '2 weeks',
        expectedImpact: {
          scoreImprovement: 15,
          description: 'Stabilize scores and build confidence'
        },
        category: 'strategy',
        metadata: {
          basedOn: [`Score variance of ${Math.round(100 - userData.consistencyScore)}%`],
          confidence: 0.85,
          requiresFollowUp: true
        }
      });
    }
    
    // Check if exam is approaching
    if (context.timeContext.daysUntilExam && context.timeContext.daysUntilExam < 30) {
      recommendations.push({
        id: 'strategy-exam-approach',
        title: 'Exam Countdown Strategy',
        description: `You have ${context.timeContext.daysUntilExam} days until the exam. Time to intensify your preparation!`,
        reason: 'Last month before exam is critical for review and practice. Focus on full-length tests and weak areas.',
        priority: 'critical',
        score: 95,
        actionableSteps: [
          {
            id: 'exam-1',
            description: 'Take 2 full-length practice tests per week',
            duration: '3 hours each'
          },
          {
            id: 'exam-2',
            description: 'Review all mistakes immediately after each test',
            duration: '1 hour'
          },
          {
            id: 'exam-3',
            description: 'Focus on weak topics identified by AI',
            duration: '2 hours/day'
          }
        ],
        estimatedTimeToComplete: 'Until exam date',
        expectedImpact: {
          scoreImprovement: 20,
          description: 'Peak performance on exam day'
        },
        category: 'strategy',
        metadata: {
          basedOn: [`${context.timeContext.daysUntilExam} days remaining`],
          confidence: 0.95,
          requiresFollowUp: false
        }
      });
    }
    
    return recommendations;
  }
  
  private static generateResourceRecommendations(userData: UserPerformanceData): Recommendation[] {
    const weakTopics = userData.weakTopics.map(t => t.name).slice(0, 2);
    
    if (weakTopics.length === 0) return [];
    
    return [{
      id: 'resources-1',
      title: 'Recommended Study Materials',
      description: `Based on your weak areas (${weakTopics.join(', ')}), here are curated resources to help you improve.`,
      reason: 'Using the right resources can accelerate learning by up to 40%. These materials are specifically chosen for NUET preparation.',
      priority: 'medium',
      score: 60,
      actionableSteps: [
        {
          id: 'resource-1',
          description: 'Khan Academy - Watch videos on ' + weakTopics.join(', '),
          duration: '2 hours',
          resources: ['https://www.khanacademy.org']
        },
        {
          id: 'resource-2',
          description: 'NUET Past Papers - Practice official questions',
          duration: '3 hours',
          resources: ['Official NUET website']
        },
        {
          id: 'resource-3',
          description: 'Join study groups for collaborative learning',
          duration: '1 hour/week'
        }
      ],
      estimatedTimeToComplete: '1 week',
      expectedImpact: {
        scoreImprovement: 10,
        description: 'Better understanding of weak topics'
      },
      category: 'resource',
      metadata: {
        basedOn: [`Weak topics: ${weakTopics.join(', ')}`],
        confidence: 0.8,
        requiresFollowUp: false
      }
    }];
  }
  
  private static generateMotivationRecommendations(userData: UserPerformanceData): Recommendation[] {
    if (userData.performanceTrend === 'declining') {
      return [{
        id: 'motivation-1',
        title: 'Don\'t Give Up! 💪',
        description: 'Your scores have been declining recently, but every expert was once a beginner.',
        reason: 'Many students experience slumps before breakthrough improvements. Take a moment to review your past successes and get back on track.',
        priority: 'medium',
        score: 65,
        actionableSteps: [
          {
            id: 'motivation-1',
            description: 'Review your best-performing test to boost confidence',
            duration: '15 min'
          },
          {
            id: 'motivation-2',
            description: 'Take a break and come back fresh',
            duration: '30 min'
          },
          {
            id: 'motivation-3',
            description: 'Start with easier topics to rebuild momentum',
            duration: '1 hour'
          }
        ],
        estimatedTimeToComplete: '2 hours',
        expectedImpact: {
          scoreImprovement: 5,
          description: 'Regain confidence and motivation'
        },
        category: 'motivation',
        metadata: {
          basedOn: ['Declining performance trend'],
          confidence: 0.7,
          requiresFollowUp: true
        }
      }];
    }
    
    if (userData.performanceTrend === 'improving' && userData.improvement > 10) {
      return [{
        id: 'motivation-2',
        title: 'Amazing Progress! 🎉',
        description: `You've improved by ${Math.round(userData.improvement)}%! This is excellent work!`,
        reason: 'Recognizing progress builds motivation. Your consistent effort is paying off.',
        priority: 'low',
        score: 40,
        actionableSteps: [
          {
            id: 'motivation-celebrate',
            description: 'Celebrate your progress and keep the momentum going',
            duration: '5 min'
          },
          {
            id: 'motivation-next',
            description: 'Set your next target: ' + Math.min(100, userData.predictedScore + 5) + '%',
            duration: '5 min'
          }
        ],
        estimatedTimeToComplete: '10 min',
        expectedImpact: {
          scoreImprovement: 0,
          description: 'Maintain motivation and momentum'
        },
        category: 'motivation',
        metadata: {
          basedOn: [`${Math.round(userData.improvement)}% improvement`],
          confidence: 0.9,
          requiresFollowUp: false
        }
      }];
    }
    
    return [];
  }
}