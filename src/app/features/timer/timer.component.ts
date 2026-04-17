import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { TimerService } from '../../core/services/timer.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-timer',
  imports: [CommonModule],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss',
})
export class TimerComponent implements OnInit, OnDestroy {
  protected readonly timeRemaining = signal<number>(0);
  protected readonly questionTime = signal<number>(0);
  protected readonly warningLevel = computed(() =>
    this.timerService.formatTime(this.timeRemaining())
  );
  protected readonly formattedTime = computed(() => {
    return this.timerService.formatTime(this.timeRemaining());
  });

  private timeRemainingSubscription?: Subscription;
  private questionTimeSubscription?: Subscription;

  private timerService: TimerService = inject(TimerService);

  ngOnInit(): void {
    // Subscribe to timer observables
    this.timeRemainingSubscription = this.timerService.timeRemaining$.subscribe(time => {
      this.timeRemaining.set(time);
    });

    this.questionTimeSubscription = this.timerService.questionTime$.subscribe(time => {
      this.questionTime.set(time);
    });
  }

  ngOnDestroy(): void {
    this.timeRemainingSubscription?.unsubscribe();
    this.questionTimeSubscription?.unsubscribe();
  }
}
