
-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table for storing NUET practice questions
CREATE TABLE public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL, -- 'Mathematics', 'Critical Thinking', 'Reading Comprehension', 'English Language'
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of 4 options [A, B, C, D]
  correct_answer TEXT NOT NULL, -- 'A', 'B', 'C', or 'D'
  explanation TEXT NOT NULL,
  difficulty TEXT DEFAULT 'Medium', -- 'Easy', 'Medium', 'Hard'
  test_type TEXT NOT NULL, -- 'NUET - Mathematics', 'NUET - Critical Thinking', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_attempts table for storing user quiz results
CREATE TABLE public.quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_elapsed INTEGER NOT NULL, -- in seconds
  answers JSONB NOT NULL, -- user's answers {question_index: selected_option}
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for questions (public read access for practice)
CREATE POLICY "Anyone can view questions" ON public.questions
  FOR SELECT USING (true);

-- Create policies for quiz_attempts
CREATE POLICY "Users can view own quiz attempts" ON public.quiz_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts" ON public.quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert sample questions for each subject
-- Mathematics questions
INSERT INTO public.questions (subject, question, options, correct_answer, explanation, test_type) VALUES
('Mathematics', 'If 2x + 8 = 16, what is the value of x?', '["A) 2", "B) 4", "C) 6", "D) 8"]'::jsonb, 'B', 'To solve 2x + 8 = 16, subtract 8 from both sides: 2x = 8, then divide by 2: x = 4.', 'NUET - Mathematics'),
('Mathematics', 'What is 15% of 200?', '["A) 25", "B) 30", "C) 35", "D) 40"]'::jsonb, 'B', '15% of 200 = 0.15 × 200 = 30.', 'NUET - Mathematics'),
('Mathematics', 'If a triangle has angles of 45° and 65°, what is the third angle?', '["A) 60°", "B) 70°", "C) 80°", "D) 90°"]'::jsonb, 'B', 'The sum of angles in a triangle is 180°. So 180° - 45° - 65° = 70°.', 'NUET - Mathematics'),
('Mathematics', 'Solve for y: 3y - 12 = 21', '["A) 9", "B) 11", "C) 13", "D) 15"]'::jsonb, 'B', '3y - 12 = 21. Add 12: 3y = 33. Divide by 3: y = 11.', 'NUET - Mathematics'),
('Mathematics', 'What is the area of a rectangle with length 8 and width 5?', '["A) 13", "B) 26", "C) 40", "D) 45"]'::jsonb, 'C', 'Area of rectangle = length × width = 8 × 5 = 40.', 'NUET - Mathematics'),
('Mathematics', 'What is 25% of 80?', '["A) 15", "B) 20", "C) 25", "D) 30"]'::jsonb, 'B', '25% of 80 = 0.25 × 80 = 20.', 'NUET - Mathematics'),
('Mathematics', 'If 3x - 6 = 15, what is x?', '["A) 5", "B) 6", "C) 7", "D) 8"]'::jsonb, 'C', '3x - 6 = 15. Add 6: 3x = 21. Divide by 3: x = 7.', 'NUET - Mathematics'),
('Mathematics', 'What is the perimeter of a square with side length 6?', '["A) 12", "B) 18", "C) 24", "D) 36"]'::jsonb, 'C', 'Perimeter of square = 4 × side length = 4 × 6 = 24.', 'NUET - Mathematics'),
('Mathematics', 'Solve: 2(x + 3) = 14', '["A) 2", "B) 3", "C) 4", "D) 5"]'::jsonb, 'C', '2(x + 3) = 14. Divide by 2: x + 3 = 7. Subtract 3: x = 4.', 'NUET - Mathematics'),
('Mathematics', 'What is 12 × 15?', '["A) 160", "B) 170", "C) 180", "D) 190"]'::jsonb, 'C', '12 × 15 = 180.', 'NUET - Mathematics');

