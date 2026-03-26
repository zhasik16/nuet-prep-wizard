import OpenAI from 'openai';

const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: openaiApiKey || 'dummy-key',
  dangerouslyAllowBrowser: true // For development only
});

export interface TestAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  topicsToFocus: Record<string, number>;
  summary: string;
  studyPlan: string[];
  estimatedImprovement: string;
  resourcesNeeded: string[];
}

export interface UserProgress {
  testHistory: {
    testId: string;
    testTitle: string;
    score: number;
    totalQuestions: number;
    date: string;
    weakTopics: string[];
    timeSpent: number;
  }[];
  averageScore: number;
  totalTests: number;
  improvement: number;
  strongTopics: string[];
  weakTopics: string[];
  timeSpentTotal: number;
  recommendedStudyHours: number;
}

export interface SmartRecommendation {
  priorityTopics: string[];
  dailyStudyPlan: string[];
  weeklyGoals: string[];
  estimatedPreparationTime: string;
  motivationalMessage: string;
  insights: string[];
  predictedScore: number;
  recommendedResources: {
    topic: string;
    resources: string[];
  }[];
}

export const aiService = {
  // Enhanced test analysis with more detailed feedback
  async analyzeTestResults(
    testTitle: string,
    questions: Array<{
      text: string;
      userAnswer: string;
      correctAnswer: string;
      topic: string;
      isCorrect: boolean;
    }>,
    score: number,
    totalQuestions: number,
    timeSpent: number
  ): Promise<TestAnalysis> {
    try {
      const incorrectQuestions = questions.filter(q => !q.isCorrect);
      const correctQuestions = questions.filter(q => q.isCorrect);
      
      const prompt = `
        You are an expert NUET (Nazarbayev University Entrance Test) tutor with years of experience helping students succeed.
        
        Test: ${testTitle}
        Score: ${score}/${totalQuestions} (${Math.round((score/totalQuestions)*100)}%)
        Time Spent: ${Math.floor(timeSpent / 60)} minutes ${timeSpent % 60} seconds
        
        Question Analysis:
        ${questions.map((q, i) => `
          Q${i+1}: ${q.text.substring(0, 100)}...
          Topic: ${q.topic}
          ${q.isCorrect ? '✅ Correct' : '❌ Incorrect'}
          ${!q.isCorrect ? `Your answer: ${q.userAnswer || 'Not answered'}\nCorrect answer: ${q.correctAnswer}` : ''}
        `).join('\n')}
        
        Based on this performance, provide a detailed analysis:
        
        1. Key strengths (what concepts they mastered)
        2. Key weaknesses (specific areas needing improvement)
        3. Specific, actionable recommendations for improvement
        4. Topics to focus on with priority scores (0-100)
        5. A comprehensive summary of their performance
        6. A 3-step study plan for improvement
        7. Estimated improvement after following the plan (percentage)
        8. Recommended study resources (books, websites, practice materials)
        
        Format as JSON with these exact keys:
        {
          "strengths": ["detailed strength 1", "detailed strength 2"],
          "weaknesses": ["detailed weakness 1", "detailed weakness 2"],
          "recommendations": ["specific recommendation 1", "specific recommendation 2"],
          "topicsToFocus": {"topicName": priorityScore},
          "summary": "detailed performance summary",
          "studyPlan": ["step 1", "step 2", "step 3"],
          "estimatedImprovement": "e.g., 15-20%",
          "resourcesNeeded": ["resource 1", "resource 2"]
        }
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a specialized NUET exam tutor. Provide detailed, personalized, and actionable feedback. Be encouraging but honest.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const content = response.choices[0].message.content;
      if (content) {
        return JSON.parse(content);
      }
      throw new Error('No response from AI');
    } catch (error) {
      console.error('Error analyzing test results:', error);
      return this.getDefaultAnalysis(score, totalQuestions);
    }
  },

  // Enhanced recommendations based on user history
  async generateSmartRecommendations(userProgress: UserProgress): Promise<SmartRecommendation> {
    try {
      const prompt = `
        You are an AI study advisor specializing in NUET preparation.
        
        User Profile:
        - Tests Completed: ${userProgress.totalTests}
        - Average Score: ${Math.round(userProgress.averageScore)}%
        - Improvement Trend: ${userProgress.improvement > 0 ? '+' : ''}${userProgress.improvement}%
        - Total Study Time: ${Math.floor(userProgress.timeSpentTotal / 60)} hours
        - Recommended Daily Study: ${userProgress.recommendedStudyHours} hours/day
        
        Performance Pattern:
        Strong Topics: ${userProgress.strongTopics.join(', ') || 'None identified yet'}
        Weak Topics: ${userProgress.weakTopics.join(', ') || 'None identified yet'}
        
        Recent Tests:
        ${userProgress.testHistory.slice(-3).map(test => `
          - ${test.testTitle}: ${test.score}% (${test.weakTopics.join(', ')})
        `).join('\n')}
        
        Based on this data, provide:
        
        1. Priority topics to focus on (top 3-5, ranked by importance)
        2. Daily study plan (3-5 actionable tasks with time estimates)
        3. Weekly goals (achievable targets for the next 7 days)
        4. Estimated preparation time before the NUET exam
        5. A personalized motivational message
        6. Key insights about their learning pattern
        7. Predicted score improvement after 1 month of following the plan
        8. Recommended resources for each weak topic
        
        Format as JSON:
        {
          "priorityTopics": ["topic1", "topic2", "topic3"],
          "dailyStudyPlan": ["task1 (30 min)", "task2 (45 min)", "task3 (20 min)"],
          "weeklyGoals": ["goal1", "goal2", "goal3"],
          "estimatedPreparationTime": "X weeks/months",
          "motivationalMessage": "personalized message",
          "insights": ["insight1", "insight2", "insight3"],
          "predictedScore": 75,
          "recommendedResources": [
            {"topic": "Algebra", "resources": ["Khan Academy", "Practice Book X"]},
            {"topic": "Geometry", "resources": ["YouTube Channel Y", "App Z"]}
          ]
        }
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a NUET preparation expert. Provide practical, actionable advice. Be specific with time estimates and resources.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      const content = response.choices[0].message.content;
      if (content) {
        return JSON.parse(content);
      }
      throw new Error('No response from AI');
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.getDefaultRecommendations(userProgress);
    }
  },

  // Generate weekly study plan
  async generateWeeklyStudyPlan(
    weakTopics: string[],
    availableHours: number,
    targetScore: number
  ): Promise<{
    dailyPlan: { day: string; tasks: string[]; hours: number }[];
    weeklyGoal: string;
    expectedProgress: string;
  }> {
    try {
      const prompt = `
        Create a weekly study plan for NUET preparation.
        
        Weak Topics: ${weakTopics.join(', ')}
        Available Study Hours per Week: ${availableHours} hours
        Target Score: ${targetScore}%
        
        Create a detailed 7-day plan with:
        1. Daily schedule with specific tasks
        2. Time allocation for each task
        3. Weekly goal
        4. Expected progress after this week
        
        Format as JSON:
        {
          "dailyPlan": [
            {"day": "Monday", "tasks": ["task1", "task2"], "hours": 2},
            {"day": "Tuesday", "tasks": ["task1", "task2"], "hours": 1.5}
          ],
          "weeklyGoal": "specific goal for this week",
          "expectedProgress": "expected improvement percentage"
        }
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a study planner expert. Create realistic, achievable plans.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 600
      });

      const content = response.choices[0].message.content;
      if (content) {
        return JSON.parse(content);
      }
      throw new Error('No response from AI');
    } catch (error) {
      console.error('Error generating weekly plan:', error);
      return {
        dailyPlan: [
          { day: 'Monday', tasks: ['Review weak topics', 'Practice 20 questions'], hours: 2 },
          { day: 'Tuesday', tasks: ['Take practice test', 'Review mistakes'], hours: 2 },
          { day: 'Wednesday', tasks: ['Focus on difficult concepts', 'Watch tutorial videos'], hours: 1.5 },
          { day: 'Thursday', tasks: ['Practice similar questions', 'Time management practice'], hours: 2 },
          { day: 'Friday', tasks: ['Review all topics', 'Take full-length test'], hours: 3 },
          { day: 'Saturday', tasks: ['Analyze test results', 'Focus on weak areas'], hours: 2 },
          { day: 'Sunday', tasks: ['Rest and review', 'Plan next week'], hours: 1 }
        ],
        weeklyGoal: 'Improve weak topics by 20%',
        expectedProgress: '5-10% improvement'
      };
    }
  },

  // Get study tips for specific topic
  async getStudyTips(topic: string, difficulty: string = 'Medium'): Promise<{
    tips: string[];
    commonMistakes: string[];
    practiceRecommendations: string[];
    estimatedMasteryTime: string;
  }> {
    try {
      const prompt = `
        Provide study tips for mastering ${topic} for NUET (${difficulty} level).
        
        Include:
        1. 5 specific study tips
        2. 3 common mistakes students make
        3. Practice recommendations
        4. Estimated time to master this topic
        
        Format as JSON:
        {
          "tips": ["tip1", "tip2", "tip3", "tip4", "tip5"],
          "commonMistakes": ["mistake1", "mistake2", "mistake3"],
          "practiceRecommendations": ["recommendation1", "recommendation2"],
          "estimatedMasteryTime": "X hours/days"
        }
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a subject matter expert for NUET exam preparation.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      });

      const content = response.choices[0].message.content;
      if (content) {
        return JSON.parse(content);
      }
      throw new Error('No response from AI');
    } catch (error) {
      console.error('Error getting study tips:', error);
      return {
        tips: ['Practice regularly', 'Review fundamentals', 'Take mock tests', 'Analyze mistakes', 'Time yourself'],
        commonMistakes: ['Rushing through questions', 'Not reading carefully', 'Skipping steps'],
        practiceRecommendations: ['Use practice books', 'Take online quizzes', 'Review past papers'],
        estimatedMasteryTime: '2-3 weeks'
      };
    }
  },

  // Default analysis fallback
  getDefaultAnalysis(score: number, totalQuestions: number): TestAnalysis {
    const percentage = (score / totalQuestions) * 100;
    return {
      strengths: ['Attempted all questions'],
      weaknesses: ['Review incorrect answers carefully'],
      recommendations: [
        'Take more practice tests',
        'Review fundamental concepts',
        'Focus on time management'
      ],
      topicsToFocus: {},
      summary: percentage >= 70 
        ? 'Good performance! Keep practicing to maintain your score.'
        : 'Keep practicing! Focus on understanding concepts rather than memorizing.',
      studyPlan: [
        'Review all incorrect answers',
        'Practice 20 similar questions',
        'Take another practice test'
      ],
      estimatedImprovement: '10-15%',
      resourcesNeeded: ['Practice materials', 'Study guides', 'Online resources']
    };
  },

  // Default recommendations fallback
  getDefaultRecommendations(userProgress: UserProgress): SmartRecommendation {
    return {
      priorityTopics: userProgress.weakTopics.length > 0 
        ? userProgress.weakTopics.slice(0, 3)
        : ['Mathematics Fundamentals', 'Critical Thinking Basics'],
      dailyStudyPlan: [
        'Review weak topics (30 min)',
        'Practice questions (45 min)',
        'Review mistakes (20 min)',
        'Take short quiz (15 min)'
      ],
      weeklyGoals: [
        'Complete 3 practice tests',
        'Improve weak topics by 15%',
        'Review all mistakes thoroughly'
      ],
      estimatedPreparationTime: userProgress.averageScore > 70 ? '4-6 weeks' : '8-12 weeks',
      motivationalMessage: userProgress.improvement > 0
        ? `Great improvement of ${userProgress.improvement}%! Keep up the momentum!`
        : "Every expert was once a beginner. Keep practicing, and you'll see improvement!",
      insights: [
        'Consistent practice is key to improvement',
        'Review mistakes to avoid repeating them',
        'Time management is crucial for NUET'
      ],
      predictedScore: Math.min(100, userProgress.averageScore + 15),
      recommendedResources: [
        { topic: 'General', resources: ['NUET Past Papers', 'Official Study Guide', 'Online Practice Tests'] }
      ]
    };
  }
};