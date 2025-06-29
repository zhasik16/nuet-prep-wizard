
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, Flag, BookOpen, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: string}>({});
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes in seconds
  const [showResults, setShowResults] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  // Sample NUET questions
  const questions = [
    {
      id: 1,
      subject: "Mathematics",
      question: "If 2x + 5 = 13, what is the value of x?",
      options: ["A) 3", "B) 4", "C) 5", "D) 6"],
      correct: "B"
    },
    {
      id: 2,
      subject: "Reading Comprehension",
      question: "In the passage about Kazakhstan's history, what year was Nazarbayev University established?",
      options: ["A) 2008", "B) 2010", "C) 2012", "D) 2015"],
      correct: "B"
    },
    {
      id: 3,
      subject: "Logic",
      question: "If all Kazakhstanis are citizens, and some citizens are students, which conclusion is valid?",
      options: [
        "A) All students are Kazakhstanis",
        "B) Some Kazakhstanis might be students", 
        "C) No citizens are students",
        "D) All citizens are Kazakhstanis"
      ],
      correct: "B"
    },
    {
      id: 4,
      subject: "English",
      question: "Choose the correct form: 'The research _____ by the university students last year.'",
      options: [
        "A) was conducted",
        "B) were conducted", 
        "C) has conducted",
        "D) conducting"
      ],
      correct: "A"
    },
    {
      id: 5,
      subject: "Mathematics",
      question: "What is the area of a circle with radius 7 cm? (Use π ≈ 3.14)",
      options: ["A) 153.86 cm²", "B) 43.96 cm²", "C) 21.98 cm²", "D) 87.92 cm²"],
      correct: "A"
    }
  ];

  useEffect(() => {
    if (isStarted && !showResults && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setShowResults(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isStarted, showResults, timeLeft]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correct) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const startQuiz = () => {
    setIsStarted(true);
  };

  const submitQuiz = () => {
    setShowResults(true);
  };

  if (!isStarted) {
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

        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              NUET Practice Test
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Take a comprehensive practice test designed to simulate the actual 
              Nazarbayev University Entrance Test experience.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">5</div>
                <div className="text-gray-700">Questions</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">90</div>
                <div className="text-gray-700">Minutes</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-2">4</div>
                <div className="text-gray-700">Subjects</div>
              </div>
            </div>

            <div className="text-left bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">Test Includes:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Mathematics (algebra, geometry, statistics)</li>
                <li>• Reading Comprehension (English & Kazakh contexts)</li>
                <li>• Logical Reasoning</li>
                <li>• English Language Skills</li>
              </ul>
            </div>

            <Button 
              onClick={startQuiz}
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
            >
              Start Practice Test
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Quiz Complete!
            </h1>
            
            <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl font-bold text-white">{score}%</span>
            </div>

            <p className="text-lg text-gray-600 mb-8">
              {score >= 80 ? "Excellent work! You're well prepared for the NUET." :
               score >= 60 ? "Good job! Keep practicing to improve your score." :
               "Keep studying! More practice will help you succeed."}
            </p>

            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Detailed Results:</h3>
              <div className="space-y-3">
                {questions.map((q, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-700">Question {index + 1} ({q.subject})</span>
                    <span className={`font-semibold ${
                      selectedAnswers[index] === q.correct ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedAnswers[index] === q.correct ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => {
                  setCurrentQuestion(0);
                  setSelectedAnswers({});
                  setTimeLeft(90 * 60);
                  setShowResults(false);
                  setIsStarted(false);
                }}
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Take Another Test
              </Button>
              <Link to="/">
                <Button variant="outline" size="lg">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation with Timer */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
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
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg">
                <Clock className="w-5 h-5 text-red-600" />
                <span className="font-mono text-red-600 font-semibold">
                  {formatTime(timeLeft)}
                </span>
              </div>
              <Button onClick={submitQuiz} className="bg-green-600 hover:bg-green-700">
                <Flag className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-600">
              {questions[currentQuestion].subject}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {questions[currentQuestion].question}
          </h2>
          
          <div className="space-y-4">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option.charAt(0))}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedAnswers[currentQuestion] === option.charAt(0)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <span className="font-semibold mr-3">{option.charAt(0)})</span>
                {option.substring(3)}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            variant="outline"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                  index === currentQuestion
                    ? 'bg-blue-600 text-white'
                    : selectedAnswers[index]
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <Button
            onClick={() => {
              if (currentQuestion === questions.length - 1) {
                submitQuiz();
              } else {
                setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1));
              }
            }}
          >
            {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