-- Add more Mathematics questions
INSERT INTO public.questions (subject, question, options, correct_answer, explanation, test_type) VALUES
('Mathematics', 'What is the square root of 144?', '["A) 10", "B) 11", "C) 12", "D) 13"]'::jsonb, 'C', '√144 = 12 because 12² = 144.', 'NUET - Mathematics'),
('Mathematics', 'If a circle has radius 5, what is its area? (Use π ≈ 3.14)', '["A) 78.5", "B) 75.5", "C) 82.5", "D) 85.5"]'::jsonb, 'A', 'Area = πr² = 3.14 × 5² = 3.14 × 25 = 78.5.', 'NUET - Mathematics'),
('Mathematics', 'What is 7! (7 factorial)?', '["A) 5040", "B) 5000", "C) 4800", "D) 4500"]'::jsonb, 'A', '7! = 7 × 6 × 5 × 4 × 3 × 2 × 1 = 5040.', 'NUET - Mathematics'),
('Mathematics', 'Solve: |x - 3| = 5', '["A) x = 8 only", "B) x = -2 only", "C) x = 8 or x = -2", "D) x = 2 or x = 8"]'::jsonb, 'C', '|x - 3| = 5 means x - 3 = 5 or x - 3 = -5, so x = 8 or x = -2.', 'NUET - Mathematics'),
('Mathematics', 'What is the slope of the line passing through (2,3) and (4,7)?', '["A) 1", "B) 2", "C) 3", "D) 4"]'::jsonb, 'B', 'Slope = (y₂-y₁)/(x₂-x₁) = (7-3)/(4-2) = 4/2 = 2.', 'NUET - Mathematics'),
('Mathematics', 'If log₂(x) = 4, what is x?', '["A) 8", "B) 12", "C) 16", "D) 20"]'::jsonb, 'C', 'log₂(x) = 4 means 2⁴ = x, so x = 16.', 'NUET - Mathematics'),
('Mathematics', 'What is the sum of interior angles of a pentagon?', '["A) 360°", "B) 540°", "C) 720°", "D) 900°"]'::jsonb, 'B', 'Sum = (n-2) × 180° = (5-2) × 180° = 3 × 180° = 540°.', 'NUET - Mathematics'),
('Mathematics', 'Solve the quadratic: x² - 5x + 6 = 0', '["A) x = 2, 3", "B) x = 1, 6", "C) x = 2, 4", "D) x = 1, 5"]'::jsonb, 'A', 'Factoring: (x-2)(x-3) = 0, so x = 2 or x = 3.', 'NUET - Mathematics'),
('Mathematics', 'What is sin(30°)?', '["A) 1/2", "B) √2/2", "C) √3/2", "D) 1"]'::jsonb, 'A', 'sin(30°) = 1/2.', 'NUET - Mathematics'),
('Mathematics', 'If f(x) = 2x + 3, what is f(4)?', '["A) 9", "B) 10", "C) 11", "D) 12"]'::jsonb, 'C', 'f(4) = 2(4) + 3 = 8 + 3 = 11.', 'NUET - Mathematics');

-- Continue with more math questions to reach 30
INSERT INTO public.questions (subject, question, options, correct_answer, explanation, test_type) VALUES
('Mathematics', 'What is the median of {2, 5, 8, 11, 14}?', '["A) 5", "B) 8", "C) 11", "D) 9"]'::jsonb, 'B', 'The median is the middle value when arranged in order: 8.', 'NUET - Mathematics'),
('Mathematics', 'Convert 0.75 to a fraction in lowest terms', '["A) 3/4", "B) 75/100", "C) 15/20", "D) 6/8"]'::jsonb, 'A', '0.75 = 75/100 = 3/4 (dividing by 25).', 'NUET - Mathematics'),
('Mathematics', 'What is 2³ × 2⁴?', '["A) 2⁷", "B) 2¹²", "C) 4⁷", "D) 4¹²"]'::jsonb, 'A', 'When multiplying powers with same base, add exponents: 2³ × 2⁴ = 2⁷.', 'NUET - Mathematics'),
('Mathematics', 'What is the volume of a cube with side length 4?', '["A) 16", "B) 48", "C) 64", "D) 96"]'::jsonb, 'C', 'Volume of cube = side³ = 4³ = 64.', 'NUET - Mathematics'),
('Mathematics', 'Simplify: 3x + 2x - x', '["A) 4x", "B) 5x", "C) 6x", "D) 3x"]'::jsonb, 'A', '3x + 2x - x = (3 + 2 - 1)x = 4x.', 'NUET - Mathematics'),
('Mathematics', 'What is the GCD of 18 and 24?', '["A) 3", "B) 6", "C) 9", "D) 12"]'::jsonb, 'B', 'Factors of 18: 1,2,3,6,9,18. Factors of 24: 1,2,3,4,6,8,12,24. GCD = 6.', 'NUET - Mathematics'),
('Mathematics', 'If a = 3 and b = 4, what is a² + b²?', '["A) 25", "B) 24", "C) 23", "D) 49"]'::jsonb, 'A', 'a² + b² = 3² + 4² = 9 + 16 = 25.', 'NUET - Mathematics'),
('Mathematics', 'What is 40% of 250?', '["A) 90", "B) 100", "C) 110", "D) 120"]'::jsonb, 'B', '40% of 250 = 0.40 × 250 = 100.', 'NUET - Mathematics'),
('Mathematics', 'Solve: 4x + 8 = 28', '["A) 4", "B) 5", "C) 6", "D) 7"]'::jsonb, 'B', '4x + 8 = 28. Subtract 8: 4x = 20. Divide by 4: x = 5.', 'NUET - Mathematics'),
('Mathematics', 'What is the distance between points (0,0) and (3,4)?', '["A) 5", "B) 6", "C) 7", "D) 8"]'::jsonb, 'A', 'Distance = √[(3-0)² + (4-0)²] = √[9 + 16] = √25 = 5.', 'NUET - Mathematics');

