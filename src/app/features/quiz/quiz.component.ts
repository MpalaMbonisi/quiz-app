import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { TimerComponent } from '../timer/timer.component';
import { QuestionCardComponent } from '../question-card/question-card.component';
import { Question } from '../../core/models/question.model';
import { Subscription } from 'rxjs';
import { QuizService } from '../../core/services/quiz.service';
import { TimerService } from '../../core/services/timer.service';
import { Router } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-quiz.component',
  imports: [CommonModule, TimerComponent, QuestionCardComponent, FooterComponent],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss',
})
export class QuizComponent implements OnInit, OnDestroy {
  @ViewChild(QuestionCardComponent) questionCard?: QuestionCardComponent;

  protected readonly currentQuestion = signal<Question | undefined>(undefined);
  protected readonly currentQuestionIndex = signal<number>(0);
  protected readonly totalQuestions = signal<number>(0);
  protected readonly progress = signal<number>(0);
  protected readonly selectedAnswers = signal<string[]>([]);
  protected readonly hasAnswered = signal<boolean>(false);
  protected readonly canSubmit = computed(() => this.selectedAnswers().length > 0);

  private currentQuestionSubscription?: Subscription;
  private timeRemainingSubscription?: Subscription;

  private quizService: QuizService = inject(QuizService);
  private timerService: TimerService = inject(TimerService);
  private router: Router = inject(Router);

  ngOnInit(): void {
    // Check if quiz has been started
    const questions = this.quizService.getQuizQuestions();
    if (questions.length === 0) {
      this.router.navigate(['/']);
      return;
    }

    this.totalQuestions.set(this.quizService.getTotalQuestions());

    // Subscribe to question index changes
    this.currentQuestionSubscription = this.quizService.currentQuestionIndex$.subscribe(index => {
      this.currentQuestionIndex.set(index);
      this.loadCurrentQuestion();
    });

    // Subscribe to timer to auto-submit when time runs out
    this.timeRemainingSubscription = this.timerService.timeRemaining$.subscribe(timeRemaining => {
      if (timeRemaining === 0 && !this.hasAnswered()) {
        this.submitAnswer();
      }
    });
  }

  ngOnDestroy(): void {
    this.currentQuestionSubscription?.unsubscribe();
    this.timeRemainingSubscription?.unsubscribe();
    this.timerService.reset();
  }

  loadCurrentQuestion(): void {
    const question = this.quizService.getCurrentQuestion();
    this.currentQuestion.set(question);
    this.hasAnswered.set(this.quizService.hasAnsweredCurrentQuestion());
    this.selectedAnswers.set([]);
    this.progress.set(this.quizService.getProgress());

    // Reset question card selection
    if (this.questionCard) {
      this.questionCard.reset();
    }

    // Start timer for new question (if not already answered)
    if (!this.hasAnswered()) {
      const config = this.quizService.getQuizConfig();
      this.timerService.startQuestionTimer(config?.timePerQuestion || 60);
    }
  }

  onAnswerSelected(answerIds: string[]): void {
    this.selectedAnswers.set(answerIds);
  }

  submitAnswer(): void {
    if (this.hasAnswered()) {
      return;
    }

    const timeSpent = this.timerService.getElapsedTime();
    this.timerService.stopTimer();

    // Submit answer (even if empty for timeout)
    this.quizService.submitAnswer(this.selectedAnswers(), Math.floor(timeSpent));
    this.hasAnswered.set(true);

    // Move to next question or finish
    setTimeout(() => {
      if (!this.quizService.nextQuestion()) {
        // Quiz complete
        this.finishQuiz();
      }
    }, 500);
  }

  previousQuestion(): void {
    this.quizService.previousQuestion();
  }

  finishQuiz(): void {
    this.router.navigate(['/results']);
  }

  quitQuiz(): void {
    if (confirm('Are you sure you want to quit? Your progress will be lost.')) {
      this.quizService.resetQuiz();
      this.router.navigate(['/']);
    }
  }
}
