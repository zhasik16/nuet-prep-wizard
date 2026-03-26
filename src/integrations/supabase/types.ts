export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Source {
  source_id: number;
  exam: string;
  year: number | null;
  paper: string | null;
}

export interface Question {
  question_id: number;
  source_id: number | null;
  source_qnum: number | null;
  subject: string | null;
  question_text: string | null;
  has_figure: string | null;
  difficulty: string | null;
  answer_type: string | null;
}

export interface Option {
  option_id: number;
  question_id: number | null;
  label: string | null;
  option_text: string | null;
}

export interface CorrectAnswer {
  answer_id: number;
  question_id: number | null;
  answer_expression: string | null;
}

export interface TopicCategory {
  category_id: number;
  category_name: string | null;
}

export interface Topic {
  topic_id: number;
  topic_name: string | null;
  category_id: number | null;
}

export interface QuestionTopic {
  question_id: number;
  topic_id: number | null;
}

export interface Solution {
  id: number;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  nickname: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface QuizAttempt {
  id: string;
  user_id: string | null;
  test_type: string;
  test_title: string | null;
  score: number;
  total_questions: number;
  time_elapsed: number;
  answers: Json;
  weak_topics: string[] | null;
  created_at: string | null;
}

export type Database = {
  public: {
    Tables: {
      "1 sources": {
        Row: Source;
        Insert: Omit<Source, 'source_id'> & { source_id?: number };
        Update: Partial<Source>;
        Relationships: [];
      };
      "2 questions": {
        Row: Question;
        Insert: Omit<Question, 'question_id'> & { question_id?: number };
        Update: Partial<Question>;
        Relationships: [
          {
            foreignKeyName: "questions_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "1 sources";
            referencedColumns: ["source_id"];
          }
        ];
      };
      "3 options": {
        Row: Option;
        Insert: Omit<Option, 'option_id'> & { option_id?: number };
        Update: Partial<Option>;
        Relationships: [
          {
            foreignKeyName: "options_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "2 questions";
            referencedColumns: ["question_id"];
          }
        ];
      };
      "4 correct answers": {
        Row: CorrectAnswer;
        Insert: Omit<CorrectAnswer, 'answer_id'> & { answer_id?: number };
        Update: Partial<CorrectAnswer>;
        Relationships: [
          {
            foreignKeyName: "correct_answers_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "2 questions";
            referencedColumns: ["question_id"];
          }
        ];
      };
      "5 topics categories": {
        Row: TopicCategory;
        Insert: Omit<TopicCategory, 'category_id'> & { category_id?: number };
        Update: Partial<TopicCategory>;
        Relationships: [];
      };
      "6 topics": {
        Row: Topic;
        Insert: Omit<Topic, 'topic_id'> & { topic_id?: number };
        Update: Partial<Topic>;
        Relationships: [
          {
            foreignKeyName: "topics_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "5 topics categories";
            referencedColumns: ["category_id"];
          }
        ];
      };
      "7 questions topics": {
        Row: QuestionTopic;
        Insert: Omit<QuestionTopic, 'question_id'> & { question_id?: number };
        Update: Partial<QuestionTopic>;
        Relationships: [
          {
            foreignKeyName: "questions_topics_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "2 questions";
            referencedColumns: ["question_id"];
          },
          {
            foreignKeyName: "questions_topics_topic_id_fkey";
            columns: ["topic_id"];
            isOneToOne: false;
            referencedRelation: "6 topics";
            referencedColumns: ["topic_id"];
          }
        ];
      };
      "8 solutions": {
        Row: Solution;
        Insert: Omit<Solution, 'id'> & { id?: number };
        Update: Partial<Solution>;
        Relationships: [];
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      quiz_attempts: {
        Row: QuizAttempt;
        Insert: Omit<QuizAttempt, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<QuizAttempt>;
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};