-- Critical Thinking questions
INSERT INTO public.questions (subject, question, options, correct_answer, explanation, test_type) VALUES
('Critical Thinking', 'All students study hard. Some hard workers succeed. Which conclusion is most logical?', '["A) All students will succeed", "B) Some students might succeed", "C) No students will succeed", "D) Only hard workers are students"]'::jsonb, 'B', 'Since all students study hard, and some hard workers succeed, it follows logically that some students (who are hard workers) might succeed.', 'NUET - Critical Thinking'),
('Critical Thinking', 'If it rains, then the ground gets wet. The ground is wet. What can we conclude?', '["A) It rained", "B) It might have rained", "C) It did not rain", "D) We cannot determine if it rained"]'::jsonb, 'D', 'This is the logical fallacy of affirming the consequent. The ground could be wet for other reasons (sprinkler, flood, etc.).', 'NUET - Critical Thinking'),
('Critical Thinking', 'Which number comes next in the sequence: 2, 6, 18, 54, ?', '["A) 108", "B) 162", "C) 216", "D) 324"]'::jsonb, 'B', 'Each number is multiplied by 3: 2×3=6, 6×3=18, 18×3=54, 54×3=162.', 'NUET - Critical Thinking'),
('Critical Thinking', 'If all birds can fly and penguins are birds, what can we conclude about penguins?', '["A) Penguins can fly", "B) The first statement is false", "C) Penguins are not birds", "D) Both A and B"]'::jsonb, 'B', 'Since we know penguins cannot fly, the premise that all birds can fly must be false.', 'NUET - Critical Thinking'),
('Critical Thinking', 'Complete the pattern: A1, C3, E5, G7, ?', '["A) H8", "B) I9", "C) J10", "D) K11"]'::jsonb, 'B', 'Letters skip one (A, C, E, G, I) and numbers increase by 2 (1, 3, 5, 7, 9).', 'NUET - Critical Thinking');

-- Add more Critical Thinking questions to reach 30
INSERT INTO public.questions (subject, question, options, correct_answer, explanation, test_type) VALUES
('Critical Thinking', 'If some cats are dogs, and all dogs are animals, then some cats are animals.', '["A) True", "B) False", "C) Cannot be determined", "D) Invalid logic"]'::jsonb, 'A', 'This follows valid logical reasoning through transitivity.', 'NUET - Critical Thinking'),
('Critical Thinking', 'What comes next: 1, 4, 9, 16, 25, ?', '["A) 30", "B) 35", "C) 36", "D) 49"]'::jsonb, 'C', 'These are perfect squares: 1², 2², 3², 4², 5², 6² = 36.', 'NUET - Critical Thinking'),
('Critical Thinking', 'If today is Monday, what day was it 100 days ago?', '["A) Monday", "B) Tuesday", "C) Saturday", "D) Sunday"]'::jsonb, 'C', '100 ÷ 7 = 14 remainder 2. So 2 days before Monday is Saturday.', 'NUET - Critical Thinking'),
('Critical Thinking', 'Which word does not belong: Apple, Orange, Carrot, Banana?', '["A) Apple", "B) Orange", "C) Carrot", "D) Banana"]'::jsonb, 'C', 'Carrot is a vegetable, while the others are fruits.', 'NUET - Critical Thinking'),
('Critical Thinking', 'If A > B and B > C, then:', '["A) A = C", "B) A < C", "C) A > C", "D) Cannot determine"]'::jsonb, 'C', 'By transitivity, if A > B and B > C, then A > C.', 'NUET - Critical Thinking'),
('Critical Thinking', 'What is the missing number: 2, 5, 11, 23, 47, ?', '["A) 90", "B) 95", "C) 94", "D) 96"]'::jsonb, 'B', 'Each number is (previous × 2) + 1: 2→5→11→23→47→95.', 'NUET - Critical Thinking'),
('Critical Thinking', 'If some teachers are scientists, and no scientists are artists, then:', '["A) Some teachers are artists", "B) No teachers are artists", "C) Some teachers are not artists", "D) All teachers are artists"]'::jsonb, 'C', 'Some teachers (who are scientists) cannot be artists, so some teachers are not artists.', 'NUET - Critical Thinking'),
('Critical Thinking', 'Mirror image of "AMBULANCE" is:', '["A) ECNALUBMA", "B) AMBULANCE", "C) ƎƆИA⅃UᙠMΛ", "D) ƎƆИA⅃UᙠMΛ"]'::jsonb, 'A', 'Mirror image reverses the order of letters: AMBULANCE → ECNALUBMA.', 'NUET - Critical Thinking'),
('Critical Thinking', 'If the code for CAT is 3120, what is the code for DOG?', '["A) 4715", "B) 4157", "C) 4175", "D) 4751"]'::jsonb, 'A', 'C=3, A=1, T=20 (position in alphabet). D=4, O=15, G=7, so DOG = 4157.', 'NUET - Critical Thinking'),
('Critical Thinking', 'Choose the odd one: 8, 27, 64, 125, 216, 343, 500', '["A) 8", "B) 27", "C) 125", "D) 500"]'::jsonb, 'D', 'All are perfect cubes except 500: 2³=8, 3³=27, 4³=64, 5³=125, 6³=216, 7³=343.', 'NUET - Critical Thinking');

