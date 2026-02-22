import { useRef } from 'react';
import type { ShapeType, FlowResult } from '@manningcalc/engine';

interface FormValues {
  b: string; y: string; z: string; d: string;
  n: string; S: string; Q: string;
}

interface Props {
  shape: ShapeType;
  form: FormValues;
  result: FlowResult | null;
}

export default function CrossSectionDiagram({ shape, form, result }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const num = (k: keyof FormValues) => parseFloat(form[k]) || 0;
  const depth = result?.y ?? num('y');

  const W = 300, H = 200, pad = 30;
  const drawW = W - 2 * pad, drawH = H - 2 * pad;

  let channelPath = '';
  let waterPath = '';
  let maxChannelDepth = depth * 1.3 || 5;
  let maxChannelWidth = 10;

  switch (shape) {
    case 'rectangle': {
      const b = num('b') || 10;
      maxChannelWidth = b;
      const scaleX = drawW / b;
      const scaleY = drawH / maxChannelDepth;
      const scale = Math.min(scaleX, scaleY);
      const bx = scale * b;
      const dy = scale * maxChannelDepth;
      const wy = scale * depth;
      const cx = W / 2;
      const bot = pad + dy;
      channelPath = `M${cx - bx/2},${pad} L${cx - bx/2},${bot} L${cx + bx/2},${bot} L${cx + bx/2},${pad}`;
      if (depth > 0) {
        const wtop = bot - wy;
        waterPath = `M${cx - bx/2},${wtop} L${cx - bx/2},${bot} L${cx + bx/2},${bot} L${cx + bx/2},${wtop} Z`;
      }
      break;
    }
    case 'trapezoid': {
      const b = num('b') || 6;
      const z = num('z') || 2;
      const topW = b + 2 * z * maxChannelDepth;
      maxChannelWidth = topW;
      const scaleX = drawW / topW;
      const scaleY = drawH / maxChannelDepth;
      const scale = Math.min(scaleX, scaleY);
      const cx = W / 2;
      const bot = pad + scale * maxChannelDepth;
      const bx = scale * b;
      const tx = scale * topW;
      channelPath = `M${cx - tx/2},${pad} L${cx - bx/2},${bot} L${cx + bx/2},${bot} L${cx + tx/2},${pad}`;
      if (depth > 0) {
        const wy = scale * depth;
        const ww = b + 2 * z * depth;
        const wx = scale * ww;
        const wtop = bot - wy;
        waterPath = `M${cx - wx/2},${wtop} L${cx - bx/2},${bot} L${cx + bx/2},${bot} L${cx + wx/2},${wtop} Z`;
      }
      break;
    }
    case 'triangle': {
      const z = num('z') || 1.5;
      const topW = 2 * z * maxChannelDepth;
      maxChannelWidth = topW;
      const scaleX = drawW / topW;
      const scaleY = drawH / maxChannelDepth;
      const scale = Math.min(scaleX, scaleY);
      const cx = W / 2;
      const bot = pad + scale * maxChannelDepth;
      const tx = scale * topW;
      channelPath = `M${cx - tx/2},${pad} L${cx},${bot} L${cx + tx/2},${pad}`;
      if (depth > 0) {
        const wy = scale * depth;
        const ww = 2 * z * depth;
        const wx = scale * ww;
        const wtop = bot - wy;
        waterPath = `M${cx - wx/2},${wtop} L${cx},${bot} L${cx + wx/2},${wtop} Z`;
      }
      break;
    }
    case 'circle': {
      const d = num('d') || 4;
      maxChannelDepth = d;
      maxChannelWidth = d;
      const scale = Math.min(drawW, drawH) / d;
      const r = scale * d / 2;
      const cx = W / 2, cy = pad + r;
      channelPath = `M${cx - r},${cy} A${r},${r} 0 1,1 ${cx + r},${cy} A${r},${r} 0 1,1 ${cx - r},${cy}`;
      if (depth > 0 && depth <= d) {
        const yClamp = Math.min(depth, d);
        const waterTop = cy + r - scale * yClamp;
        const halfChord = Math.sqrt(Math.max(0, r * r - (waterTop - cy) ** 2));
        waterPath = `M${cx - halfChord},${waterTop} A${r},${r} 0 ${yClamp > d / 2 ? 1 : 0},0 ${cx + halfChord},${waterTop} Z`;
      }
      break;
    }
  }

  const resolveCssVars = (svgClone: SVGSVGElement) => {
    const styles = getComputedStyle(document.documentElement);
    const textColor = styles.getPropertyValue('--text').trim() || '#1a1a2e';
    const mutedColor = styles.getPropertyValue('--muted').trim() || '#6b7280';
    svgClone.querySelectorAll('*').forEach(el => {
      for (const attr of ['stroke', 'fill']) {
        const val = el.getAttribute(attr);
        if (val === 'var(--text)') el.setAttribute(attr, textColor);
        if (val === 'var(--muted)') el.setAttribute(attr, mutedColor);
      }
    });
  };

  const exportSVG = () => {
    if (!svgRef.current) return;
    const clone = svgRef.current.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    resolveCssVars(clone);
    const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: 'cross-section.svg' }).click();
    URL.revokeObjectURL(url);
  };

  const exportPNG = () => {
    if (!svgRef.current) return;
    const clone = svgRef.current.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    resolveCssVars(clone);
    const svgData = new XMLSerializer().serializeToString(clone);
    const canvas = document.createElement('canvas');
    canvas.width = W * 2; canvas.height = H * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      Object.assign(document.createElement('a'), { href: canvas.toDataURL('image/png'), download: 'cross-section.png' }).click();
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
  };

  return (
    <div className="diagram-container">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        {waterPath && (
          <path d={waterPath} fill="rgba(59,130,246,0.3)" stroke="#3b82f6" strokeWidth="1.5" />
        )}
        <path d={channelPath} fill="none" stroke="var(--text)" strokeWidth="2" />
        {depth > 0 && (
          <text x={W / 2} y={H - 5} textAnchor="middle" fontSize="11" fill="var(--muted)">
            y = {depth.toFixed(2)} ft
          </text>
        )}
      </svg>
      <div className="export-buttons">
        <button className="btn btn-outline btn-sm" onClick={exportPNG} title="Export as PNG">PNG</button>
        <button className="btn btn-outline btn-sm" onClick={exportSVG} title="Export as SVG">SVG</button>
      </div>
    </div>
  );
}
