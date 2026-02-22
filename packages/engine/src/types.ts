/** Cross-section shape types */
export type ShapeType = 'rectangle' | 'trapezoid' | 'circle' | 'triangle';

export interface RectangleParams {
  shape: 'rectangle';
  b: number; // bottom width (ft)
  y: number; // flow depth (ft)
}

export interface TrapezoidParams {
  shape: 'trapezoid';
  b: number; // bottom width (ft)
  y: number; // flow depth (ft)
  z: number; // side slope (H:V)
}

export interface CircleParams {
  shape: 'circle';
  d: number; // diameter (ft)
  y: number; // flow depth (ft)
}

export interface TriangleParams {
  shape: 'triangle';
  y: number; // flow depth (ft)
  z: number; // side slope (H:V)
}

export type CrossSectionParams =
  | RectangleParams
  | TrapezoidParams
  | CircleParams
  | TriangleParams;

export interface GeometryResult {
  area: number;         // A (ft²)
  wettedPerimeter: number; // P (ft)
  topWidth: number;     // T (ft)
  hydraulicRadius: number; // R = A/P (ft)
  hydraulicDepth: number;  // D = A/T (ft)
}

export interface ManningInput {
  shape: ShapeType;
  /** Bottom width ft (rect/trap) */
  b?: number;
  /** Flow depth ft */
  y?: number;
  /** Side slope H:V (trap/tri) */
  z?: number;
  /** Diameter ft (circle) */
  d?: number;
  /** Manning's n */
  n?: number;
  /** Channel slope ft/ft */
  S?: number;
  /** Discharge cfs */
  Q?: number;
  /** Solve for this unknown */
  solveFor: 'Q' | 'y' | 'n' | 'S' | 'b';
}

export interface FlowResult {
  Q: number;          // discharge (cfs)
  y: number;          // normal depth (ft)
  v: number;          // velocity (ft/s)
  area: number;       // flow area (ft²)
  wettedPerimeter: number;
  hydraulicRadius: number;
  topWidth: number;
  froudeNumber: number;
  flowRegime: 'subcritical' | 'critical' | 'supercritical';
  criticalDepth: number;
  specificEnergy: number;
  n: number;
  S: number;
}
