import type { ShapeType } from '@manningcalc/engine';

interface Props {
  shape: ShapeType;
  onChange: (s: ShapeType) => void;
}

const shapes: { type: ShapeType; label: string }[] = [
  { type: 'rectangle', label: 'Rectangle' },
  { type: 'trapezoid', label: 'Trapezoid' },
  { type: 'triangle', label: 'Triangle' },
  { type: 'circle', label: 'Circle' },
];

function ShapeIcon({ type }: { type: ShapeType }) {
  const stroke = 'currentColor';
  const fill = 'none';
  switch (type) {
    case 'rectangle':
      return <svg viewBox="0 0 60 40"><rect x="10" y="8" width="40" height="24" fill={fill} stroke={stroke} strokeWidth="2" /></svg>;
    case 'trapezoid':
      return <svg viewBox="0 0 60 40"><polygon points="5,32 15,8 45,8 55,32" fill={fill} stroke={stroke} strokeWidth="2" /></svg>;
    case 'triangle':
      return <svg viewBox="0 0 60 40"><polygon points="10,32 30,8 50,32" fill={fill} stroke={stroke} strokeWidth="2" /></svg>;
    case 'circle':
      return <svg viewBox="0 0 60 40"><ellipse cx="30" cy="20" rx="18" ry="16" fill={fill} stroke={stroke} strokeWidth="2" /></svg>;
  }
}

export default function ShapeSelector({ shape, onChange }: Props) {
  return (
    <div className="shape-selector">
      {shapes.map(s => (
        <button
          key={s.type}
          className={`shape-btn ${shape === s.type ? 'active' : ''}`}
          onClick={() => onChange(s.type)}
        >
          <ShapeIcon type={s.type} />
          {s.label}
        </button>
      ))}
    </div>
  );
}
