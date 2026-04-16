import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, map, Observable, Subscription, takeWhile } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  private timeRemainingSubject = new BehaviorSubject<number>(0);
  private questionTimeSubject = new BehaviorSubject<number>(0);
  private timerSubscription?: Subscription;
  private questionStartTime?: number;
  private maxTime = 60;

  // Observable for components to suscribe to
  timeRemaining$: Observable<number> = this.timeRemainingSubject.asObservable();
  questionTime$: Observable<number> = this.questionTimeSubject.asObservable();

  constructor() {}

  /**
   * Start timer for a question
   */
  startQuestionTimer(maxTimeSeconds: number = 60): void {
    this.stopTimer();
    this.maxTime = maxTimeSeconds;
    this.questionStartTime = Date.now();
    this.timeRemainingSubject.next(maxTimeSeconds);
    this.questionTimeSubject.next(0);

    // Update every 100ms for smooth countdown
    this.timerSubscription = interval(100)
      .pipe(
        map(() => {
          const elapsed = this.getElapsedTime();
          const remaining = Math.max(0, maxTimeSeconds - elapsed);
          return { elapsed, remaining };
        }),
        takeWhile(({ remaining }) => remaining > 0, true)
      )
      .subscribe(({ elapsed, remaining }) => {
        this.timeRemainingSubject.next(remaining);
        this.questionTimeSubject.next(elapsed);

        // Auto-submit when time runs out
        if (remaining === 0) {
          this.stopTimer();
        }
      });
  }

  /**
   * Stop the current timer
   */
  stopTimer(): void {
    if(this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = undefined;
    }
  }

  /**
   * Get elapsed time for current question in seconds
   */
  getElapsedTime(): number {
    if (!this.questionStartTime) {
      return 0;
    }
    return (Date.now() - this.questionStartTime) / 1000;
   }

   /**
   * Get remaining time for current question
   */
   getRemainingTime(): number {
    return this.timeRemainingSubject.value;
   }

  /**
   * Reset timer service
   */
  reset(): void {
    this.stopTimer();
    this.timeRemainingSubject.next(0);
    this.questionTimeSubject.next(0);
    this.questionStartTime = undefined;
  }

  /**
   * Check if time has run out
   */
  isTimeUp(): boolean {
    return this.getRemainingTime() <= 0;
  }

  /**
   * Get time as formatted string (MM:SS)
   */
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Get warning level based on remaining time
   */
  getWarningLevel(remainingTime: number): 'normal' | 'warning' | 'critical' {
    const percentRemaining = (remainingTime / this.maxTime) * 100;
    if (percentRemaining <= 50) return 'critical';
    if (percentRemaining <= 80) return 'warning';
    return 'normal';
  }
}
