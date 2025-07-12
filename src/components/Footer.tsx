
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const Footer = () => {
  return (
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
              <a href="https://t.me/chesskasl" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Telegram</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/chesskasl" className="text-gray-400 hover:text-white transition-colors">
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
              <li><Link to="/practice" className="text-gray-400 hover:text-white transition-colors">Practice Tests</Link></li>
              <li><Link to="/study-guides" className="text-gray-400 hover:text-white transition-colors">Study Guides</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">NUET Resources</h4>
            <ul className="space-y-2">
              <li><a href="https://nu.edu.kz" className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Official Website</a></li>
              <li><a href="https://nu.edu.kz/admissions" className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Admission Info</a></li>
              <li><a href="https://nu.edu.kz/academics" className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Programs</a></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About NUET</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2025 NUET Prep. Made with ❤️ for Kazakhstan students.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
