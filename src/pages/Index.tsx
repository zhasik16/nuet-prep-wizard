
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, BookOpen, Users, TrendingUp, ArrowRight, Menu, X, Star, Award, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      });
    });

    document.querySelectorAll('.fade-in-section').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: "NUET-Focused Content",
      description: "Practice questions specifically designed for Nazarbayev University entrance requirements"
    },
    {
      icon: <BookOpen className="w-8 h-8 text-green-600" />,
      title: "Comprehensive Subjects",
      description: "Math, Reading, Kazakh/English, and Logic sections with detailed explanations"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-purple-600" />,
      title: "Track Progress",
      description: "Monitor your improvement with detailed analytics and performance insights"
    },
    {
      icon: <Award className="w-8 h-8 text-orange-600" />,
      title: "Realistic Practice",
      description: "Full-length practice tests that simulate the actual NUET exam experience"
    }
  ];

  const stats = [
    { number: "5000+", label: "Practice Questions" },
    { number: "95%", label: "Success Rate" },
    { number: "1000+", label: "Students Helped" },
    { number: "24/7", label: "Study Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NUET Prep
              </span>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">Home</Link>
              <Link to="/practice" className="text-gray-700 hover:text-blue-600 transition-colors">Practice</Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-colors">About</Link>
              <Link to="/donate" className="text-gray-700 hover:text-blue-600 transition-colors">Support</Link>
            </div>

            <div className="hidden md:flex space-x-4">
              <Link to="/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link to="/practice">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Start Practice
                </Button>
              </Link>
            </div>

            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-4">
              <Link to="/" className="block text-gray-700 hover:text-blue-600">Home</Link>
              <Link to="/practice" className="block text-gray-700 hover:text-blue-600">Practice</Link>
              <Link to="/about" className="block text-gray-700 hover:text-blue-600">About</Link>
              <Link to="/donate" className="block text-gray-700 hover:text-blue-600">Support</Link>
              <div className="flex space-x-4 pt-4">
                <Link to="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/practice">
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                    Start Practice
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Master the{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NUET
              </span>
              <br />
              with AI-Powered Prep
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Prepare for Nazarbayev University Entrance Test with Kazakhstan's most advanced 
              preparation platform. Practice with real NUET-style questions and track your progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/practice">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg">
                  <Play className="w-5 h-5 mr-2" />
                  Start Free Practice
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900">
                  Learn More
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center fade-in-section">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in-section">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose NUET Prep?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform is specifically designed for Kazakhstan students preparing for 
              Nazarbayev University entrance requirements.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 fade-in-section">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your NUET Preparation?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students who are already preparing with NUET Prep
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/practice">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                Start Practice Tests
              </Button>
            </Link>
            <Link to="/about">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">NUET Prep</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Your comprehensive platform for Nazarbayev University Entrance Test preparation. 
                Practice with real exam-style questions and track your progress.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Telegram</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C8.396 0 8.002.01 6.78.048 2.195.206.206 2.195.048 6.78.01 8.002 0 8.396 0 12.017c0 3.62.01 4.015.048 5.237.158 4.585 2.147 6.574 6.732 6.732 1.222.038 1.617.048 5.237.048 3.62 0 4.015-.01 5.237-.048 4.58-.158 6.57-2.147 6.728-6.732.038-1.222.048-1.617.048-5.237 0-3.62-.01-4.015-.048-5.237C23.834 2.195 21.845.206 17.254.048 16.035.01 15.64 0 12.017 0zm0 2.17c3.557 0 3.978.01 5.38.048 3.508.158 5.244 1.926 5.402 5.402.038 1.4.048 1.823.048 5.38 0 3.558-.01 3.98-.048 5.402-.158 3.476-1.894 5.244-5.402 5.402-1.4.038-1.823.048-5.38.048-3.558 0-3.98-.01-5.402-.048-3.508-.158-5.244-1.926-5.402-5.402-.038-1.4-.048-1.823-.048-5.38 0-3.558.01-3.98.048-5.402.158-3.476 1.894-5.244 5.402-5.402 1.4-.038 1.823-.048 5.402-.048zm0 3.68c-3.558 0-6.407 2.849-6.407 6.407S8.459 18.664 12.017 18.664s6.407-2.849 6.407-6.407S15.575 5.85 12.017 5.85zm0 10.565c-2.298 0-4.158-1.86-4.158-4.158 0-2.298 1.86-4.158 4.158-4.158 2.298 0 4.158 1.86 4.158 4.158 0 2.298-1.86 4.158-4.158 4.158zM19.846 5.595c0 .83-.671 1.5-1.5 1.5-.83 0-1.5-.67-1.5-1.5 0-.83.67-1.5 1.5-1.5.829 0 1.5.67 1.5 1.5z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/practice" className="text-gray-400 hover:text-white">Practice Tests</Link></li>
                <li><Link to="/study-guides" className="text-gray-400 hover:text-white">Study Guides</Link></li>
                <li><Link to="/faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">NUET Resources</h4>
              <ul className="space-y-2">
                <li><a href="https://nu.edu.kz" className="text-gray-400 hover:text-white" target="_blank" rel="noopener noreferrer">Official Website</a></li>
                <li><a href="https://nu.edu.kz/admissions" className="text-gray-400 hover:text-white" target="_blank" rel="noopener noreferrer">Admission Info</a></li>
                <li><a href="https://nu.edu.kz/academics" className="text-gray-400 hover:text-white" target="_blank" rel="noopener noreferrer">Programs</a></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white">About NUET</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 NUET Prep. Made with ❤️ for Kazakhstan students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
