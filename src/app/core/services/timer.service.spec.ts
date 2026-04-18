import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { TimerService } from './timer.service';

describe('TimerService', () => {
  let service: TimerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimerService);
  });

  afterEach(() => {
    service.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('startQuestionTimer', () => {
    it('should start timer with correct initial values', fakeAsync(() => {
      service.startQuestionTimer(60);

      let timeRemaining = 0;

      service.timeRemaining$.subscribe(t => (timeRemaining = t));

      tick(0);

      expect(timeRemaining).toBe(60);
    }));

    it('should count down time remaining', fakeAsync(() => {
      service.startQuestionTimer(60);

      let timeRemaining = 0;
      service.timeRemaining$.subscribe(t => (timeRemaining = t));

      tick(1000);

      expect(timeRemaining).toBeLessThan(60);
      expect(timeRemaining).toBeGreaterThan(58);
    }));

    it('should stop at zero', fakeAsync(() => {
      service.startQuestionTimer(1);

      let timeRemaining = 1;
      service.timeRemaining$.subscribe(t => (timeRemaining = t));

      tick(2000);

      expect(timeRemaining).toBe(0);
    }));
  });

  describe('stopTimer', () => {
    it('should stop the countdown', fakeAsync(() => {
      service.startQuestionTimer(60);

      tick(1000);

      const timeBeforeStop = service.getRemainingTime();
      service.stopTimer();

      tick(1000);

      const timeAfterStop = service.getRemainingTime();
      expect(timeAfterStop).toBe(timeBeforeStop);
    }));
  });

  describe('getElapsedTime', () => {
    it('should return 0 before timer starts', () => {
      expect(service.getElapsedTime()).toBe(0);
    });

    it('should return elapsed time after timer starts', fakeAsync(() => {
      service.startQuestionTimer(60);

      tick(2000);

      const elapsed = service.getElapsedTime();
      expect(elapsed).toBeGreaterThan(1.9);
      expect(elapsed).toBeLessThan(2.1);
    }));
  });

  describe('getRemainingTime', () => {
    it('should return remaining time', fakeAsync(() => {
      service.startQuestionTimer(60);

      tick(1000);

      const remaining = service.getRemainingTime();
      expect(remaining).toBeGreaterThan(58);
      expect(remaining).toBeLessThan(60);
    }));
  });

  describe('reset', () => {
    it('should reset all timer values', fakeAsync(() => {
      service.startQuestionTimer(60);

      tick(1000);

      service.reset();

      expect(service.getElapsedTime()).toBe(0);
    }));
  });

  describe('isTimeUp', () => {
    it('should return false when time remaining', fakeAsync(() => {
      service.startQuestionTimer(60);

      tick(1000);

      expect(service.isTimeUp()).toBe(false);
    }));

    it('should return true when time runs out', fakeAsync(() => {
      service.startQuestionTimer(1);

      tick(2000);

      expect(service.isTimeUp()).toBe(true);
    }));
  });

  describe('formatTime', () => {
    it('should format time correctly', () => {
      expect(service.formatTime(0)).toBe('00:00');
      expect(service.formatTime(30)).toBe('00:30');
      expect(service.formatTime(60)).toBe('01:00');
      expect(service.formatTime(125)).toBe('02:05');
      expect(service.formatTime(3661)).toBe('61:01');
    });
  });
});