-- Continue with more Critical Thinking questions
INSERT INTO public.questions (subject, question, options, correct_answer, explanation, test_type) VALUES
('Critical Thinking', 'If 5 machines make 5 widgets in 5 minutes, how long for 100 machines to make 100 widgets?', '["A) 5 minutes", "B) 20 minutes", "C) 100 minutes", "D) 500 minutes"]'::jsonb, 'A', 'Each machine makes 1 widget in 5 minutes. 100 machines make 100 widgets in 5 minutes.', 'NUET - Critical Thinking'),
('Critical Thinking', 'What letter comes next: A, D, G, J, M, ?', '["A) N", "B) O", "C) P", "D) Q"]'::jsonb, 'C', 'Letters skip 2 positions: A(+3)D(+3)G(+3)J(+3)M(+3)P.', 'NUET - Critical Thinking'),
('Critical Thinking', 'If all roses are flowers, and some flowers are red, then:', '["A) All roses are red", "B) Some roses are red", "C) No roses are red", "D) Cannot be determined"]'::jsonb, 'D', 'We cannot determine if any roses are red from the given information.', 'NUET - Critical Thinking'),
('Critical Thinking', 'Complete: 1, 1, 2, 3, 5, 8, 13, ?', '["A) 18", "B) 19", "C) 20", "D) 21"]'::jsonb, 'D', 'Fibonacci sequence: each number is sum of previous two: 8 + 13 = 21.', 'NUET - Critical Thinking'),
('Critical Thinking', 'If FRIEND is coded as GSJFOE, how is ENEMY coded?', '["A) FOFNZ", "B) FGONZ", "C) FOFMZ", "D) FGFNZ"]'::jsonb, 'A', 'Each letter is shifted by +1: E→F, N→O, E→F, M→N, Y→Z = FOFNZ.', 'NUET - Critical Thinking'),
('Critical Thinking', 'Water is to ice as milk is to:', '["A) Cream", "B) Butter", "C) Cheese", "D) Yogurt"]'::jsonb, 'C', 'Water freezes to ice; milk is processed to cheese (solid form).', 'NUET - Critical Thinking'),
('Critical Thinking', 'If you rearrange CINEMA, you get:', '["A) ANEMIC", "B) ICEMAN", "C) MANIAC", "D) All of the above"]'::jsonb, 'A', 'CINEMA can be rearranged to spell ANEMIC.', 'NUET - Critical Thinking'),
('Critical Thinking', 'What is the next number: 1, 4, 13, 40, 121, ?', '["A) 300", "B) 330", "C) 364", "D) 400"]'::jsonb, 'C', 'Pattern: 1×3+1=4, 4×3+1=13, 13×3+1=40, 40×3+1=121, 121×3+1=364.', 'NUET - Critical Thinking'),
('Critical Thinking', 'If some politicians are honest, and all honest people are trustworthy, then:', '["A) All politicians are trustworthy", "B) Some politicians are trustworthy", "C) No politicians are trustworthy", "D) All trustworthy people are politicians"]'::jsonb, 'B', 'Some politicians (who are honest) are trustworthy.', 'NUET - Critical Thinking'),
('Critical Thinking', 'Choose the different one: Square, Rectangle, Triangle, Circle, Pentagon', '["A) Square", "B) Rectangle", "C) Triangle", "D) Circle"]'::jsonb, 'D', 'Circle is the only shape without straight sides and angles.', 'NUET - Critical Thinking');

-- Add remaining Critical Thinking questions
INSERT INTO public.questions (subject, question, options, correct_answer, explanation, test_type) VALUES
('Critical Thinking', 'If yesterday was Thursday, what will be the day after tomorrow?', '["A) Saturday", "B) Sunday", "C) Monday", "D) Tuesday"]'::jsonb, 'B', 'If yesterday was Thursday, today is Friday, tomorrow is Saturday, day after tomorrow is Sunday.', 'NUET - Critical Thinking'),
('Critical Thinking', 'Book is to reading as fork is to:', '["A) Kitchen", "B) Eating", "C) Spoon", "D) Food"]'::jsonb, 'B', 'A book is used for reading; a fork is used for eating.', 'NUET - Critical Thinking'),
('Critical Thinking', 'If ZEBRA is written as ABRZE, how is TIGER written?', '["A) GREIT", "B) GIRTE", "C) GRIET", "D) GRITE"]'::jsonb, 'C', 'The pattern reverses then shifts: ZEBRA → ARBEZ → ABRZE. TIGER → REGIT → GRIET.', 'NUET - Critical Thinking'),
('Critical Thinking', 'What comes next: Z, X, V, T, R, ?', '["A) Q", "B) P", "C) O", "D) N"]'::jsonb, 'B', 'Letters skip one going backwards: Z(-2)X(-2)V(-2)T(-2)R(-2)P.', 'NUET - Critical Thinking'),
('Critical Thinking', 'If 3 cats catch 3 mice in 3 minutes, how many cats are needed to catch 100 mice in 100 minutes?', '["A) 3", "B) 33", "C) 100", "D) 300"]'::jsonb, 'A', 'Each cat catches 1 mouse per 3 minutes. In 100 minutes, each cat catches 33.33 mice, so 3 cats can catch 100 mice.', 'NUET - Critical Thinking');

