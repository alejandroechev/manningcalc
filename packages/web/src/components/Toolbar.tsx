import { useState, useRef, useEffect } from 'react';
import { samples } from '../samples/index.js';
import type { Sample } from '../samples/index.js';
import { FeedbackModal } from './FeedbackModal';

interface Props {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onReport: () => void;
  onLoadSample: (sample: Sample) => void;
}

export default function Toolbar({ theme, onToggleTheme, onNew, onOpen, onSave, onReport, onLoadSample }: Props) {
  const [open, setOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <h1>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 20 L3 8 L21 8 L21 20" />
            <path d="M3 14 L21 14" strokeDasharray="2 2" opacity="0.4" />
            <rect x="3" y="14" width="18" height="6" fill="rgba(59,130,246,0.2)" stroke="none" />
          </svg>
          manningcalc
        </h1>
        <div className="toolbar-actions">
          <button className="btn btn-outline btn-sm" onClick={onNew}>New</button>
          <button className="btn btn-outline btn-sm" onClick={onOpen}>Open</button>
          <div className="dropdown" ref={ref}>
            <button className="btn btn-outline btn-sm" onClick={() => setOpen(o => !o)} title="Load sample dataset">
              📂 Samples
            </button>
            {open && (
              <div className="dropdown-menu">
                {samples.map(s => (
                  <button key={s.id} className="dropdown-item" onClick={() => { onLoadSample(s); setOpen(false); }}>
                    <strong>{s.name}</strong>
                    <span>{s.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="btn btn-outline btn-sm" onClick={onSave}>Save</button>
          <button className="btn btn-outline btn-sm" onClick={onReport} title="Open report in new tab">
            📄 Report
          </button>
        </div>
      </div>
      <div className="toolbar-right">
        <button className="btn btn-outline btn-sm" onClick={() => window.open('/intro.html', '_blank')} title="Open channel flow guide">
          📖 Guide
        </button>
        <button className="btn btn-outline btn-sm" onClick={() => setShowFeedback(true)} title="Feedback">
          💬 Feedback
        </button>
        <a className="github-link" href="https://github.com/alejandroechev/manningcalc" target="_blank" rel="noopener noreferrer">GitHub</a>
        <button className="btn-icon" onClick={onToggleTheme} title="Toggle theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
      {showFeedback && <FeedbackModal product="ManningCalc" onClose={() => setShowFeedback(false)} />}
    </div>
  );
}
