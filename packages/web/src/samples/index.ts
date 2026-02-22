import type { ShapeType } from '@manningcalc/engine';

export interface SampleData {
  shape: ShapeType;
  solveFor: 'Q' | 'y' | 'n' | 'S' | 'b';
  b?: string;
  y?: string;
  z?: string;
  d?: string;
  n?: string;
  S?: string;
  Q?: string;
}

export interface Sample {
  id: string;
  name: string;
  description: string;
  data: SampleData;
}

export const samples: Sample[] = [
  {
    id: 'concrete-rect',
    name: 'Concrete Rectangular Channel',
    description: 'Textbook example (Chow): 10 ft wide concrete channel, find discharge',
    data: {
      shape: 'rectangle',
      solveFor: 'Q',
      b: '10',
      y: '3',
      n: '0.013',
      S: '0.001',
    },
  },
  {
    id: 'earth-trapezoid',
    name: 'Earth Trapezoidal Canal',
    description: 'Irrigation canal in earth, b=6 ft, 2:1 side slopes, find normal depth',
    data: {
      shape: 'trapezoid',
      solveFor: 'y',
      b: '6',
      z: '2',
      n: '0.025',
      S: '0.0005',
      Q: '200',
    },
  },
  {
    id: 'grassed-waterway',
    name: 'Grassed Waterway (Triangle)',
    description: 'Triangular grassed waterway, 4:1 side slopes, small agricultural flow',
    data: {
      shape: 'triangle',
      solveFor: 'Q',
      y: '1.5',
      z: '4',
      n: '0.035',
      S: '0.02',
    },
  },
  {
    id: 'storm-sewer',
    name: 'Circular Storm Sewer (48")',
    description: '48-inch concrete storm sewer flowing partially full, find discharge',
    data: {
      shape: 'circle',
      solveFor: 'Q',
      d: '4',
      y: '3',
      n: '0.013',
      S: '0.005',
    },
  },
  {
    id: 'mountain-stream',
    name: 'Steep Mountain Stream',
    description: 'High-gradient boulder-lined stream, supercritical flow (Fr > 1)',
    data: {
      shape: 'trapezoid',
      solveFor: 'Q',
      b: '8',
      y: '1.5',
      z: '1',
      n: '0.040',
      S: '0.05',
    },
  },
  {
    id: 'large-river',
    name: 'Large River Section',
    description: 'Wide alluvial river, b=100 ft, gentle slope, find normal depth for large Q',
    data: {
      shape: 'trapezoid',
      solveFor: 'y',
      b: '100',
      z: '3',
      n: '0.030',
      S: '0.0002',
      Q: '10000',
    },
  },
];
