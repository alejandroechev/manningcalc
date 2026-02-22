import type { CrossSectionParams, GeometryResult } from './types.js';

/** Compute cross-section geometry for a given shape and depth */
export function computeGeometry(params: CrossSectionParams): GeometryResult {
  switch (params.shape) {
    case 'rectangle':
      return rectangle(params.b, params.y);
    case 'trapezoid':
      return trapezoid(params.b, params.y, params.z);
    case 'circle':
      return circle(params.d, params.y);
    case 'triangle':
      return triangle(params.y, params.z);
  }
}

function rectangle(b: number, y: number): GeometryResult {
  const area = b * y;
  const wettedPerimeter = b + 2 * y;
  const topWidth = b;
  return finish(area, wettedPerimeter, topWidth);
}

function trapezoid(b: number, y: number, z: number): GeometryResult {
  const area = (b + z * y) * y;
  const wettedPerimeter = b + 2 * y * Math.sqrt(1 + z * z);
  const topWidth = b + 2 * z * y;
  return finish(area, wettedPerimeter, topWidth);
}

function circle(d: number, y: number): GeometryResult {
  const r = d / 2;
  const yc = Math.min(Math.max(y, 0), d);
  const theta = 2 * Math.acos((r - yc) / r);
  const area = (r * r / 2) * (theta - Math.sin(theta));
  const wettedPerimeter = r * theta;
  const topWidth = d * Math.sin(theta / 2);
  return finish(area, wettedPerimeter, topWidth);
}

function triangle(y: number, z: number): GeometryResult {
  const area = z * y * y;
  const wettedPerimeter = 2 * y * Math.sqrt(1 + z * z);
  const topWidth = 2 * z * y;
  return finish(area, wettedPerimeter, topWidth);
}

function finish(area: number, wettedPerimeter: number, topWidth: number): GeometryResult {
  const hydraulicRadius = wettedPerimeter > 0 ? area / wettedPerimeter : 0;
  const hydraulicDepth = topWidth > 0 ? area / topWidth : 0;
  return { area, wettedPerimeter, topWidth, hydraulicRadius, hydraulicDepth };
}
