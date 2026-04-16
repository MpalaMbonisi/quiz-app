export enum QuizMode {
    ALL_QUESTIONS = 'all',
    RANDOM_23_FIXED_ANSWERS = 'random23fixed',
    RANDOM_23_RANDOM_ANSWERS = 'random23random'
}

export interface QuizConfig {
    mode: QuizMode;
    timePerQuestion: number; // in seconds
    totalQuestions: number;
}