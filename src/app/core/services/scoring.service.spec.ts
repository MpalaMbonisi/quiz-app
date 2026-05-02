import { TestBed } from '@angular/core/testing';
import { ScoringService } from './scoring.service';
import { Question, UserAnswer } from '../models/question.model';

describe('ScoringService', () => {
  let service: ScoringService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScoringService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculateSpeedMultiplier', () => {
    it('should return 0 for incorrect answers regardless of time', () => {
      expect(service.calculateSpeedMultiplier(10, false)).toBe(0);
      expect(service.calculateSpeedMultiplier(30, false)).toBe(0);
      expect(service.calculateSpeedMultiplier(60, false)).toBe(0);
    });

    it('should give full multiplier (1.0) for fast correct answers (<= 20s)', () => {
      const mult10s = service.calculateSpeedMultiplier(10, true);
      const mult20s = service.calculateSpeedMultiplier(20, true);

      expect(mult10s).toBe(1.0);
      expect(mult20s).toBe(1.0);
    });

    it('should decrease multiplier for answers slower than 20s', () => {
      const mult30s = service.calculateSpeedMultiplier(30, true);
      const mult40s = service.calculateSpeedMultiplier(40, true);

      expect(mult30s).toBeLessThan(1.0);
      expect(mult40s).toBeLessThan(mult30s); // Slower = lower multiplier
    });

    it('should return exactly 0.75 for an answer at 40s (midway between 20s and 60s)', () => {
      // (1 - 0.5) * (20/40) = 0.25 penalty. 1.0 - 0.25 = 0.75
      const mult = service.calculateSpeedMultiplier(40, true);
      expect(mult).toBeCloseTo(0.75, 2);
    });

    it('should cap the multiplier at 0.5 for very slow answers (60s+)', () => {
      const mult60s = service.calculateSpeedMultiplier(60, true);
      const mult70s = service.calculateSpeedMultiplier(70, true);

      expect(mult60s).toBe(0.5);
      expect(mult70s).toBe(0.5);
    });
  });

  describe('checkAnswer', () => {
    const question: Question = {
      id: '1',
      text: 'What is 2 + 2 ?',
      answers: [
        { id: 'a', text: '3', isCorrect: false },
        { id: 'b', text: '4', isCorrect: true },
        { id: 'c', text: '5', isCorrect: false },
      ],
      isMultipleChoice: false,
      points: 1,
    };

    it('should return true for correct single-choice answer', () => {
      expect(service.checkAnswer(question, ['b'])).toBe(true);
    });

    it('should return false for incorrect single-choice answer', () => {
      expect(service.checkAnswer(question, ['a'])).toBe(false);
    });
  });

  describe('calculateQuizResults', () => {
    const questions: Question[] = [
      {
        id: '1',
        text: 'Q1',
        answers: [{ id: 'a', isCorrect: true, text: 'A' }],
        points: 1,
        isMultipleChoice: false,
      },
      {
        id: '2',
        text: 'Q2',
        answers: [{ id: 'b', isCorrect: true, text: 'B' }],
        points: 1,
        isMultipleChoice: false,
      },
      {
        id: '3',
        text: 'Q3',
        answers: [{ id: 'c', isCorrect: true, text: 'C' }],
        points: 1,
        isMultipleChoice: false,
      },
    ];

    it('should calculate 100% only for all correct and fast answers', () => {
      const userAnswers: UserAnswer[] = [
        { questionId: '1', selectedAnswerIds: ['a'], timeSpent: 10, isCorrect: true },
        { questionId: '2', selectedAnswerIds: ['b'], timeSpent: 15, isCorrect: true },
        { questionId: '3', selectedAnswerIds: ['c'], timeSpent: 5, isCorrect: true },
      ];

      const result = service.calculateQuizResults(questions, userAnswers);

      expect(result.finalScore).toBe(3);
      expect(result.percentage).toBe(100);
    });

    it('should result in < 100% if answers are correct but slow', () => {
      const userAnswers: UserAnswer[] = [
        { questionId: '1', selectedAnswerIds: ['a'], timeSpent: 40, isCorrect: true }, // 0.75 pts
        { questionId: '2', selectedAnswerIds: ['b'], timeSpent: 40, isCorrect: true }, // 0.75 pts
        { questionId: '3', selectedAnswerIds: ['c'], timeSpent: 40, isCorrect: true }, // 0.75 pts
      ];

      const result = service.calculateQuizResults(questions, userAnswers);

      expect(result.correctAnswers).toBe(3); // Still 3 correct
      expect(result.finalScore).toBe(2.25); // But score is lower
      expect(result.percentage).toBe(75); // (2.25 / 3) * 100
    });

    it('should correctly handle a mix of incorrect, slow, and fast answers', () => {
      const userAnswers: UserAnswer[] = [
        { questionId: '1', selectedAnswerIds: ['a'], timeSpent: 10, isCorrect: true }, // 1.0 pts
        { questionId: '2', selectedAnswerIds: ['x'], timeSpent: 10, isCorrect: false }, // 0.0 pts
        { questionId: '3', selectedAnswerIds: ['c'], timeSpent: 60, isCorrect: true }, // 0.5 pts
      ];

      const result = service.calculateQuizResults(questions, userAnswers);

      expect(result.correctAnswers).toBe(2);
      expect(result.finalScore).toBe(1.5);
      expect(result.percentage).toBe(50); // (1.5 / 3) * 100
    });
  });

  describe('getPerformanceLevel', () => {
    it('should return correct performance levels based on updated logic', () => {
      expect(service.getPerformanceLevel(100)).toBe('Congratulations, you got an interview!!');
      expect(service.getPerformanceLevel(99)).toBe('Congratulations, you got an interview!!');
      expect(service.getPerformanceLevel(85)).toBe('Very Good - but not quite there.');
      expect(service.getPerformanceLevel(50)).toBe(
        'Unfortunately, we are moving on with other candidates...'
      );
    });
  });
});
