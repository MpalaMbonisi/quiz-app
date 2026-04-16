import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { TimerService } from './timer.service';

describe('TimerService', () => {
  let service: TimerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimerService);
  });

  afterEach(() => {
    service.reset;
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('startQuestionTimer', () => {
    it('should start timer with correct initial values', fakeAsync(() => {
      service.startQuestionTimer(60);
      
      let timeRemaining = 0;
      let questionTime = 0;
      
      service.timeRemaining$.subscribe(t => timeRemaining = t);
      service.questionTime$.subscribe(t => questionTime = t);
      
      tick(0);
      
      expect(timeRemaining).toBe(60);
      expect(questionTime).toBe(0);
    }));

    it('should count down time remaining', fakeAsync(() => {
      service.startQuestionTimer(60);
      
      let timeRemaining = 0;
      service.timeRemaining$.subscribe(t => timeRemaining = t);
      
      tick(1000);
      
      expect(timeRemaining).toBeLessThan(60);
      expect(timeRemaining).toBeGreaterThan(58);
    }));

    it('should count up elapsed time', fakeAsync(() => {
      service.startQuestionTimer(60);
      
      let questionTime = 0;
      service.questionTime$.subscribe(t => questionTime = t);
      
      tick(1000);
      
      expect(questionTime).toBeGreaterThan(0.9);
      expect(questionTime).toBeLessThan(1.1);
    }));

    it('should stop at zero', fakeAsync(() => {
      service.startQuestionTimer(1);
      
      let timeRemaining = 1;
      service.timeRemaining$.subscribe(t => timeRemaining = t);
      
      tick(2000);
      
      expect(timeRemaining).toBe(0);
    }));
  });
});
