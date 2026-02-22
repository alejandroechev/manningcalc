import { describe, it, expect } from 'vitest';
import { computeGeometry } from '../geometry.js';

describe('Rectangle geometry', () => {
  it('computes area, perimeter, top width correctly', () => {
    const g = computeGeometry({ shape: 'rectangle', b: 10, y: 3 });
    expect(g.area).toBeCloseTo(30, 6);
    expect(g.wettedPerimeter).toBeCloseTo(16, 6);
    expect(g.topWidth).toBeCloseTo(10, 6);
    expect(g.hydraulicRadius).toBeCloseTo(30 / 16, 4);
    expect(g.hydraulicDepth).toBeCloseTo(3, 6);
  });

  it('handles zero depth', () => {
    const g = computeGeometry({ shape: 'rectangle', b: 5, y: 0 });
    expect(g.area).toBe(0);
  });
});

describe('Trapezoid geometry', () => {
  it('computes correctly for z=2, b=6, y=3', () => {
    // A = (6 + 2*3)*3 = 36, P = 6 + 2*3*sqrt(5) = 6+6*2.236 = 19.416
    const g = computeGeometry({ shape: 'trapezoid', b: 6, y: 3, z: 2 });
    expect(g.area).toBeCloseTo(36, 4);
    expect(g.wettedPerimeter).toBeCloseTo(6 + 6 * Math.sqrt(5), 4);
    expect(g.topWidth).toBeCloseTo(18, 4);
  });

  it('reduces to rectangle when z=0', () => {
    const g = computeGeometry({ shape: 'trapezoid', b: 10, y: 4, z: 0 });
    expect(g.area).toBeCloseTo(40, 6);
    expect(g.wettedPerimeter).toBeCloseTo(18, 6);
  });
});

describe('Triangle geometry', () => {
  it('computes correctly for z=1.5, y=4', () => {
    // A = 1.5*16 = 24, P = 2*4*sqrt(1+2.25)=8*1.803=14.422
    const g = computeGeometry({ shape: 'triangle', y: 4, z: 1.5 });
    expect(g.area).toBeCloseTo(24, 4);
    expect(g.wettedPerimeter).toBeCloseTo(8 * Math.sqrt(3.25), 3);
    expect(g.topWidth).toBeCloseTo(12, 4);
  });
});

describe('Circle geometry', () => {
  it('computes full pipe (y=d)', () => {
    const g = computeGeometry({ shape: 'circle', d: 4, y: 4 });
    // Full circle: A = pi*r² = pi*4 = 12.566
    expect(g.area).toBeCloseTo(Math.PI * 4, 2);
    expect(g.wettedPerimeter).toBeCloseTo(2 * Math.PI * 2, 2);
  });

  it('computes half-full pipe', () => {
    const g = computeGeometry({ shape: 'circle', d: 4, y: 2 });
    // theta = 2*acos(0) = pi, A = 2*(pi-0)/2 = pi*2 = half-area
    expect(g.area).toBeCloseTo(Math.PI * 2, 2);
    expect(g.topWidth).toBeCloseTo(4, 2);
  });

  it('clamps depth to diameter', () => {
    const g = computeGeometry({ shape: 'circle', d: 3, y: 5 });
    expect(g.area).toBeCloseTo(Math.PI * (3 / 2) ** 2, 2);
  });
});
