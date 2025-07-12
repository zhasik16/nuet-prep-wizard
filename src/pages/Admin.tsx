
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Users, 
  FileText, 
  Plus, 
  Upload, 
  Save, 
  BarChart3, 
  Settings,
  Image as ImageIcon,
  X,
  LogOut,
  Calculator,
  Brain
} from 'lucide-react';

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // Question form state
  const [questionForm, setQuestionForm] = useState({
    subject: '',
    question: '',
    options: ['A) ', 'B) ', 'C) ', 'D) ', 'E) '],
    correct_answer: '',
    explanation: '',
    difficulty: 'Medium',
    test_type: ''
  });
  
  const [questionImage, setQuestionImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Test creation state
  const [testQuestions, setTestQuestions] = useState<any[]>([]);
  const [currentTestType, setCurrentTestType] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  const handlePasswordSubmit = () => {
    if (password === 'imashzhasco') {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      toast({
        title: "Error",
        description: "Incorrect password",
        variant: "destructive",
      });
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/');
  };

  const fetchStats = async () => {
    try {
      // Get user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      // Get question count
      const { count: questionCount } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true });
      
      setUserCount(userCount || 0);
      setQuestionCount(questionCount || 0);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQuestionImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setQuestionImage(null);
    setImagePreview(null);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const addQuestionToTest = () => {
    if (!questionForm.question || !questionForm.correct_answer || !currentTestType) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newQuestion = {
      ...questionForm,
      test_type: currentTestType,
      id: Date.now().toString()
    };

    setTestQuestions([...testQuestions, newQuestion]);
    
    // Reset form
    setQuestionForm({
      subject: '',
      question: '',
      options: ['A) ', 'B) ', 'C) ', 'D) ', 'E) '],
      correct_answer: '',
      explanation: '',
      difficulty: 'Medium',
      test_type: ''
    });
    setQuestionImage(null);
    setImagePreview(null);

    toast({
      title: "Success",
      description: `Question added to ${currentTestType} test (${testQuestions.length + 1}/30)`,
    });
  };

  const saveTestToDatabase = async () => {
    if (testQuestions.length !== 30) {
      toast({
        title: "Error",
        description: "Please add exactly 30 questions to create a complete test",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const questionsToInsert = testQuestions.map(q => ({
        subject: q.subject,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        test_type: q.test_type
      }));

      const { error } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${currentTestType} test with 30 questions saved successfully!`,
      });

      // Reset test creation
      setTestQuestions([]);
      setCurrentTestType('');
      fetchStats();
    } catch (error) {
      console.error('Error saving test:', error);
      toast({
        title: "Error",
        description: "Failed to save test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startNewTest = (testType: string) => {
    setCurrentTestType(testType);
    setTestQuestions([]);
    setQuestionForm({ ...questionForm, test_type: testType });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            />
            <Button onClick={handlePasswordSubmit} className="w-full">
              Access Admin Panel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">Manage NUET questions and create tests</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="px-4 py-2">
                <Settings className="w-4 h-4 mr-2" />
                Administrator
              </Badge>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registered Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userCount}</div>
              <p className="text-xs text-muted-foreground">Total registered users</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{questionCount}</div>
              <p className="text-xs text-muted-foreground">Questions in database</p>
            </CardContent>
          </Card>
        </div>

        {/* Test Creation Buttons */}
        {!currentTestType && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => startNewTest('NUET - Mathematics')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  Create Mathematics Test
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Create a new mathematics test with 30 questions</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => startNewTest('NUET - Critical Thinking')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Create Critical Thinking Test
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Create a new critical thinking test with 30 questions</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Test Creation Progress */}
        {currentTestType && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Creating: {currentTestType}</span>
                <Badge variant="outline">{testQuestions.length}/30 Questions</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="w-full bg-gray-200 rounded-full h-2 mr-4">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(testQuestions.length / 30) * 100}%` }}
                  ></div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={saveTestToDatabase} 
                    disabled={testQuestions.length !== 30 || loading}
                    className="whitespace-nowrap"
                  >
                    Save Test
                  </Button>
                  <Button 
                    onClick={() => {
                      setCurrentTestType('');
                      setTestQuestions([]);
                    }} 
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Form */}
        {currentTestType && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Question to {currentTestType}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={questionForm.subject}
                    onChange={(e) => setQuestionForm({ ...questionForm, subject: e.target.value })}
                    placeholder="e.g., Algebra, Geometry, Logic"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="question">Question *</Label>
                  <Textarea
                    id="question"
                    value={questionForm.question}
                    onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                    placeholder="Enter the question text"
                    rows={3}
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <Label>Question Image (Optional)</Label>
                  <div className="mt-2">
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img 
                          src={imagePreview} 
                          alt="Question" 
                          className="max-w-xs max-h-48 rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeImage}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4">
                          <Label htmlFor="image-upload" className="cursor-pointer">
                            <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                              Upload an image
                            </span>
                            <Input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </Label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Options */}
                <div>
                  <Label>Answer Options *</Label>
                  <div className="space-y-2 mt-2">
                    {questionForm.options.map((option, index) => (
                      <Input
                        key={index}
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        required
                      />
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="correct_answer">Correct Answer *</Label>
                    <Select value={questionForm.correct_answer} onValueChange={(value) => setQuestionForm({ ...questionForm, correct_answer: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select correct answer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                        <SelectItem value="E">E</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={questionForm.difficulty} onValueChange={(value) => setQuestionForm({ ...questionForm, difficulty: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="explanation">Explanation *</Label>
                  <Textarea
                    id="explanation"
                    value={questionForm.explanation}
                    onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                    placeholder="Explain why this is the correct answer"
                    rows={3}
                    required
                  />
                </div>

                <Button onClick={addQuestionToTest} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question to Test ({testQuestions.length}/30)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics Tab for when not creating tests */}
        {!currentTestType && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                System Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{userCount}</div>
                  <div className="text-gray-600">Registered Users</div>
                  <div className="text-sm text-gray-500 mt-1">Total user accounts created</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">{questionCount}</div>
                  <div className="text-gray-600">Questions Available</div>
                  <div className="text-sm text-gray-500 mt-1">Total questions in database</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Admin;