-- Reading Comprehension questions (30 total)
INSERT INTO public.questions (subject, question, options, correct_answer, explanation, test_type) VALUES
('Reading Comprehension', 'Based on a passage about Kazakhstan education reforms, what is the main purpose of introducing international standards?', '["A) To increase competition", "B) To improve global recognition", "C) To reduce costs", "D) To simplify processes"]'::jsonb, 'B', 'International standards in education primarily aim to improve global recognition and quality of education.', 'NUET - Reading Comprehension'),
('Reading Comprehension', 'According to the text about Nazarbayev University, what makes it unique in Kazakhstan?', '["A) Its size", "B) Its location", "C) Its international partnerships", "D) Its age"]'::jsonb, 'C', 'Nazarbayev University is distinguished by its extensive international partnerships and collaborative programs.', 'NUET - Reading Comprehension'),
('Reading Comprehension', 'In a passage about student success, time management is described as:', '["A) Optional skill", "B) Essential skill", "C) Advanced skill", "D) Natural talent"]'::jsonb, 'B', 'The passage emphasizes time management as an essential skill for academic success.', 'NUET - Reading Comprehension'),
('Reading Comprehension', 'The author''s tone in the education article can best be described as:', '["A) Critical", "B) Optimistic", "C) Neutral", "D) Pessimistic"]'::jsonb, 'B', 'The author maintains an optimistic tone when discussing educational improvements and reforms.', 'NUET - Reading Comprehension'),
('Reading Comprehension', 'What is the main idea of the paragraph about study habits?', '["A) All students study the same way", "B) Effective study habits vary by individual", "C) Study habits are not important", "D) Only smart students need good habits"]'::jsonb, 'B', 'The passage emphasizes that effective study habits vary depending on individual learning styles and preferences.', 'NUET - Reading Comprehension'),
('Reading Comprehension', 'According to the passage, what is the primary benefit of group study?', '["A) Faster completion", "B) Less work for everyone", "C) Different perspectives", "D) More fun"]'::jsonb, 'C', 'The text highlights that group study provides exposure to different perspectives and approaches to problem-solving.', 'NUET - Reading Comprehension'),
('Reading Comprehension', 'The word "comprehensive" in the context of the passage means:', '["A) Expensive", "B) Complete", "C) Difficult", "D) Quick"]'::jsonb, 'B', 'In this context, "comprehensive" means complete or thorough, covering all aspects.', 'NUET - Reading Comprehension'),
('Reading Comprehension', 'What can be inferred about the future of education from the passage?', '["A) It will become more expensive", "B) It will become more technology-focused", "C) It will become less important", "D) It will remain unchanged"]'::jsonb, 'B', 'The passage suggests that technology integration will play an increasingly important role in future education.', 'NUET - Reading Comprehension'),
('Reading Comprehension', 'The author uses statistics in the passage to:', '["A) Confuse readers", "B) Support arguments", "C) Fill space", "D) Show off knowledge"]'::jsonb, 'B', 'Statistics are used strategically to support and strengthen the author''s arguments about educational outcomes.', 'NUET - Reading Comprehension'),
('Reading Comprehension', 'What is the relationship between the first and second paragraphs?', '["A) Cause and effect", "B) Problem and solution", "C) Comparison and contrast", "D) General to specific"]'::jsonb, 'D', 'The first paragraph introduces general concepts while the second provides specific examples and details.', 'NUET - Reading Comprehension');

