import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  private timeRemainingSubject = new BehaviorSubject<number>(0);
  private timerSubscription?: Subscription;
  private questionStartTime?: number;

  // Observable for components to suscribe to
  timeRemaining$: Observable<number> = this.timeRemainingSubject.asObservable();

  /**
   * Start timer for a question
   */
  startQuestionTimer(maxTimeSeconds = 60): void {
    this.stopTimer();
    this.questionStartTime = Date.now();
    this.timeRemainingSubject.next(maxTimeSeconds);

    // Update every second for countdown
    this.timerSubscription = interval(1000).subscribe(() => {
      const elapsed = this.getElapsedTime();
      const remaining = Math.max(0, maxTimeSeconds - elapsed);
      this.timeRemainingSubject.next(remaining);

      if (remaining === 0) {
        this.stopTimer();
      }
    });
  }

  /**
   * Stop the current timer
   */
  stopTimer(): void {
    if (this.timerSubscription) {
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
}
