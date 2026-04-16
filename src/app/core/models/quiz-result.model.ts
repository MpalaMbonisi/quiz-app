import { UserAnswer } from "./question.model";

export interface QuestionResult {
    questionId: string;
    questionText: string;
    isCorrect: boolean;
    timeSpent: number;
    speedBonus: number;
    finalScore: number; // base score + speed bonus
}

export interface QuizResult {
    totalQuestions: number;
    correctAnswers: number;
    rawScore: number; // just correct/incorrect
    speedBonusTotal: number;
    finalScore: number; // raw score + speed bonus
    percentage: number; // final score as percentage
    totalTimeSpent: number; // in seconds
    averageTimePerQuestion: number;
    questionResults: QuestionResult[];
    userAnswers: UserAnswer[];
}