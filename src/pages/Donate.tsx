
import { Link } from 'react-router-dom';
import { BookOpen, Heart, Star, Gift, Home, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Donate = () => {
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
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Support <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">NUET Prep</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Help us keep NUET Prep free and accessible for all Kazakhstan students. 
            Your support directly contributes to improving our platform and helping more students achieve their dreams.
          </p>
        </div>
      </section>

      {/* Why Support Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Your Support Matters</h2>
            <p className="text-lg text-gray-600">Every contribution helps us improve the platform for future students</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">More Content</h3>
              <p className="text-gray-600">
                Add more practice questions, expand subject coverage, and create specialized test sections.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Better Features</h3>
              <p className="text-gray-600">
                Develop advanced analytics, personalized study plans, and mobile app versions.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Free Access</h3>
              <p className="text-gray-600">
                Keep the platform completely free for all students, regardless of their financial situation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Kaspi QR Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Support via Kaspi QR
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Scan the QR code below with your Kaspi app to make a donation. 
              Any amount helps us continue providing free NUET preparation resources.
            </p>
            
            {/* Placeholder for Kaspi QR Code */}
            <div className="w-64 h-64 bg-gradient-to-br from-red-100 to-red-200 rounded-xl mx-auto mb-6 flex items-center justify-center border-2 border-dashed border-red-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <p className="text-red-700 font-medium">Kaspi QR Code</p>
                <p className="text-red-600 text-sm">Upload your QR image here</p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">How to donate:</h3>
              <ol className="text-left text-gray-700 space-y-2">
                <li>1. Open your Kaspi mobile app</li>
                <li>2. Tap "QR" or scan function</li>
                <li>3. Point your camera at the QR code above</li>
                <li>4. Enter your desired donation amount</li>
                <li>5. Complete the payment</li>
              </ol>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                <strong>Alternative:</strong> You can also transfer directly to our Kaspi account
              </p>
              <div className="bg-gray-100 p-4 rounded-lg inline-block">
                <p className="font-mono text-lg font-semibold text-gray-900">+7 777 123 4567</p>
                <p className="text-sm text-gray-600">Account holder: NUET Prep Kazakhstan</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Impact</h2>
            <p className="text-lg text-gray-600">See how donations help improve NUET Prep</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">500₸</div>
              <div className="text-gray-700 text-sm">Covers server costs for 1 day</div>
            </div>
            <div className="bg-green-50 p-6 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">2,000₸</div>
              <div className="text-gray-700 text-sm">Funds development of 10 new questions</div>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">5,000₸</div>
              <div className="text-gray-700 text-sm">Supports 1 week of platform maintenance</div>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">10,000₸</div>
              <div className="text-gray-700 text-sm">Enables major feature development</div>
            </div>
          </div>
        </div>
      </section>

      {/* Thank You Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Thank You for Your Support!
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Every donation, no matter the size, makes a real difference in helping Kazakhstan students 
            prepare for NUET and achieve their dreams of studying at Nazarbayev University.
          </p>
          
          <div className="bg-white/10 p-6 rounded-lg mb-8">
            <p className="text-white font-medium mb-2">
              "Thanks to supporters like you, over 1,000 students have improved their NUET scores!"
            </p>
            <p className="text-blue-100 text-sm">- NUET Prep Team</p>
          </div>
          
          <Link to="/quiz">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
              Start Practicing for Free
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

export default Donate;
