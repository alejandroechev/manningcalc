import type { FlowResult } from '@manningcalc/engine';

interface Props {
  result: FlowResult;
}

function fmt(v: number, digits = 4): string {
  return v.toFixed(digits);
}

function regimeBadge(regime: FlowResult['flowRegime']) {
  const cls = regime === 'subcritical' ? 'badge-sub' : regime === 'supercritical' ? 'badge-super' : 'badge-crit';
  return <span className={`badge ${cls}`}>{regime}</span>;
}

export default function ResultsTable({ result }: Props) {
  const rows: [string, string, string][] = [
    ['Discharge (Q)', fmt(result.Q, 3), 'cfs'],
    ['Normal Depth (y)', fmt(result.y, 4), 'ft'],
    ['Velocity (V)', fmt(result.v, 3), 'ft/s'],
    ['Flow Area (A)', fmt(result.area, 3), 'ft²'],
    ['Wetted Perimeter (P)', fmt(result.wettedPerimeter, 3), 'ft'],
    ['Hydraulic Radius (R)', fmt(result.hydraulicRadius, 4), 'ft'],
    ['Top Width (T)', fmt(result.topWidth, 3), 'ft'],
    ['Froude Number (Fr)', fmt(result.froudeNumber, 4), ''],
    ['Critical Depth (yc)', fmt(result.criticalDepth, 4), 'ft'],
    ['Specific Energy (E)', fmt(result.specificEnergy, 4), 'ft'],
    ["Manning's n", fmt(result.n, 4), ''],
    ['Slope (S)', result.S.toExponential(4), 'ft/ft'],
  ];

  const exportCSV = () => {
    const header = 'Parameter,Value,Unit\n';
    const csv = header + rows.map(([p, v, u]) => `"${p}",${v},"${u}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: 'manningcalc-results.csv' }).click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Flow Regime: {regimeBadge(result.flowRegime)}</span>
        <button className="btn btn-outline btn-sm" onClick={exportCSV} title="Export results as CSV">CSV</button>
      </div>
      <table className="results-table">
        <thead>
          <tr><th>Parameter</th><th>Value</th><th>Unit</th></tr>
        </thead>
        <tbody>
          {rows.map(([label, val, unit]) => (
            <tr key={label}><td>{label}</td><td>{val}</td><td>{unit}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
