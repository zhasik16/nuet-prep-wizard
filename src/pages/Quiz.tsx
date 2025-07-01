import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, Flag, BookOpen, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Quiz = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: string}>({});
  const [timeElapsed, setTimeElapsed] = useState(0); // Timer counting up
  const [showResults, setShowResults] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  // Mock questions - will be replaced with Supabase data
  const testTypes = {
    '1': 'NUET - Mathematics',
    '2': 'NUET - Critical Thinking', 
    '3': 'NUET - Reading Comprehension',
    '4': 'NUET - English Language'
  };

  const currentTestType = testTypes[testId as keyof typeof testTypes] || 'NUET - Practice Test';

  // Generate 30 mock questions based on test type
  const generateQuestions = (type: string) => {
    const questions = [];
    for (let i = 1; i <= 30; i++) {
      let question;
      switch (type) {
        case 'NUET - Mathematics':
          question = {
            id: i,
            subject: "Mathematics",
            question: `If 2x + ${i + 4} = ${i + 12}, what is the value of x?`,
            options: [`A) ${i}`, `B) ${i + 1}`, `C) ${i + 2}`, `D) ${i + 3}`],
            correct: "B",
            explanation: `To solve 2x + ${i + 4} = ${i + 12}, subtract ${i + 4} from both sides: 2x = 8, then divide by 2: x = 4.`
          };
          break;
        case 'NUET - Critical Thinking':
          question = {
            id: i,
            subject: "Critical Thinking",
            question: `If all students study hard, and some hard workers succeed, which conclusion is most logical?`,
            options: [
              "A) All students will succeed",
              "B) Some students might succeed", 
              "C) No students will succeed",
              "D) Only hard workers are students"
            ],
            correct: "B",
            explanation: "This follows logical reasoning. Since all students study hard, and some hard workers succeed, it's logical that some students (who are hard workers) might succeed."
          };
          break;
        case 'NUET - Reading Comprehension':
          question = {
            id: i,
            subject: "Reading Comprehension",
            question: `Based on the passage about Kazakhstan's educational system, what is the primary goal of NUET?`,
            options: [
              "A) To test general knowledge",
              "B) To evaluate critical thinking skills", 
              "C) To assess university readiness",
              "D) To measure English proficiency"
            ],
            correct: "C",
            explanation: "NUET (Nazarbayev University Entrance Test) is designed to assess students' readiness for university-level education, combining various academic skills."
          };
          break;
        default:
          question = {
            id: i,
            subject: "English Language",
            question: `Choose the correct form: 'The research _____ by university students last year was groundbreaking.'`,
            options: [
              "A) was conducted",
              "B) were conducted", 
              "C) has conducted",
              "D) conducting"
            ],
            correct: "A",
            explanation: "The subject 'research' is singular, so we use 'was conducted' (singular past passive voice)."
          };
      }
      questions.push(question);
    }
    return questions;
  };

  const questions = generateQuestions(currentTestType);

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }

    if (isStarted && !showResults) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isStarted, showResults, navigate]);

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
    const results = {
      testType: currentTestType,
      score: calculateScore(),
      timeElapsed,
      answers: selectedAnswers,
      questions,
      totalQuestions: questions.length
    };
    
    // Store results in localStorage (will be replaced with Supabase)
    localStorage.setItem('latestResults', JSON.stringify(results));
    navigate('/results');
  };

  if (!isStarted) {
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
              <Link to="/practice">
                <Button variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Practice Tests
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentTestType}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Get ready to take a comprehensive practice test designed to simulate the actual NUET experience.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">30</div>
                <div className="text-gray-700">Questions</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">∞</div>
                <div className="text-gray-700">Untimed Practice</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-2">1</div>
                <div className="text-gray-700">Subject Area</div>
              </div>
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
                  setTimeElapsed(0);
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
              <div className="text-sm text-gray-600 font-medium">
                {currentTestType}
              </div>
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-mono text-blue-600 font-semibold">
                  {formatTime(timeElapsed)}
                </span>
              </div>
              <Button onClick={submitQuiz} className="bg-green-600 hover:bg-green-700">
                <Flag className="w-4 h-4 mr-2" />
                Finish Test
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
