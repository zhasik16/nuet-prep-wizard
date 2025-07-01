
import { Link } from 'react-router-dom';
import { BookOpen, Home, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StudyGuides = () => {
  const studyGuides = [
    {
      title: "NUET Mathematics Guide",
      description: "Complete guide covering algebra, geometry, statistics, and problem-solving strategies",
      topics: ["Algebra & Functions", "Geometry & Measurement", "Statistics & Probability", "Problem Solving"],
      downloadUrl: "#"
    },
    {
      title: "Critical Thinking Mastery",
      description: "Develop logical reasoning and analytical thinking skills for NUET success",
      topics: ["Logical Reasoning", "Pattern Recognition", "Argument Analysis", "Problem Solving"],
      downloadUrl: "#"
    },
    {
      title: "Reading Comprehension Strategies",
      description: "Master text analysis, vocabulary, and reading skills for the NUET",
      topics: ["Reading Strategies", "Vocabulary Building", "Text Analysis", "Comprehension Techniques"],
      downloadUrl: "#"
    },
    {
      title: "English Language Essentials",
      description: "Grammar, vocabulary, and language usage guide for NUET preparation",
      topics: ["Grammar Rules", "Vocabulary", "Writing Skills", "Language Usage"],
      downloadUrl: "#"
    }
  ];

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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Study Guides</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive study materials to help you master every section of the NUET exam.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {studyGuides.map((guide, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{guide.title}</h3>
              <p className="text-gray-600 mb-6">{guide.description}</p>
              
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Topics Covered:</h4>
                <ul className="space-y-2">
                  {guide.topics.map((topic, topicIndex) => (
                    <li key={topicIndex} className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>

              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Download className="w-4 h-4 mr-2" />
                Download Guide (Coming Soon)
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudyGuides;