-- Continue with more Reading Comprehension questions
INSERT INTO public.questions (subject, question, options, correct_answer, explanation, test_type) VALUES
('Reading Comprehension', 'The passage suggests that successful students typically:', '["A) Study alone always", "B) Have natural talent only", "C) Use multiple strategies", "D) Avoid difficult subjects"]'::jsonb, 'C', 'The text indicates that successful students employ various learning strategies and adapt their approach as needed.', 'NUET - Reading Comprehension'),
('Reading Comprehension', 'What is the author''s purpose in mentioning historical examples?', '["A) To show knowledge", "B) To provide context", "C) To fill pages", "D) To confuse readers"]'::jsonb, 'B', 'Historical examples are used to provide context and background for understanding current educational practices.', 'NUET - Reading Comprehension'),
('Reading Comprehension', 'The phrase "paradigm shift" in the passage refers to:', '["A) A small change", "B) A gradual improvement", "C) A fundamental change", "D) A temporary adjustment"]'::jsonb, 'C', 'A paradigm shift refers to a fundamental change in approach or underlying assumptions.', 'NUET - Reading Comprehension'),
('Reading Comprehension', 'Based on the passage, what is the most important factor in academic success?', '["A) Intelligence", "B) Motivation", "C) Resources", "D) Time"]'::jsonb, 'B', 'The passage emphasizes that motivation is the most crucial factor driving academic achievement.', 'NUET - Reading Comprehension'),
('Reading Comprehension', 'The author''s attitude toward traditional teaching methods is:', '["A) Completely supportive", "B) Totally opposed", "C) Cautiously optimistic", "D) Balanced and analytical"]'::jsonb, 'D', 'The author presents a balanced analysis of traditional methods, noting both strengths and limitations.', 'NUET - Reading Comprehension'),
('Reading Comprehension', 'What does the passage imply about the role of technology in education?', '["A) It is unnecessary", "B) It should replace teachers", "C) It is a useful tool", "D) It is too expensive"]'::jsonb, 'C', 'The passage implies that technology serves as a valuable tool to enhance learning when used appropriately.', 'NUET - Reading Comprehension'),
('Reading Comprehension', 'The conclusion of the passage primarily:', '["A) Summarizes main points", "B) Introduces new ideas", "C) Asks questions", "D) Provides statistics"]'::jsonb, 'A', 'The conclusion effectively summarizes the main points discussed throughout the passage.', 'NUET - Reading Comprehension'),
('Reading Comprehension', 'According to the text, what is a common mistake students make?', '["A) Studying too much", "B) Asking too many questions", "C) Procrastinating", "D) Being too organized"]'::jsonb, 'C', 'The passage identifies procrastination as a common mistake that hinders student success.', 'NUET - Reading Comprehension'),
('Reading Comprehension', 'The word "facilitate" in the passage means:', '["A) Prevent", "B) Make easier", "C) Complicate", "D) Ignore"]'::jsonb, 'B', 'In this context, "facilitate" means to make easier or help bring about.', 'NUET - Reading Comprehension'),
('Reading Comprehension', 'What is the primary audience for this passage?', '["A) Teachers only", "B) Students only", "C) Parents only", "D) Educational community"]'::jsonb, 'D', 'The passage is written for the broader educational community, including teachers, students, and administrators.', 'NUET - Reading Comprehension');

-- Add remaining Reading Comprehension questions
INSERT INTO public.questions (subject, question, options, correct_answer, explanation, test_type) VALUES
('Reading Comprehension', 'The passage structure can best be described as:', '["A) Chronological", "B) Problem-solution", "C) Compare-contrast", "D) Cause-effect"]'::jsonb, 'B', 'The passage follows a problem-solution structure, identifying issues and proposing solutions.', 'NUET - Reading Comprehension'),
('Reading Comprehension', 'What evidence does the author provide to support the main argument?', '["A) Personal opinions only", "B) Research studies and statistics", "C) Fictional examples", "D) Popular beliefs"]'::jsonb, 'B', 'The author supports arguments with credible research studies and relevant statistical data.', 'NUET - Reading Comprehension'),
('Reading Comprehension', 'The tone of the passage can be described as:', '["A) Humorous", "B) Angry", "C) Informative", "D) Sarcastic"]'::jsonb, 'C', 'The passage maintains an informative tone, presenting facts and analysis objectively.', 'NUET - Reading Comprehension'),
('Reading Comprehension', 'What is the significance of the examples given in paragraph three?', '["A) They contradict the main point", "B) They illustrate the main concept", "C) They are irrelevant", "D) They confuse the reader"]'::jsonb, 'B', 'The examples in paragraph three effectively illustrate and support the main concept being discussed.', 'NUET - Reading Comprehension'),
('Reading Comprehension', 'Based on the passage, what prediction can be made about future trends?', '["A) Education will become simpler", "B) Technology integration will increase", "C) Traditional methods will disappear", "D) Costs will decrease significantly"]'::jsonb, 'B', 'The passage suggests that technology integration in education will continue to increase in the future.', 'NUET - Reading Comprehension'),
('Reading Comprehension', 'The author''s use of rhetorical questions serves to:', '["A) Confuse readers", "B) Engage readers", "C) Show uncertainty", "D) Fill space"]'::jsonb, 'B', 'Rhetorical questions are used strategically to engage readers and encourage them to think about the topics.', 'NUET - Reading Comprehension'),
('Reading Comprehension', 'What is the relationship between effort and achievement according to the passage?', '["A) No relationship", "B) Inversely related", "C) Directly proportional", "D) Randomly connected"]'::jsonb, 'C', 'The passage suggests that effort and achievement are directly proportional - more effort leads to better results.', 'NUET - Reading Comprehension'),
('Reading Comprehension', 'The passage suggests that effective learning requires:', '["A) Expensive resources", "B) Natural talent only", "C) Active participation", "D) Perfect conditions"]'::jsonb, 'C', 'The text emphasizes that effective learning requires active participation and engagement from students.', 'NUET - Reading Comprehension'),
('Reading Comprehension', 'What is the main challenge identified in the passage?', '["A) Lack of funding", "B) Resistance to change", "C) Insufficient teachers", "D) Poor facilities"]'::jsonb, 'B', 'The passage identifies resistance to change as a primary challenge in educational reform.', 'NUET - Reading Comprehension'),
('Reading Comprehension', 'The conclusion suggests that readers should:', '["A) Ignore the advice", "B) Wait for more research", "C) Take immediate action", "D) Remain skeptical"]'::jsonb, 'C', 'The conclusion encourages readers to take immediate action based on the evidence and recommendations presented.', 'NUET - Reading Comprehension');

