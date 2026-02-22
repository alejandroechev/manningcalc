import type { ManningInput, CrossSectionParams } from './types.js';
import { computeGeometry } from './geometry.js';

const G = 32.174; // ft/s²

/** Froude number: Fr = V / sqrt(g * D), D = A/T */
export function froudeNumber(velocity: number, area: number, topWidth: number): number {
  if (area <= 0 || topWidth <= 0) return 0;
  const hydraulicDepth = area / topWidth;
  return velocity / Math.sqrt(G * hydraulicDepth);
}

/** Classify flow regime */
export function flowRegime(fr: number): 'subcritical' | 'critical' | 'supercritical' {
  if (fr < 0.99) return 'subcritical';
  if (fr > 1.01) return 'supercritical';
  return 'critical';
}

/** Find critical depth by bisection: Q²T / (gA³) = 1 */
export function criticalDepth(Q: number, input: ManningInput, b?: number): number {
  const maxY = input.shape === 'circle' ? input.d! : 100;

  function buildSec(y: number): CrossSectionParams {
    switch (input.shape) {
      case 'rectangle': return { shape: 'rectangle', b: b ?? input.b!, y };
      case 'trapezoid': return { shape: 'trapezoid', b: b ?? input.b!, y, z: input.z! };
      case 'circle': return { shape: 'circle', d: input.d!, y };
      case 'triangle': return { shape: 'triangle', y, z: input.z! };
    }
  }

  function f(y: number): number {
    const geo = computeGeometry(buildSec(y));
    if (geo.area <= 0 || geo.topWidth <= 0) return -1;
    return (Q * Q * geo.topWidth) / (G * Math.pow(geo.area, 3)) - 1;
  }

  // bisection
  let lo = 0.0001, hi = maxY;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (hi - lo < 1e-8) return mid;
    if (f(lo) * f(mid) <= 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}
