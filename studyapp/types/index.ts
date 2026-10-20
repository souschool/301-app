export type Subject = "国語" | "数学" | "英語" | "理科" | "社会";

export interface KeyPoint {
  term: string;
  explanation: string;
  examLikelihood: "高" | "中" | "低";
}

export interface AnalysisResult {
  subject: Subject;
  topic: string;
  summary: string;
  keyPoints: KeyPoint[];
  formulas: string[];
}

export type QType = "一問一答" | "選択式" | "記述";

export interface Question {
  id: string;
  type: QType;
  question: string;
  choices?: string[];
  answer: string;
  explanation: string;
}

export interface NoteSet {
  id: string;
  createdAt: string;
  subject: Subject;
  analysis: AnalysisResult;
  questions: Question[];
  results?: { questionId: string; correct: boolean }[];
}
