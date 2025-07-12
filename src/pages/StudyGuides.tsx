
import { Link } from 'react-router-dom';
import { BookOpen, Home, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StudyGuides = () => {
  const studyGuides = [
    {
      title: "NUET Mathematics Guide",
      description: "Official mathematics specification guide covering algebra, geometry, statistics, and problem-solving strategies for NUET preparation",
      topics: ["Algebra & Functions", "Geometry & Measurement", "Statistics & Probability", "Problem Solving"],
      downloadUrl: "https://admissions.nu.edu.kz/wps/wcm/connect/a8fa719c-8bb7-4611-a8d0-a3cbc01728a5/MATHEMATICS+Specification+NUFYP+SET+2017+v1.0.pdf?MOD=AJPERES"
    },
    {
      title: "Critical Thinking Mastery",
      description: "Official thinking skills specification guide for developing logical reasoning and analytical thinking skills for NUET success",
      topics: ["Logical Reasoning", "Pattern Recognition", "Argument Analysis", "Problem Solving"],
      downloadUrl: "https://admissions.nu.edu.kz/wps/wcm/connect/c9057198-363e-4ba7-ab50-b03a793863e4/THINKING+SKILLS+SPECIFICATION.pdf?MOD=AJPERES"
    }
  ];

  const handleDownload = (url: string, title: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = `${title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            Official study materials and specifications to help you master every section of the NUET exam.
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

              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => handleDownload(guide.downloadUrl, guide.title)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Official PDF Guide
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Additional Resources</h3>
            <p className="text-gray-600 mb-6">
              These are the official specification documents from Nazarbayev University. 
              Make sure to review them thoroughly as they contain the exact topics and format you'll encounter on the NUET exam.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/practice">
                <Button variant="outline" className="w-full sm:w-auto">
                  Practice Questions
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" className="w-full sm:w-auto">
                  Learn More About NUET
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyGuides;
