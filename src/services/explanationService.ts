import OpenAI from 'openai';

const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: openaiApiKey || 'dummy-key',
  dangerouslyAllowBrowser: true
});

export interface AIExplanation {
  stepByStep: string[];
  keyConcepts: string[];
  commonMistake: string;
  tips: string;
  relatedTopics: string[];
  formulaUsed?: string;
}

export const explanationService = {
  async generateExplanation(
    question: string,
    userAnswer: string,
    correctAnswer: string,
    topic: string,
    options?: string[]
  ): Promise<AIExplanation> {
    try {
      const prompt = `
  You are a NUET exam tutor. Provide a detailed explanation for this question:

  Topic: ${topic}
  Question: ${question}
  ${options ? `Options: ${options.join(', ')}` : ''}
  User's Answer: ${userAnswer}
  Correct Answer: ${correctAnswer}

  Please provide:
  1. A COMPLETE step-by-step solution showing ALL work (like you're solving it on a whiteboard):
     - Start with what's given
     - Show each mathematical operation
     - Explain WHY each step is done
     - Show intermediate calculations
     - End with the final answer
  2. Key concepts being tested
  3. Common mistake that leads to the wrong answer
  4. Study tips for this topic
  5. Related topics to review
  ${topic === 'Math' ? '6. Any formulas used (write them out fully)' : ''}

  For the step-by-step solution, be extremely detailed. If it's a math problem, show actual numbers and calculations.
  If it's a critical thinking problem, show the logical reasoning flow.

  Format as JSON with these exact keys:
  {
    "stepByStep": ["detailed step 1", "detailed step 2", ...],
    "keyConcepts": ["concept1", "concept2"],
    "commonMistake": "description of common mistake",
    "tips": "study tips",
    "relatedTopics": ["topic1", "topic2"],
    ${topic === 'Math' ? '"formulaUsed": "formula with explanation"' : ''}
  }
`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert NUET exam tutor. Provide clear, detailed, and educational explanations. Focus on helping the student understand the concept, not just get the answer.'
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
      console.error('Error generating explanation:', error);
      return this.getDefaultExplanation(correctAnswer, topic);
    }
  },

  getDefaultExplanation(correctAnswer: string, topic: string): AIExplanation {
    return {
      stepByStep: [
        `The correct answer is ${correctAnswer}.`,
        `Review the concepts related to ${topic}.`,
        `Practice similar questions to strengthen your understanding.`
      ],
      keyConcepts: [`Key concepts in ${topic}`],
      commonMistake: `Misunderstanding the core concept of ${topic}`,
      tips: `Focus on understanding the fundamental principles of ${topic} before attempting complex problems.`,
      relatedTopics: [topic],
      formulaUsed: topic === 'Math' ? 'Review relevant formulas for this topic' : undefined
    };
  }
};