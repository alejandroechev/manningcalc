import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { ShapeType, ManningInput, FlowResult } from '@manningcalc/engine';
import { solve } from '@manningcalc/engine';
import ShapeSelector from './components/ShapeSelector.js';
import InputForm from './components/InputForm.js';
import CrossSectionDiagram from './components/CrossSectionDiagram.js';
import ResultsTable from './components/ResultsTable.js';
import ManningNTable from './components/ManningNTable.js';
import Toolbar from './components/Toolbar.js';
import type { Sample } from './samples/index.js';

type SolveFor = ManningInput['solveFor'];

interface FormValues {
  b: string; y: string; z: string; d: string;
  n: string; S: string; Q: string;
}

const defaultForm: FormValues = {
  b: '10', y: '3', z: '2', d: '4',
  n: '0.013', S: '0.001', Q: '',
};

const STORAGE_KEY = 'manningcalc-state';

interface PersistedState {
  shape: ShapeType;
  solveFor: SolveFor;
  form: FormValues;
}

function loadPersisted(): PersistedState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return null;
}

export default function App() {
  const saved = useRef(loadPersisted());
  const [shape, setShape] = useState<ShapeType>(saved.current?.shape ?? 'rectangle');
  const [solveFor, setSolveFor] = useState<SolveFor>(saved.current?.solveFor ?? 'Q');
  const [form, setForm] = useState<FormValues>(saved.current?.form ?? defaultForm);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const s = localStorage.getItem('manningcalc-theme');
    const initial = (s === 'dark' || s === 'light') ? s : 'light';
    document.documentElement.setAttribute('data-theme', initial);
    return initial;
  });
  const fileRef = useRef<HTMLInputElement>(null);

  // Auto-save state to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const state: PersistedState = { shape, solveFor, form };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch { /* ignore */ }
    }, 500);
    return () => clearTimeout(timer);
  }, [shape, solveFor, form]);

  const toggleTheme = useCallback(() => {
    setTheme(t => {
      const next = t === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('manningcalc-theme', next);
      return next;
    });
  }, []);

  const loadSample = useCallback((sample: Sample) => {
    const d = sample.data;
    setShape(d.shape);
    setSolveFor(d.solveFor);
    setForm({
      b: d.b ?? '',
      y: d.y ?? '',
      z: d.z ?? '',
      d: d.d ?? '',
      n: d.n ?? '',
      S: d.S ?? '',
      Q: d.Q ?? '',
    });
  }, []);

  const handleNew = useCallback(() => {
    setShape('rectangle');
    setSolveFor('Q');
    setForm(defaultForm);
  }, []);

  const handleSave = useCallback(() => {
    const state: PersistedState = { shape, solveFor, form };
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manningcalc-project.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [shape, solveFor, form]);

  const handleOpen = useCallback(() => { fileRef.current?.click(); }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const loaded = JSON.parse(reader.result as string) as PersistedState;
        setShape(loaded.shape);
        setSolveFor(loaded.solveFor);
        setForm(loaded.form);
      } catch { /* invalid file */ }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const updateField = useCallback((key: keyof FormValues, val: string) => {
    setForm(f => ({ ...f, [key]: val }));
  }, []);

  const result = useMemo<FlowResult | null>(() => {
    try {
      const num = (k: keyof FormValues) => {
        const v = parseFloat(form[k]);
        return isNaN(v) ? undefined : v;
      };

      const input: ManningInput = {
        shape,
        solveFor,
        b: num('b'),
        y: num('y'),
        z: num('z'),
        d: num('d'),
        n: num('n'),
        S: num('S'),
        Q: num('Q'),
      };

      // Validate required fields are present
      if (solveFor !== 'Q' && input.Q === undefined) return null;
      if (solveFor !== 'y' && input.y === undefined && shape !== 'circle') return null;
      if (solveFor !== 'n' && input.n === undefined) return null;
      if (solveFor !== 'S' && input.S === undefined) return null;
      if (solveFor !== 'b' && (shape === 'rectangle' || shape === 'trapezoid') && input.b === undefined) return null;
      if ((shape === 'trapezoid' || shape === 'triangle') && input.z === undefined) return null;
      if (shape === 'circle' && input.d === undefined) return null;

      return solve(input);
    } catch {
      return null;
    }
  }, [shape, solveFor, form]);

  const openReport = useCallback(() => {
    const svgEl = document.querySelector('.diagram-container svg');
    const svgMarkup = svgEl ? new XMLSerializer().serializeToString(svgEl) : '';

    const shapeLabel = shape.charAt(0).toUpperCase() + shape.slice(1);
    const sfLabels: Record<string, string> = {
      Q: 'Discharge (Q)', y: 'Normal Depth (y)', n: "Manning's n", S: 'Slope (S)', b: 'Bottom Width (b)',
    };

    const inputItems: [string, string][] = [
      ['Channel Shape', shapeLabel],
      ['Solve For', sfLabels[solveFor] || solveFor],
    ];
    if (shape === 'rectangle' || shape === 'trapezoid') inputItems.push(['Bottom Width (b)', form.b ? form.b + ' ft' : '—']);
    if (shape === 'circle') inputItems.push(['Diameter (d)', form.d ? form.d + ' ft' : '—']);
    inputItems.push(['Flow Depth (y)', form.y ? form.y + ' ft' : '—']);
    if (shape === 'trapezoid' || shape === 'triangle') inputItems.push(['Side Slope (z)', form.z ? form.z + ' H:V' : '—']);
    inputItems.push(["Manning's n", form.n || '—']);
    inputItems.push(['Slope (S)', form.S ? form.S + ' ft/ft' : '—']);
    inputItems.push(['Discharge (Q)', form.Q ? form.Q + ' cfs' : '—']);
    const inputsHtml = inputItems.map(([l, v]) =>
      `<div class="input-item"><span class="input-label">${l}</span><span class="input-value">${v}</span></div>`
    ).join('');

    let resultsHtml = '<p>No results computed.</p>';
    if (result) {
      const regime = result.flowRegime;
      const cls = regime === 'subcritical' ? 'badge-sub' : regime === 'supercritical' ? 'badge-super' : 'badge-crit';
      const rows = [
        ['Discharge (Q)', result.Q.toFixed(3), 'cfs'],
        ['Normal Depth (y)', result.y.toFixed(4), 'ft'],
        ['Velocity (V)', result.v.toFixed(3), 'ft/s'],
        ['Flow Area (A)', result.area.toFixed(3), 'ft²'],
        ['Wetted Perimeter (P)', result.wettedPerimeter.toFixed(3), 'ft'],
        ['Hydraulic Radius (R)', result.hydraulicRadius.toFixed(4), 'ft'],
        ['Top Width (T)', result.topWidth.toFixed(3), 'ft'],
        ['Froude Number (Fr)', result.froudeNumber.toFixed(4), ''],
        ['Critical Depth (yc)', result.criticalDepth.toFixed(4), 'ft'],
        ['Specific Energy (E)', result.specificEnergy.toFixed(4), 'ft'],
        ["Manning's n", result.n.toFixed(4), ''],
        ['Slope (S)', result.S.toExponential(4), 'ft/ft'],
      ];
      resultsHtml = `<p>Flow Regime: <span class="badge ${cls}">${regime}</span></p>
        <table><thead><tr><th>Parameter</th><th>Value</th><th>Unit</th></tr></thead>
        <tbody>${rows.map(([p, v, u]) => `<tr><td>${p}</td><td>${v}</td><td>${u}</td></tr>`).join('')}</tbody></table>`;
    }

    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><title>manningcalc Report</title>
<style>
  :root { --text: #1a1a2e; --muted: #6b7280; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; color: #1a1a2e; }
  h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 0.5rem; }
  h2 { color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-size: 0.9rem; margin-top: 2rem; }
  table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
  th, td { padding: 0.5rem 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 0.875rem; }
  th { color: #6b7280; font-weight: 500; }
  .badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
  .badge-sub { background: #dbeafe; color: #1d4ed8; }
  .badge-crit { background: #fef3c7; color: #b45309; }
  .badge-super { background: #fee2e2; color: #dc2626; }
  .diagram { text-align: center; margin: 1rem 0; }
  .hint { color: #6b7280; font-size: 0.85rem; text-align: center; margin-top: 2rem; padding: 0.75rem; background: #f0f9ff; border-radius: 8px; }
  @media print { .hint { display: none; } }
  .inputs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 2rem; }
  .input-item { display: flex; justify-content: space-between; padding: 0.25rem 0; border-bottom: 1px solid #f3f4f6; }
  .input-label { color: #6b7280; }
  .input-value { font-weight: 500; }
</style></head><body>
  <h1>manningcalc Report</h1>
  <p style="color:#6b7280">Manning&#39;s Equation &mdash; Open Channel Flow Analysis</p>
  <h2>Input Parameters</h2>
  <div class="inputs-grid">${inputsHtml}</div>
  <h2>Cross Section</h2>
  <div class="diagram">${svgMarkup}</div>
  <h2>Manning&#39;s Equation</h2>
  <p style="text-align:center;font-size:1.1rem">Q = (1.49/n) &times; A &times; R<sup>2/3</sup> &times; S<sup>1/2</sup></p>
  <h2>Results</h2>
  ${resultsHtml}
  <div class="hint">💡 Use Ctrl+P to save as PDF</div>
</body></html>`;

    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  }, [shape, solveFor, form, result]);

  return (
    <div className="app">
      <Toolbar theme={theme} onToggleTheme={toggleTheme} onNew={handleNew} onOpen={handleOpen} onSave={handleSave} onReport={openReport} onLoadSample={loadSample} />
      <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileChange} />
      <div className="main-grid">
        <div>
          <div className="card">
            <h2>Channel Shape</h2>
            <ShapeSelector shape={shape} onChange={setShape} />
            <h2>Parameters</h2>
            <InputForm
              shape={shape}
              solveFor={solveFor}
              form={form}
              onSolveForChange={setSolveFor}
              onFieldChange={updateField}
            />
            <h2 style={{ marginTop: '1rem' }}>Cross Section</h2>
            <CrossSectionDiagram shape={shape} form={form} result={result} />
            <ManningNTable />
          </div>
        </div>
        <div>
          <div className="card">
            <h2>Results</h2>
            {result ? <ResultsTable result={result} /> : (
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                Enter parameters and the results will appear here.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
