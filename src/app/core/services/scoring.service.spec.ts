import { TestBed } from '@angular/core/testing';

import { ScoringService } from './scoring.service';

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
});
