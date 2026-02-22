import type { ShapeType, ManningInput } from '@manningcalc/engine';

type SolveFor = ManningInput['solveFor'];

interface FormValues {
  b: string; y: string; z: string; d: string;
  n: string; S: string; Q: string;
}

interface Props {
  shape: ShapeType;
  solveFor: SolveFor;
  form: FormValues;
  onSolveForChange: (s: SolveFor) => void;
  onFieldChange: (key: keyof FormValues, val: string) => void;
}

interface FieldDef {
  key: keyof FormValues;
  label: string;
  unit: string;
}

function fieldsForShape(shape: ShapeType): FieldDef[] {
  const common: FieldDef[] = [
    { key: 'n', label: "Manning's n", unit: '' },
    { key: 'S', label: 'Slope (S)', unit: 'ft/ft' },
    { key: 'Q', label: 'Discharge (Q)', unit: 'cfs' },
  ];
  switch (shape) {
    case 'rectangle':
      return [
        { key: 'b', label: 'Bottom Width (b)', unit: 'ft' },
        { key: 'y', label: 'Flow Depth (y)', unit: 'ft' },
        ...common,
      ];
    case 'trapezoid':
      return [
        { key: 'b', label: 'Bottom Width (b)', unit: 'ft' },
        { key: 'y', label: 'Flow Depth (y)', unit: 'ft' },
        { key: 'z', label: 'Side Slope (z)', unit: 'H:V' },
        ...common,
      ];
    case 'triangle':
      return [
        { key: 'y', label: 'Flow Depth (y)', unit: 'ft' },
        { key: 'z', label: 'Side Slope (z)', unit: 'H:V' },
        ...common,
      ];
    case 'circle':
      return [
        { key: 'd', label: 'Diameter (d)', unit: 'ft' },
        { key: 'y', label: 'Flow Depth (y)', unit: 'ft' },
        ...common,
      ];
  }
}

function solveForOptions(shape: ShapeType): { value: SolveFor; label: string }[] {
  const base: { value: SolveFor; label: string }[] = [
    { value: 'Q', label: 'Discharge (Q)' },
    { value: 'y', label: 'Normal Depth (y)' },
    { value: 'n', label: "Manning's n" },
    { value: 'S', label: 'Slope (S)' },
  ];
  if (shape === 'rectangle' || shape === 'trapezoid') {
    base.push({ value: 'b', label: 'Bottom Width (b)' });
  }
  return base;
}

export default function InputForm({ shape, solveFor, form, onSolveForChange, onFieldChange }: Props) {
  const fields = fieldsForShape(shape);
  const options = solveForOptions(shape);

  return (
    <div className="form-grid">
      <div className="form-group full">
        <label>Solve For</label>
        <select value={solveFor} onChange={e => onSolveForChange(e.target.value as SolveFor)}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      {fields.filter(f => f.key !== solveFor).map(f => (
        <div className="form-group" key={f.key}>
          <label>{f.label} {f.unit && <span style={{ opacity: 0.6 }}>({f.unit})</span>}</label>
          <input
            type="number"
            step="any"
            value={form[f.key]}
            onChange={e => onFieldChange(f.key, e.target.value)}
            placeholder={f.label}
          />
        </div>
      ))}
    </div>
  );
}
