export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  code?: string; // Optional code snippet
  answers: Answer[];
  isMultipleChoice: boolean; // true if multiple answers can be selected
  points: number; // Always 1 for this quiz
}

export interface UserAnswer {
  questionId: string;
  selectedAnswerIds: string[];
  timeSpent: number; // in seconds
  isCorrect: boolean;
}