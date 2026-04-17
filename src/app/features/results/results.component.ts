import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { QuizService } from '../../core/services/quiz.service';
import { ScoringService } from '../../core/services/scoring.service';
import { Router } from '@angular/router';
import { QuizResult } from '../../core/models/quiz-result.model';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-results',
  imports: [FooterComponent],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
})
export class ResultsComponent implements OnInit {
  protected readonly results = signal<QuizResult | undefined>(undefined);
  protected readonly performanceLevel = computed(() => {
    const result = this.results();
    return result ? this.scoringService.getPerformanceLevel(result.percentage) : '';
  });
  protected readonly isPerfectScore = computed(() => {
    const result = this.results();
    return result ? result.percentage === 100 : false;
  });

  private quizService: QuizService = inject(QuizService);
  private scoringService: ScoringService = inject(ScoringService);
  private router: Router = inject(Router);

  ngOnInit(): void {
    // Check if quiz was completed
    if (!this.quizService.isQuizComplete()) {
      this.router.navigate(['/']);
      return;
    }

    // Get results
    const quizResults = this.quizService.getQuizResults();
    this.results.set(quizResults);
  }

  retakeQuiz(): void {
    this.quizService.resetQuiz();
    this.router.navigate(['/']);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  }

  getScoreColor(percentage: number): string {
    if (percentage === 100) return '#10b981';
    if (percentage >= 95) return '#3b82f6';
    return '#ef4444';
  }
}
