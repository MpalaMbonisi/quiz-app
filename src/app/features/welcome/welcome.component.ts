import { Component, inject, signal } from '@angular/core';
import { QuizMode } from '../../core/models/quiz-config.model';
import { Router } from '@angular/router';
import { QuizService } from '../../core/services/quiz.service';
import { JAVA_QUESTIONS } from '../../core/data/questions.data';

@Component({
  selector: 'app-welcome.component',
  imports: [],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
})
export class WelcomeComponent {
  protected readonly selectedMode = signal<QuizMode>(QuizMode.ALL_QUESTIONS);
  protected readonly QuizMode = QuizMode;

  private router: Router = inject(Router);
  private quizService: QuizService = inject(QuizService);

  selectMode(mode: QuizMode): void {
    this.selectedMode.set(mode);
  }

  startQuiz(): void {
    // Load questions
    this.quizService.loadQuestions(JAVA_QUESTIONS);

    // Start quiz with selected configuration
    this.quizService.startQuiz({
      mode: this.selectedMode(),
      timePerQuestion: 60,
      totalQuestions: this.selectedMode() === QuizMode.ALL_QUESTIONS ? JAVA_QUESTIONS.length : 23,
    });

    // Navigate to quiz
    this.router.navigate(['/quiz']);
  }
}
