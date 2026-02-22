import { describe, it, expect } from 'vitest';
import { solve, manningQ } from '../solver.js';
import { computeGeometry } from '../geometry.js';

describe('manningQ', () => {
  it('computes discharge for known values', () => {
    // Rectangle: b=10, y=3 → A=30, R=30/16=1.875
    // Q = 1.486/0.013 * 30 * 1.875^(2/3) * 0.001^0.5
    const geo = computeGeometry({ shape: 'rectangle', b: 10, y: 3 });
    const Q = manningQ(0.013, geo.area, geo.hydraulicRadius, 0.001);
    expect(Q).toBeGreaterThan(0);
    // Verify: ~1.486/0.013 * 30 * 1.875^0.667 * 0.0316 = 114.31*30*1.525*0.0316 ≈ 165
    expect(Q).toBeCloseTo(164.89, 0);
  });
});

describe('solve', () => {
  const baseRect = {
    shape: 'rectangle' as const,
    b: 10,
    n: 0.013,
    S: 0.001,
  };

  it('solves for Q given y', () => {
    const result = solve({ ...baseRect, y: 3, solveFor: 'Q' });
    expect(result.Q).toBeCloseTo(164.89, 0);
    expect(result.v).toBeGreaterThan(0);
    expect(result.area).toBeCloseTo(30, 4);
  });

  it('solves for y (normal depth) given Q', () => {
    // First get Q for y=3, then solve back for y
    const fwd = solve({ ...baseRect, y: 3, solveFor: 'Q' });
    const result = solve({ ...baseRect, Q: fwd.Q, solveFor: 'y' });
    expect(result.y).toBeCloseTo(3, 2);
  });

  it('solves for n given Q and y', () => {
    const result = solve({ ...baseRect, Q: 165.6, y: 3, solveFor: 'n' });
    expect(result.n).toBeCloseTo(0.013, 3);
  });

  it('solves for S given Q and y', () => {
    const fwd = solve({ ...baseRect, y: 3, solveFor: 'Q' });
    const result = solve({ ...baseRect, Q: fwd.Q, y: 3, solveFor: 'S' });
    expect(result.S).toBeCloseTo(0.001, 5);
  });

  it('solves for b given Q and y', () => {
    const fwd = solve({ ...baseRect, y: 3, solveFor: 'Q' });
    const result = solve({ shape: 'rectangle', Q: fwd.Q, y: 3, n: 0.013, S: 0.001, solveFor: 'b' });
    expect(result.y).toBeCloseTo(3, 2);
  });

  it('solves trapezoid for Q', () => {
    const result = solve({
      shape: 'trapezoid', b: 6, y: 3, z: 2, n: 0.025, S: 0.002, solveFor: 'Q',
    });
    expect(result.Q).toBeGreaterThan(0);
    expect(result.area).toBeCloseTo(36, 2);
  });

  it('solves trapezoid for normal depth', () => {
    const fwd = solve({
      shape: 'trapezoid', b: 6, y: 3, z: 2, n: 0.025, S: 0.002, solveFor: 'Q',
    });
    const inv = solve({
      shape: 'trapezoid', b: 6, z: 2, n: 0.025, S: 0.002, Q: fwd.Q, solveFor: 'y',
    });
    expect(inv.y).toBeCloseTo(3, 2);
  });

  it('solves triangle for Q', () => {
    const result = solve({
      shape: 'triangle', y: 2, z: 1.5, n: 0.015, S: 0.005, solveFor: 'Q',
    });
    expect(result.Q).toBeGreaterThan(0);
  });

  it('solves circle for Q', () => {
    const result = solve({
      shape: 'circle', d: 4, y: 2, n: 0.013, S: 0.001, solveFor: 'Q',
    });
    expect(result.Q).toBeGreaterThan(0);
  });

  it('returns flow classification', () => {
    const result = solve({ ...baseRect, y: 3, solveFor: 'Q' });
    expect(['subcritical', 'critical', 'supercritical']).toContain(result.flowRegime);
    expect(result.froudeNumber).toBeGreaterThan(0);
    expect(result.criticalDepth).toBeGreaterThan(0);
    expect(result.specificEnergy).toBeGreaterThan(0);
  });
});
