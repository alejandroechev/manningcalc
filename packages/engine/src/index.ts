export { computeGeometry } from './geometry.js';
export { solve, manningQ } from './solver.js';
export { froudeNumber, flowRegime, criticalDepth } from './classification.js';
export type {
  ShapeType,
  CrossSectionParams,
  RectangleParams,
  TrapezoidParams,
  CircleParams,
  TriangleParams,
  GeometryResult,
  ManningInput,
  FlowResult,
} from './types.js';

/** Common Manning's n values for reference */
export const MANNING_N_TABLE: { material: string; nMin: number; nTypical: number; nMax: number }[] = [
  { material: 'Glass', nMin: 0.009, nTypical: 0.010, nMax: 0.013 },
  { material: 'Smooth steel', nMin: 0.011, nTypical: 0.012, nMax: 0.014 },
  { material: 'Cast iron', nMin: 0.011, nTypical: 0.013, nMax: 0.015 },
  { material: 'Concrete (finished)', nMin: 0.011, nTypical: 0.012, nMax: 0.014 },
  { material: 'Concrete (unfinished)', nMin: 0.014, nTypical: 0.017, nMax: 0.020 },
  { material: 'Brick with mortar', nMin: 0.012, nTypical: 0.015, nMax: 0.018 },
  { material: 'Earth (clean)', nMin: 0.016, nTypical: 0.022, nMax: 0.030 },
  { material: 'Earth (gravel)', nMin: 0.022, nTypical: 0.027, nMax: 0.033 },
  { material: 'Earth (weedy)', nMin: 0.025, nTypical: 0.035, nMax: 0.045 },
  { material: 'Natural stream (clean)', nMin: 0.025, nTypical: 0.033, nMax: 0.040 },
  { material: 'Natural stream (weedy)', nMin: 0.030, nTypical: 0.040, nMax: 0.050 },
  { material: 'Floodplain (grass)', nMin: 0.025, nTypical: 0.035, nMax: 0.050 },
  { material: 'Floodplain (trees)', nMin: 0.050, nTypical: 0.100, nMax: 0.150 },
  { material: 'Corrugated metal', nMin: 0.022, nTypical: 0.025, nMax: 0.030 },
  { material: 'PVC / HDPE', nMin: 0.009, nTypical: 0.010, nMax: 0.013 },
  { material: 'Riprap', nMin: 0.030, nTypical: 0.040, nMax: 0.050 },
];
