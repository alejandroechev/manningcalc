import { useState } from 'react';
import { MANNING_N_TABLE } from '@manningcalc/engine';

export default function ManningNTable() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button className="n-table-toggle" onClick={() => setOpen(o => !o)}>
        {open ? '▾' : '▸'} Manning's n Reference
      </button>
      {open && (
        <table className="n-ref-table">
          <thead>
            <tr><th>Material</th><th>n (min)</th><th>n (typical)</th><th>n (max)</th></tr>
          </thead>
          <tbody>
            {MANNING_N_TABLE.map(row => (
              <tr key={row.material}>
                <td>{row.material}</td>
                <td>{row.nMin.toFixed(3)}</td>
                <td>{row.nTypical.toFixed(3)}</td>
                <td>{row.nMax.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
