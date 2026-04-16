import { Injectable } from '@angular/core';
import { QuizConfig, QuizMode } from '../models/quiz-config.model';
import { Question, UserAnswer } from '../models/question.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { ScoringService } from './scoring.service';
import { QuizResult } from '../models/quiz-result.model';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private allQuestions: Question[] = [];
  private currentQuizQuestions: Question[] = [];
  private userAnswers: UserAnswer[] = [];
  private currentQuestionIndexSubject = new BehaviorSubject<number>(0);
  private quizConfig?: QuizConfig;

  currentQuestionIndex$: Observable<number> = this.currentQuestionIndexSubject.asObservable();

  constructor(private scoringService: ScoringService){}

  /**
   * Load all questions (will be replaced with actual data)
   */
  loadQuestions(questions: Question[]): void {
    this.allQuestions = questions;
  }

  /**
   * Initialize quiz with configuration
   */
  startQuiz(config: QuizConfig): Question[]{
    this.quizConfig = config;
    this.userAnswers = [];
    this.currentQuestionIndexSubject.next(0);

    // Select questions based on mode
    switch(config.mode) {
      case QuizMode.ALL_QUESTIONS:
        this.currentQuizQuestions = [...this.allQuestions];
        break;
      
      case QuizMode.RANDOM_23_FIXED_ANSWERS: 
        this.currentQuizQuestions = this.getRandomQuestions(23, false);
        break;

      case QuizMode.RANDOM_23_RANDOM_ANSWERS: 
        this.currentQuizQuestions = this.getRandomQuestions(23, true);
        break;  
    }
    return this.currentQuizQuestions;
  }

  /**
   * Get random questions with optional answer shuffling
   */
  private getRandomQuestions(count: number, shuffleAnswers: boolean): Question[] {
    // Shuffle questions array
    const shuffled = this.shuffleArray([...this.allQuestions]);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    if (shuffleAnswers) {
      // Shuffle answers for each question
      return selected.map(question => ({
        ...question,
        answers: this.shuffleArray([...question.answers])
      }));
    }

    return selected;
  }
  
  /**
   * Fisher-Yates shuffle algorithm
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i --){
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  /**
   * Get current question
   */
  getCurrentQuestion(): Question | undefined {
    const index = this.currentQuestionIndexSubject.value;
    return this.currentQuizQuestions[index];
  }

  /**
   * Get all quiz questions
   */
  getQuizQuestions(): Question[] {
    return this.currentQuizQuestions;
  }

  /**
   * Get current question index (0-based)
   */
  getCurrentQuestionIndex(): number {
    return this.currentQuestionIndexSubject.value;
  }

  /**
   * Get total number of questions in current quiz
   */
  getTotalQuestions(): number {
    return this.currentQuizQuestions.length;
  }

  /**
   * Submit answer for current question
   */
  submitAnswer(selectedAnswerIds: string[], timeSpent: number): void {
    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion) {
      return;
    }

    const isCorrect = this.scoringService.checkAnswer(
      currentQuestion, 
      selectedAnswerIds
    );

    const userAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedAnswerIds,
      timeSpent,
      isCorrect
    };

    this.userAnswers.push(userAnswer);
  }

  /**
   * Move to next question
   */
  nextQuestion(): boolean {
    const currentIndex = this.currentQuestionIndexSubject.value;
    if (currentIndex < this.currentQuizQuestions.length - 1) {
      this.currentQuestionIndexSubject.next(currentIndex + 1);
      return true;
    }
    return false;
  }

  /**
   * Move to previous question
   */
  previousQuestion(): boolean {
    const currentIndex = this.currentQuestionIndexSubject.value;
    if (currentIndex > 0) {
      this.currentQuestionIndexSubject.next(currentIndex - 1);
      return true;
    }
    return false;
  }

  /**
   * Check if quiz is complete
   */
  isQuizComplete(): boolean {
    return this.userAnswers.length === this.currentQuizQuestions.length;
  }

  /**
   * Get quiz results
   */
  getQuizResults(): QuizResult {
    return this.scoringService.calculateQuizResults(
      this.currentQuizQuestions,
      this.userAnswers
    );
  }

  /**
   * Get user answers
   */
  getUserAnswers(): UserAnswer[] {
    return this.userAnswers;
  }

  /**
   * Reset quiz
   */
  resetQuiz(): void {
    this.currentQuizQuestions = [];
    this.userAnswers = [];
    this.currentQuestionIndexSubject.next(0);
    this.quizConfig = undefined;
  }

  /**
   * Get progress percentage
   */
  getProgress(): number {
    if (this.currentQuizQuestions.length === 0){
      return 0;
    }

    return (this.userAnswers.length / this.currentQuizQuestions.length) * 100;
  }

  /**
   * Get quiz configuration
   */
  getQuizConfig(): QuizConfig | undefined {
    return this.quizConfig;
  }

  /**
   * Check if answer has been submitted for current question
   */
  hasAnsweredCurrentQuestion(): boolean {
    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion) {
      return false;
    }

    return this.userAnswers.some(ua => ua.questionId === currentQuestion.id);
  }
}
