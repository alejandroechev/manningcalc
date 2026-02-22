import { describe, it, expect } from 'vitest';
import { froudeNumber, flowRegime, criticalDepth } from '../classification.js';

describe('froudeNumber', () => {
  it('returns correct Froude number', () => {
    // V=5, A=30, T=10 → D=3, Fr = 5/sqrt(32.174*3) = 5/9.826 = 0.509
    const fr = froudeNumber(5, 30, 10);
    expect(fr).toBeCloseTo(0.509, 2);
  });

  it('returns 0 for zero area', () => {
    expect(froudeNumber(5, 0, 10)).toBe(0);
  });
});

describe('flowRegime', () => {
  it('classifies subcritical', () => {
    expect(flowRegime(0.5)).toBe('subcritical');
  });

  it('classifies critical', () => {
    expect(flowRegime(1.0)).toBe('critical');
  });

  it('classifies supercritical', () => {
    expect(flowRegime(2.0)).toBe('supercritical');
  });
});

describe('criticalDepth', () => {
  it('finds critical depth for rectangular channel', () => {
    // For rectangle: yc = (Q²/(g*b²))^(1/3)
    // Q=100, b=10 → yc = (10000/(32.174*100))^(1/3) = (3.108)^(1/3) = 1.459
    const yc = criticalDepth(100, { shape: 'rectangle', b: 10, solveFor: 'Q' });
    const expected = Math.pow(100 * 100 / (32.174 * 10 * 10), 1 / 3);
    expect(yc).toBeCloseTo(expected, 2);
  });

  it('finds critical depth for trapezoid', () => {
    const yc = criticalDepth(200, { shape: 'trapezoid', b: 8, z: 2, solveFor: 'Q' });
    expect(yc).toBeGreaterThan(0);
    expect(yc).toBeLessThan(20);
  });
});
