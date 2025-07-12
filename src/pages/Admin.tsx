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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Brain,
  Edit,
  Trash2,
  Eye,
  Search
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

  // Test management state
  const [existingTests, setExistingTests] = useState<any[]>([]);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTestType, setFilterTestType] = useState('all');

  // Edit question image state
  const [editQuestionImage, setEditQuestionImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchExistingTests();
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
      // Get actual registered users count from auth system
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error fetching auth users:', authError);
        // Fallback: try to get count from profiles table
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id');
        
        if (!profilesError && profilesData) {
          setUserCount(profilesData.length);
        } else {
          // Second fallback: get unique user IDs from quiz attempts
          const { data: attemptsData } = await supabase
            .from('quiz_attempts')
            .select('user_id');
          
          const uniqueUsers = new Set(attemptsData?.map(attempt => attempt.user_id).filter(Boolean));
          setUserCount(uniqueUsers.size);
        }
      } else {
        setUserCount(authUsers.users?.length || 0);
      }
      
      // Get question count
      const { count: questionCount } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true });
      
      setQuestionCount(questionCount || 0);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Final fallback: try profiles table count
      try {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id');
        setUserCount(profilesData?.length || 0);
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        setUserCount(0);
      }
    }
  };

  const fetchExistingTests = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group questions by test_type
      const groupedTests = data?.reduce((acc: any, question: any) => {
        if (!acc[question.test_type]) {
          acc[question.test_type] = {
            test_type: question.test_type,
            questions: [],
            total_questions: 0
          };
        }
        acc[question.test_type].questions.push(question);
        acc[question.test_type].total_questions++;
        return acc;
      }, {});

      setExistingTests(Object.values(groupedTests || {}));
    } catch (error) {
      console.error('Error fetching existing tests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch existing tests",
        variant: "destructive",
      });
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

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditQuestionImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setQuestionImage(null);
    setImagePreview(null);
  };

  const removeEditImage = () => {
    setEditQuestionImage(null);
    setEditImagePreview(null);
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
      fetchExistingTests();
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

  const deleteQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question deleted successfully",
      });

      fetchExistingTests();
      fetchStats();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const deleteEntireTest = async (testType: string) => {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('test_type', testType);

      if (error) throw error;

      toast({
        title: "Success",
        description: `All questions for ${testType} deleted successfully`,
      });

      fetchExistingTests();
      fetchStats();
    } catch (error) {
      console.error('Error deleting test:', error);
      toast({
        title: "Error",
        description: "Failed to delete test",
        variant: "destructive",
      });
    }
  };

  const updateQuestion = async (updatedQuestion: any) => {
    try {
      const { error } = await supabase
        .from('questions')
        .update({
          subject: updatedQuestion.subject,
          question: updatedQuestion.question,
          options: updatedQuestion.options,
          correct_answer: updatedQuestion.correct_answer,
          explanation: updatedQuestion.explanation,
          difficulty: updatedQuestion.difficulty
        })
        .eq('id', updatedQuestion.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question updated successfully",
      });

      setEditingQuestion(null);
      setEditQuestionImage(null);
      setEditImagePreview(null);
      fetchExistingTests();
    } catch (error) {
      console.error('Error updating question:', error);
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive",
      });
    }
  };

  const filteredTests = existingTests.filter(test => {
    const matchesSearch = test.test_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterTestType === 'all' || test.test_type === filterTestType;
    return matchesSearch && matchesFilter;
  });

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
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview & Create</TabsTrigger>
            <TabsTrigger value="manage">Manage Tests</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 gap-6">
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
              <div className="grid md:grid-cols-2 gap-6">
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
              <Card>
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
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle>Test Management</CardTitle>
                <div className="flex gap-4 mt-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search tests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterTestType} onValueChange={setFilterTestType}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Test Types</SelectItem>
                      <SelectItem value="NUET - Mathematics">Mathematics</SelectItem>
                      <SelectItem value="NUET - Critical Thinking">Critical Thinking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
            </Card>

            {/* Existing Tests */}
            <div className="grid gap-6">
              {filteredTests.map((test) => (
                <Card key={test.test_type}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {test.test_type.includes('Mathematics') ? (
                          <Calculator className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Brain className="w-5 h-5 text-purple-600" />
                        )}
                        {test.test_type}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{test.total_questions} Questions</Badge>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedTest(test)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Questions
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{test.test_type} - Questions</DialogTitle>
                              <DialogDescription>
                                Manage all questions for this test
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {test.questions.map((question: any, index: number) => (
                                <Card key={question.id} className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="secondary">Q{index + 1}</Badge>
                                        <Badge variant="outline">{question.subject}</Badge>
                                        <Badge className={
                                          question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                          question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-red-100 text-red-800'
                                        }>
                                          {question.difficulty}
                                        </Badge>
                                      </div>
                                      <p className="font-medium">{question.question}</p>
                                      <div className="space-y-1">
                                        {question.options.map((option: string, optIndex: number) => (
                                          <div key={optIndex} className={`text-sm ${
                                            String.fromCharCode(65 + optIndex) === question.correct_answer 
                                              ? 'text-green-600 font-medium' 
                                              : 'text-gray-600'
                                          }`}>
                                            {option}
                                          </div>
                                        ))}
                                      </div>
                                      <p className="text-sm text-gray-600">
                                        <strong>Explanation:</strong> {question.explanation}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditingQuestion(question)}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                          if (confirm('Are you sure you want to delete this question?')) {
                                            deleteQuestion(question.id);
                                          }
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete all questions for ${test.test_type}? This action cannot be undone.`)) {
                              deleteEntireTest(test.test_type);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Test
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      This test contains {test.total_questions} questions covering various topics.
                    </p>
                  </CardContent>
                </Card>
              ))}

              {filteredTests.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No tests found matching your criteria.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="statistics">
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
          </TabsContent>
        </Tabs>

        {/* Edit Question Dialog with Image Upload */}
        {editingQuestion && (
          <Dialog open={!!editingQuestion} onOpenChange={() => {
            setEditingQuestion(null);
            setEditQuestionImage(null);
            setEditImagePreview(null);
          }}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Question</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Subject</Label>
                  <Input
                    value={editingQuestion.subject}
                    onChange={(e) => setEditingQuestion({...editingQuestion, subject: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Question</Label>
                  <Textarea
                    value={editingQuestion.question}
                    onChange={(e) => setEditingQuestion({...editingQuestion, question: e.target.value})}
                    rows={3}
                  />
                </div>

                {/* Image Upload Section for Edit */}
                <div>
                  <Label>Question Image (Optional)</Label>
                  <div className="mt-2">
                    {editImagePreview ? (
                      <div className="relative inline-block">
                        <img 
                          src={editImagePreview} 
                          alt="Question" 
                          className="max-w-xs max-h-48 rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeEditImage}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4">
                          <Label htmlFor="edit-image-upload" className="cursor-pointer">
                            <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                              Upload an image
                            </span>
                            <Input
                              id="edit-image-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleEditImageUpload}
                              className="hidden"
                            />
                          </Label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Options</Label>
                  <div className="space-y-2">
                    {editingQuestion.options.map((option: string, index: number) => (
                      <Input
                        key={index}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...editingQuestion.options];
                          newOptions[index] = e.target.value;
                          setEditingQuestion({...editingQuestion, options: newOptions});
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Correct Answer</Label>
                    <Select 
                      value={editingQuestion.correct_answer} 
                      onValueChange={(value) => setEditingQuestion({...editingQuestion, correct_answer: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                    <Label>Difficulty</Label>
                    <Select 
                      value={editingQuestion.difficulty} 
                      onValueChange={(value) => setEditingQuestion({...editingQuestion, difficulty: value})}
                    >
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
                  <Label>Explanation</Label>
                  <Textarea
                    value={editingQuestion.explanation}
                    onChange={(e) => setEditingQuestion({...editingQuestion, explanation: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setEditingQuestion(null);
                    setEditQuestionImage(null);
                    setEditImagePreview(null);
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={() => updateQuestion(editingQuestion)}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Admin;
