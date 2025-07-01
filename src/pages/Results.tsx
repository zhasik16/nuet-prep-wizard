
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Home, CheckCircle, XCircle, Clock, Target, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Results = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<any>(null);
  const [showExplanations, setShowExplanations] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    const savedResults = localStorage.getItem('latestResults');
    if (!savedResults) {
      navigate('/practice');
      return;
    }
    setResults(JSON.parse(savedResults));
  }, [navigate]);

  if (!results) {
    return <div>Loading...</div>;
  }

  const correctAnswers = results.questions.filter((q: any, index: number) => 
    results.answers[index] === q.correct
  ).length;
  
  const wrongAnswers = results.totalQuestions - correctAnswers;
  const unanswered = Object.keys(results.answers).length < results.totalQuestions 
    ? results.totalQuestions - Object.keys(results.answers).length 
    : 0;

  const toggleExplanation = (questionIndex: number) => {
    setShowExplanations(prev => ({
      ...prev,
      [questionIndex]: !prev[questionIndex]
    }));
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NUET Prep
              </span>
            </Link>
            <Link to="/">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Results Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Test Results
            </h1>
            <p className="text-lg text-gray-600">
              {results.testType}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-white">{results.score}%</span>
              </div>
              <div className="text-gray-600 font-medium">Overall Score</div>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">{correctAnswers}</div>
              <div className="text-gray-600 font-medium">Correct</div>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600 mb-1">{wrongAnswers}</div>
              <div className="text-gray-600 font-medium">Incorrect</div>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1">{formatTime(results.timeElapsed)}</div>
              <div className="text-gray-600 font-medium">Time Taken</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/practice">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <RotateCcw className="w-4 h-4 mr-2" />
                Take Another Test
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="lg">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Performance Feedback */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Performance Analysis</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-gray-700 mb-4">
              {results.score >= 90 ? "🎉 Excellent! You're very well prepared for the NUET. Keep up the great work!" :
               results.score >= 80 ? "👏 Great job! You have a strong understanding of the material. Review the incorrect answers to perfect your knowledge." :
               results.score >= 70 ? "👍 Good work! You're on the right track. Focus on your weak areas and practice more." :
               results.score >= 60 ? "📚 You're making progress! Spend more time studying the concepts you missed." :
               "💪 Don't give up! This is a learning process. Review all explanations and take more practice tests."}
            </p>
            <div className="text-sm text-gray-600">
              <strong>Recommendation:</strong> {results.score < 80 ? "Review the detailed explanations below and retake similar practice tests to improve your understanding." : "You're ready for the actual NUET! Continue practicing to maintain your strong performance."}
            </div>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Question Review</h2>
          <div className="space-y-6">
            {results.questions.map((question: any, index: number) => {
              const userAnswer = results.answers[index];
              const isCorrect = userAnswer === question.correct;
              const wasAnswered = userAnswer !== undefined;

              return (
                <Card key={index} className={`p-6 border-l-4 ${
                  !wasAnswered ? 'border-l-gray-400 bg-gray-50' :
                  isCorrect ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-semibold text-gray-600">
                        Question {index + 1}
                      </span>
                      <span className="text-sm text-gray-500">
                        {question.subject}
                      </span>
                      {!wasAnswered ? (
                        <span className="bg-gray-500 text-white px-2 py-1 rounded text-xs">
                          Unanswered
                        </span>
                      ) : isCorrect ? (
                        <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                          Correct
                        </span>
                      ) : (
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                          Incorrect
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExplanation(index)}
                    >
                      {showExplanations[index] ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          Hide Explanation
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Show Explanation
                        </>
                      )}
                    </Button>
                  </div>

                  <h3 className="font-medium text-gray-900 mb-4">
                    {question.question}
                  </h3>

                  <div className="grid gap-2 mb-4">
                    {question.options.map((option: string, optionIndex: number) => {
                      const optionLetter = option.charAt(0);
                      const isUserChoice = userAnswer === optionLetter;
                      const isCorrectOption = question.correct === optionLetter;

                      return (
                        <div
                          key={optionIndex}
                          className={`p-3 rounded-lg border-2 ${
                            isCorrectOption 
                              ? 'border-green-500 bg-green-100 text-green-800' 
                              : isUserChoice && !isCorrectOption
                              ? 'border-red-500 bg-red-100 text-red-800'
                              : 'border-gray-200 bg-white text-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option}</span>
                            <div className="flex space-x-2">
                              {isCorrectOption && (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              )}
                              {isUserChoice && !isCorrectOption && (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {showExplanations[index] && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">Explanation:</h4>
                      <p className="text-blue-700">{question.explanation}</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
