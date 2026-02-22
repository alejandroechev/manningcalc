import type { CrossSectionParams, ManningInput, FlowResult } from './types.js';
import { computeGeometry } from './geometry.js';
import { froudeNumber, flowRegime, criticalDepth } from './classification.js';

const K = 1.486; // US customary constant (often rounded to 1.49)
const G = 32.174; // ft/s²

/** Compute discharge via Manning's equation */
export function manningQ(n: number, area: number, hydraulicRadius: number, slope: number): number {
  return (K / n) * area * Math.pow(hydraulicRadius, 2 / 3) * Math.sqrt(slope);
}

/** Build CrossSectionParams from ManningInput at a given depth */
function buildSection(input: ManningInput, y: number, b?: number): CrossSectionParams {
  switch (input.shape) {
    case 'rectangle':
      return { shape: 'rectangle', b: b ?? input.b!, y };
    case 'trapezoid':
      return { shape: 'trapezoid', b: b ?? input.b!, y, z: input.z! };
    case 'circle':
      return { shape: 'circle', d: input.d!, y };
    case 'triangle':
      return { shape: 'triangle', y, z: input.z! };
  }
}

/** Bisection root finder */
function bisect(f: (x: number) => number, lo: number, hi: number, tol = 1e-8, maxIter = 200): number {
  for (let i = 0; i < maxIter; i++) {
    const mid = (lo + hi) / 2;
    if (hi - lo < tol) return mid;
    if (f(lo) * f(mid) <= 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

/** Solve for the unknown parameter */
export function solve(input: ManningInput): FlowResult {
  let Q: number, y: number, n: number, S: number, b: number | undefined;

  switch (input.solveFor) {
    case 'Q': {
      y = input.y!; n = input.n!; S = input.S!; b = input.b;
      const sec = buildSection(input, y, b);
      const geo = computeGeometry(sec);
      Q = manningQ(n, geo.area, geo.hydraulicRadius, S);
      break;
    }
    case 'y': {
      Q = input.Q!; n = input.n!; S = input.S!; b = input.b;
      const maxY = input.shape === 'circle' ? input.d! : 100;
      y = bisect((yy) => {
        const sec = buildSection(input, yy, b);
        const geo = computeGeometry(sec);
        return manningQ(n, geo.area, geo.hydraulicRadius, S) - Q;
      }, 0.0001, maxY);
      break;
    }
    case 'n': {
      Q = input.Q!; y = input.y!; S = input.S!; b = input.b;
      const sec = buildSection(input, y, b);
      const geo = computeGeometry(sec);
      n = (K / Q) * geo.area * Math.pow(geo.hydraulicRadius, 2 / 3) * Math.sqrt(S);
      return buildResult(Q, y, n, S, input, b);
    }
    case 'S': {
      Q = input.Q!; y = input.y!; n = input.n!; b = input.b;
      const sec = buildSection(input, y, b);
      const geo = computeGeometry(sec);
      const capacity = (K / n) * geo.area * Math.pow(geo.hydraulicRadius, 2 / 3);
      S = Math.pow(Q / capacity, 2);
      return buildResult(Q, y, n, S, input, b);
    }
    case 'b': {
      Q = input.Q!; y = input.y!; n = input.n!; S = input.S!;
      b = bisect((bb) => {
        const sec = buildSection(input, y, bb);
        const geo = computeGeometry(sec);
        return manningQ(n, geo.area, geo.hydraulicRadius, S) - Q;
      }, 0.01, 500);
      break;
    }
    default:
      throw new Error(`Cannot solve for ${input.solveFor}`);
  }

  n = input.n ?? 0;
  S = input.S ?? 0;
  return buildResult(Q!, y!, n, S, input, b);
}

function buildResult(Q: number, y: number, n: number, S: number, input: ManningInput, b?: number): FlowResult {
  const sec = buildSection(input, y, b);
  const geo = computeGeometry(sec);
  const v = geo.area > 0 ? Q / geo.area : 0;
  const fr = froudeNumber(v, geo.area, geo.topWidth);
  const regime = flowRegime(fr);
  const yc = criticalDepth(Q, input, b);
  const specificEnergy = y + (v * v) / (2 * G);

  return {
    Q, y, v, n, S,
    area: geo.area,
    wettedPerimeter: geo.wettedPerimeter,
    hydraulicRadius: geo.hydraulicRadius,
    topWidth: geo.topWidth,
    froudeNumber: fr,
    flowRegime: regime,
    criticalDepth: yc,
    specificEnergy,
  };
}
