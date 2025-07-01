
import { Link } from 'react-router-dom';
import { BookOpen, Home, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const FAQ = () => {
  const [openItems, setOpenItems] = useState<{[key: number]: boolean}>({});

  const faqs = [
    {
      question: "What is the NUET?",
      answer: "The Nazarbayev University Entrance Test (NUET) is a comprehensive examination designed to assess students' readiness for university-level education at Nazarbayev University in Kazakhstan."
    },
    {
      question: "What subjects are covered in the NUET?",
      answer: "The NUET covers Mathematics, Critical Thinking, Reading Comprehension, and English Language skills. Each section tests different aspects of academic readiness."
    },
    {
      question: "How long is the actual NUET exam?",
      answer: "The actual NUET exam duration varies, but typically takes around 3-4 hours including breaks. Our practice tests are designed to help you build stamina for the full exam."
    },
    {
      question: "How many questions are on the NUET?",
      answer: "The number of questions varies by section, but our practice tests contain 30 questions each to provide comprehensive preparation for each subject area."
    },
    {
      question: "Is NUET Prep free to use?",
      answer: "Yes! NUET Prep offers free practice tests and study materials. We also accept donations to help maintain and improve the platform."
    },
    {
      question: "How often should I take practice tests?",
      answer: "We recommend taking practice tests regularly - at least 2-3 times per week as you prepare for the NUET. This helps build familiarity with the format and timing."
    },
    {
      question: "Can I retake practice tests?",
      answer: "Absolutely! You can take each practice test multiple times. We encourage retaking tests to track your improvement over time."
    },
    {
      question: "When should I start preparing for the NUET?",
      answer: "We recommend starting your NUET preparation at least 3-6 months before your intended test date to allow adequate time for improvement."
    }
  ];

  const toggleItem = (index: number) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
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

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions about the NUET and our preparation platform.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md">
              <button
                onClick={() => toggleItem(index)}
                className="w-full text-left p-6 flex justify-between items-center hover:bg-gray-50"
              >
                <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                <ChevronDown className={`w-5 h-5 text-gray-500 transform transition-transform ${
                  openItems[index] ? 'rotate-180' : ''
                }`} />
              </button>
              {openItems[index] && (
                <div className="px-6 pb-6">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <Link to="/contact">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
