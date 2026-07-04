import { describe, it, expect } from 'vitest';
import { mean, median, quantile, std, corr, movingAvg, longestStreak } from './stats';

describe('stats', () => {
  it('mean/median', () => {
    expect(mean([1, 2, 3, 4])).toBe(2.5);
    expect(median([3, 1, 2])).toBe(2);
  });
  it('quantile', () => {
    expect(quantile([1, 2, 3, 4], 0.5)).toBeCloseTo(2.5);
    expect(quantile([1, 2, 3, 4], 0.75)).toBeCloseTo(3.25);
  });
  it('std', () => {
    expect(std([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.138, 2);
  });
  it('corr detects perfect relationships', () => {
    expect(corr([[1, 2], [2, 4], [3, 6]])).toBeCloseTo(1, 5);
    expect(corr([[1, 6], [2, 4], [3, 2]])).toBeCloseTo(-1, 5);
  });
  it('movingAvg handles nulls', () => {
    const r = movingAvg([2, 4, null, 6], 2);
    expect(r[0]).toBe(2);
    expect(r[1]).toBe(3);
  });
  it('longestStreak', () => {
    expect(longestStreak([true, true, false, true, true, true])).toBe(3);
  });
});