-- English Language questions (30 total)
INSERT INTO public.questions (subject, question, options, correct_answer, explanation, test_type) VALUES
('English Language', 'Choose the correct form: "The research _____ by university students was groundbreaking."', '["A) was conducted", "B) were conducted", "C) has conducted", "D) conducting"]'::jsonb, 'A', 'The subject "research" is singular, so we use "was conducted" (singular past passive voice).', 'NUET - English Language'),
('English Language', 'Which sentence is grammatically correct?', '["A) Each of the students have completed their assignment", "B) Each of the students has completed their assignment", "C) Each of the students have completed his assignment", "D) Each of the students has completed his assignment"]'::jsonb, 'D', '"Each" is singular, requiring "has" and traditionally "his" (though "their" is becoming acceptable for gender neutrality).', 'NUET - English Language'),
('English Language', 'Complete the sentence: "If I _____ more time, I would study abroad."', '["A) have", "B) had", "C) will have", "D) would have"]'::jsonb, 'B', 'This is a second conditional sentence (hypothetical present/future), requiring "had" in the if-clause.', 'NUET - English Language'),
('English Language', 'Choose the correct preposition: "She is good _____ mathematics."', '["A) in", "B) at", "C) with", "D) on"]'::jsonb, 'B', 'The correct expression is "good at" when referring to skills or abilities.', 'NUET - English Language'),
('English Language', 'Which word is spelled correctly?', '["A) Recieve", "B) Receive", "C) Recieve", "D) Receave"]'::jsonb, 'B', 'The correct spelling is "receive" - remember "i before e except after c."', 'NUET - English Language'),
('English Language', 'Choose the correct form: "Neither John nor his friends _____ coming to the party."', '["A) is", "B) are", "C) was", "D) were"]'::jsonb, 'B', 'With "neither...nor," the verb agrees with the subject closer to it ("friends" is plural).', 'NUET - English Language'),
('English Language', 'What is the correct plural form of "analysis"?', '["A) analysises", "B) analysis", "C) analyses", "D) analysies"]'::jsonb, 'C', 'The plural of "analysis" is "analyses" (Greek origin: -is becomes -es).', 'NUET - English Language'),
('English Language', 'Choose the correct sentence:', '["A) Between you and I, this is difficult", "B) Between you and me, this is difficult", "C) Between you and myself, this is difficult", "D) Between you and us, this is difficult"]'::jsonb, 'B', 'After prepositions like "between," use object pronouns ("me," not "I").', 'NUET - English Language'),
('English Language', 'Which sentence uses the subjunctive mood correctly?', '["A) If I was rich, I would travel", "B) If I were rich, I would travel", "C) If I am rich, I would travel", "D) If I will be rich, I would travel"]'::jsonb, 'B', 'The subjunctive mood uses "were" for hypothetical situations in the past tense.', 'NUET - English Language'),
('English Language', 'Choose the correct word: "The effect/affect of the medicine was immediate."', '["A) effect", "B) affect", "C) Both are correct", "D) Neither is correct"]'::jsonb, 'A', '"Effect" is a noun meaning result or consequence; "affect" is a verb meaning to influence.', 'NUET - English Language');

