
import { Link } from 'react-router-dom';
import { BookOpen, Target, Users, Award, ArrowRight, Home, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const About = () => {
  const teamMembers = [
    {
      name: "Educational Team",
      role: "NUET Content Specialists",
      description: "Former NU students and educators who understand the exam inside out"
    },
    {
      name: "Tech Team", 
      role: "Platform Development",
      description: "Experienced developers focused on creating the best learning experience"
    },
    {
      name: "Student Advisory",
      role: "Current NU Students", 
      description: "Active Nazarbayev University students providing real insights"
    }
  ];

  const faqs = [
    {
      question: "What subjects does NUET cover?",
      answer: "The NUET typically includes Mathematics, Reading Comprehension (in both English and Kazakh contexts), Logical Reasoning, and English Language skills. Our platform covers all these areas comprehensively."
    },
    {
      question: "How is NUET scored?",
      answer: "NUET uses a scaled scoring system. Different sections may have different weights, and the final score is used by Nazarbayev University admissions to evaluate candidates alongside other criteria."
    },
    {
      question: "When should I start preparing?",
      answer: "We recommend starting NUET preparation at least 3-6 months before your test date. Consistent daily practice yields the best results."
    },
    {
      question: "Are the practice questions similar to real NUET?",
      answer: "Yes! Our questions are designed by educators familiar with NUET format and difficulty level, ensuring realistic practice experience."
    },
    {
      question: "Is this platform free?",
      answer: "Yes, our core practice tests are completely free. We rely on community support through voluntary donations to maintain and improve the platform."
    }
  ];

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
            
            <div className="flex space-x-4">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Link to="/quiz">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                  Practice Test
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">NUET Prep</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            We're Kazakhstan's premier platform dedicated to helping students excel in the 
            Nazarbayev University Entrance Test and achieve their academic dreams.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 mb-6">
                We believe every talented student in Kazakhstan deserves access to world-class 
                education at Nazarbayev University. Our mission is to democratize NUET preparation 
                by providing high-quality, accessible practice materials and resources.
              </p>
              <p className="text-gray-600 mb-8">
                Founded by educators and NU alumni, we understand the challenges students face 
                when preparing for this crucial exam. That's why we've created a comprehensive 
                platform that simulates the real test experience while providing detailed 
                feedback and progress tracking.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">1000+</div>
                  <div className="text-gray-600 text-sm">Students Helped</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">95%</div>
                  <div className="text-gray-600 text-sm">Success Rate</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Why NUET Prep?</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Realistic practice tests that mirror actual NUET format</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Detailed explanations for every question</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Progress tracking and performance analytics</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Content created by NU alumni and educators</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Completely free for all Kazakhstan students</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Team</h2>
            <p className="text-lg text-gray-600">
              Dedicated professionals committed to your NUET success
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <div className="text-blue-600 font-medium mb-3">{member.role}</div>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about NUET and our platform
            </p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Have More Questions?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            We're here to help you succeed in your NUET preparation journey.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="text-white font-medium">Email Us</div>
              <div className="text-blue-100 text-sm">info@nuetprep.kz</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div className="text-white font-medium">Call Us</div>
              <div className="text-blue-100 text-sm">+7 (777) 123-4567</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="text-white font-medium">Location</div>
              <div className="text-blue-100 text-sm">Almaty, Kazakhstan</div>
            </div>
          </div>
          
          <Link to="/quiz">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
              Start Practicing Now
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

export default About;
