import { TestBed } from '@angular/core/testing';

import { ScoringService } from './scoring.service';
import { Question } from '../models/question.model';

describe('ScoringService', () => {
  let service: ScoringService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScoringService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculateSpeedBonus', () => {
    it ('should return 0 for incorrect answers regardless of time', () => {
      expect(service.calculateSpeedBonus(10, false)).toBe(0);
      expect(service.calculateSpeedBonus(30, false)).toBe(0);
      expect(service.calculateSpeedBonus(60, false)).toBe(0);
    });

    it('should give bonus for fast correct answers (< 30s)', () => {
      const bonus10s = service.calculateSpeedBonus(10, true);
      const bonus20s = service.calculateSpeedBonus(20, true);
      
      expect(bonus10s).toBeGreaterThan(0);
      expect(bonus20s).toBeGreaterThan(0);
      expect(bonus10s).toBeGreaterThan(bonus20s); // Faster should get more bonus
    });

    it('should give no bonus at optimal time (30s)', () => {
      const bonus = service.calculateSpeedBonus(30, true);
      expect(bonus).toBeCloseTo(0, 2);
    });

    it('should apply small penalty for slow answers (> 30s)', () => {
      const penalty40s = service.calculateSpeedBonus(40, true);
      const penalty50s = service.calculateSpeedBonus(50, true);
      const penalty60s = service.calculateSpeedBonus(60, true);
      
      expect(penalty40s).toBeLessThan(0);
      expect(penalty50s).toBeLessThan(0);
      expect(penalty60s).toBeLessThan(0);
      expect(penalty60s).toBeLessThan(penalty40s); // Slower should have more penalty
    });

    it('should cap penalty at -0.1 for very slow answers', () => {
      const penalty = service.calculateSpeedBonus(60, true);
      expect(penalty).toBeGreaterThanOrEqual(-0.1);
    });

    it('should give maximum bonus for very fast answers', () => {
      const bonus = service.calculateSpeedBonus(1, true);
      expect(bonus).toBeCloseTo(0.25, 2);
    });
  });

  describe('checkAnswer', () => {
    const question: Question = {
      id: '1',
      text:'What is 2 + 2 ?',
      answers: [
        { id: 'a', text: '3', isCorrect: false },
        { id: 'b', text: '4', isCorrect: true },
        { id: 'c', text: '5', isCorrect: false }
      ],
      isMultipleChoice: false,
      points: 1
    };

    const msQuestion: Question = { // multiple select answers
      id: '2',
        text: 'Which are even numbers?',
        answers: [
          { id: 'a', text: '2', isCorrect: true },
          { id: 'b', text: '3', isCorrect: false },
          { id: 'c', text: '4', isCorrect: true },
          { id: 'd', text: '5', isCorrect: false }
        ],
        isMultipleChoice: true,
        points: 1
    };

    it('should return true for correct single-choice answer', () => {
      expect(service.checkAnswer(question, ['b'])).toBe(true);
    });

    it('should return false for incorrect single-choice answer', () => {
      expect(service.checkAnswer(question, ['a'])).toBe(false);
      expect(service.checkAnswer(question, ['c'])).toBe(false);
    });

    it('should return true for correct multiple-choice answer', () => {
      expect(service.checkAnswer(msQuestion, ['a', 'c'])).toBe(true);
      expect(service.checkAnswer(msQuestion, ['c', 'a'])).toBe(true); // Order shouldn't matter
    });

    it('should return false for partially correct multiple-choice answer', () => {
      expect(service.checkAnswer(msQuestion, ['a'])).toBe(false); // Missing 'c'
      expect(service.checkAnswer(msQuestion, ['a', 'b', 'c'])).toBe(false); // Extra 'b'
    });

  })
});