-- Continue with more English Language questions
INSERT INTO public.questions (subject, question, options, correct_answer, explanation, test_type) VALUES
('English Language', 'Which sentence is punctuated correctly?', '["A) The students, who studied hard passed the exam.", "B) The students who studied hard, passed the exam.", "C) The students who studied hard passed the exam.", "D) The students, who studied hard, passed the exam."]'::jsonb, 'C', 'No commas are needed because "who studied hard" is essential information identifying which students.', 'NUET - English Language'),
('English Language', 'Choose the correct comparative form: "This problem is _____ than the previous one."', '["A) more difficult", "B) most difficult", "C) difficulter", "D) difficultier"]'::jsonb, 'A', 'For adjectives with three or more syllables, use "more" + adjective for comparatives.', 'NUET - English Language'),
('English Language', 'What type of sentence is this: "Although it was raining, we went for a walk."', '["A) Simple", "B) Compound", "C) Complex", "D) Compound-complex"]'::jsonb, 'C', 'This is a complex sentence with one independent clause and one dependent clause.', 'NUET - English Language'),
('English Language', 'Choose the correct pronoun: "Everyone should bring _____ own lunch."', '["A) his", "B) their", "C) its", "D) our"]'::jsonb, 'B', 'Modern usage accepts "their" as a singular pronoun for inclusive language, despite traditional grammar rules.', 'NUET - English Language'),
('English Language', 'Which sentence demonstrates correct parallel structure?', '["A) She likes reading, writing, and to paint", "B) She likes reading, writing, and painting", "C) She likes to read, writing, and painting", "D) She likes reading, to write, and painting"]'::jsonb, 'B', 'Parallel structure requires consistent grammatical forms: all gerunds (reading, writing, painting).', 'NUET - English Language'),
('English Language', 'Choose the correct word: "I could _____ eaten more pizza."', '["A) of", "B) have", "C) had", "D) has"]'::jsonb, 'B', 'The correct form is "could have" (not "could of" which is a common mistake).', 'NUET - English Language'),
('English Language', 'What is the correct past participle of "break"?', '["A) breaked", "B) broke", "C) broken", "D) breaking"]'::jsonb, 'C', 'The past participle of "break" is "broken" (break-broke-broken).', 'NUET - English Language'),
('English Language', 'Choose the sentence with correct apostrophe usage:', '["A) The cats toy is missing", "B) The cats toys are missing", "C) The cat''s toy is missing", "D) The cats'' toy is missing"]'::jsonb, 'C', 'For singular possession, add apostrophe + s: "The cat''s toy."', 'NUET - English Language'),
('English Language', 'Which word is the antonym of "benevolent"?', '["A) Kind", "B) Generous", "C) Malevolent", "D) Helpful"]'::jsonb, 'C', 'Malevolent (wishing harm) is the opposite of benevolent (wishing good).', 'NUET - English Language'),
('English Language', 'Choose the correct sentence structure:', '["A) Running quickly, the bus was missed by John", "B) Running quickly, John missed the bus", "C) The bus was missed by John running quickly", "D) John running quickly, the bus was missed"]'::jsonb, 'B', 'The participial phrase "Running quickly" should modify John, not the bus.', 'NUET - English Language');

-- Add remaining English Language questions
INSERT INTO public.questions (subject, question, options, correct_answer, explanation, test_type) VALUES
('English Language', 'What is the meaning of the idiom "break the ice"?', '["A) To literally break ice", "B) To start a conversation", "C) To solve a problem", "D) To make someone angry"]'::jsonb, 'B', '"Break the ice" means to initiate conversation or ease tension in a social situation.', 'NUET - English Language'),
('English Language', 'Choose the correct word order: "_____ did you see at the party?"', '["A) Who", "B) Whom", "C) Whose", "D) Which"]'::jsonb, 'B', 'Use "whom" when it functions as the object of the verb (you saw whom).', 'NUET - English Language'),
('English Language', 'Which sentence uses "lay" correctly?', '["A) I need to lay down", "B) The book is laying on the table", "C) Please lay the book on the table", "D) I was laying in bed"]'::jsonb, 'C', '"Lay" requires a direct object; "lie" doesn''t. "Lay the book" is correct.', 'NUET - English Language'),
('English Language', 'What is the correct superlative form of "good"?', '["A) gooder", "B) goodest", "C) better", "D) best"]'::jsonb, 'D', 'The superlative form of "good" is "best" (good-better-best).', 'NUET - English Language'),
('English Language', 'Choose the sentence with correct subject-verb agreement:', '["A) The group of students are studying", "B) The group of students is studying", "C) The group of students were studying", "D) The group of students study"]'::jsonb, 'B', 'The subject is "group" (singular), so use "is studying."', 'NUET - English Language'),
('English Language', 'What does "ubiquitous" mean?', '["A) Rare", "B) Present everywhere", "C) Expensive", "D) Difficult"]'::jsonb, 'B', 'Ubiquitous means present, appearing, or found everywhere.', 'NUET - English Language'),
('English Language', 'Choose the correct homophone: "The wind _____ through the trees."', '["A) blew", "B) blue", "C) blow", "D) blown"]'::jsonb, 'A', '"Blew" is the past tense of "blow"; "blue" is a color.', 'NUET - English Language'),
('English Language', 'Which sentence uses "fewer" correctly?', '["A) There are fewer water in the bottle", "B) There are fewer people here today", "C) There are fewer money in my wallet", "D) There are fewer information available"]'::jsonb, 'B', 'Use "fewer" with countable nouns (people); use "less" with uncountable nouns.', 'NUET - English Language'),
('English Language', 'What is the correct form: "She insisted _____ going to the concert."', '["A) on", "B) in", "C) at", "D) for"]'::jsonb, 'A', 'The correct preposition after "insisted" is "on": "insisted on going."', 'NUET - English Language'),
('English Language', 'Choose the sentence without a dangling modifier:', '["A) Walking to school, the backpack felt heavy", "B) Walking to school, I felt the backpack was heavy", "C) The backpack felt heavy walking to school", "D) Walking to school, there was a heavy backpack"]'::jsonb, 'B', 'The modifier "Walking to school" correctly refers to "I," not the backpack.', 'NUET - English Language');

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', now(), now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
