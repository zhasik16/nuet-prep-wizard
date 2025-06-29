
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
              <Link to="/quiz" className="text-gray-700 hover:text-blue-600 transition-colors">Practice</Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-colors">About</Link>
              <Link to="/donate" className="text-gray-700 hover:text-blue-600 transition-colors">Support</Link>
            </div>

            <div className="hidden md:flex space-x-4">
              <Link to="/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
              <Link to="/quiz">
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
              <Link to="/quiz" className="block text-gray-700 hover:text-blue-600">Practice</Link>
              <Link to="/about" className="block text-gray-700 hover:text-blue-600">About</Link>
              <Link to="/donate" className="block text-gray-700 hover:text-blue-600">Support</Link>
              <div className="flex space-x-4 pt-4">
                <Link to="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/quiz">
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
              <Link to="/quiz">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg">
                  <Play className="w-5 h-5 mr-2" />
                  Start Free Practice
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
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
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Excel in Your NUET?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Join thousands of students who have improved their scores with our comprehensive practice platform.
          </p>
          <Link to="/quiz">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
              Begin Your Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">NUET Prep</span>
              </div>
              <p className="text-gray-400">
                Kazakhstan's premier NUET preparation platform for Nazarbayev University aspirants.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/quiz" className="hover:text-white transition-colors">Practice Tests</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/donate" className="hover:text-white transition-colors">Support Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Study Guides</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">About NU</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="https://nu.edu.kz" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Official Website</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Admission Info</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Programs</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 NUET Prep. Built for Kazakhstan students aspiring to join Nazarbayev University.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
