import { useState, useEffect } from 'react';
import { api } from '../lib/api';

const BOTS = [
  { q: 'WRITE', name: 'Bot 1 — Writer', engine: 'reach' },
  { q: 'DESIGN', name: 'Bot 2 — Design', engine: 'reach' },
  { q: 'PUBLISH', name: 'Bot 3 — Publisher', engine: 'reach' },
  { q: 'WP', name: 'Bot 4 — WordPress', engine: 'reach' },
  { q: 'INDEX', name: 'Bot 5 — Indexing', engine: 'reach' },
  { q: 'SEO', name: 'Forge + Locale Worker', engine: 'forge' },
];

export default function Bots() {
  const [stats, setStats] = useState(null);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const load = () => api.botStatus().then(d => { setStats(d); setOnline(true); }).catch(() => setOnline(false));
    load(); const t = setInterval(load, 4000); return () => clearInterval(t);
  }, []);

  return (
    <div className="fade-in">
      <div className="page-head">
        <div><div className="page-title">Bot Status</div><div className="page-sub">Live queue activity across all workers</div></div>
        <span className={`badge ${online ? 'go' : 'skip'}`}>{online ? 'engine online' : 'engine offline'}</span>
      </div>

      {!online ? (
        <div className="panel"><div className="empty">Engine offline.<br />Start your local engine: <span className="mono">pm2 start ecosystem.config.js</span></div></div>
      ) : (
        <div className="grid grid-3">
          {BOTS.map(b => {
            const q = stats?.[b.q] || {};
            const active = (q.active || 0) + (q.waiting || 0);
            return (
              <div key={b.q} className="panel">
                <div className="flex-between" style={{marginBottom:10}}>
                  <span style={{fontWeight:700}}>{b.name}</span>
                  <span className={`status-dot ${active > 0 ? '' : ''}`} style={{background: active>0?'var(--go)':'var(--text-faint)'}} />
                </div>
                <div className="grid grid-3" style={{gap:8}}>
                  <div><div className="stat-label">Active</div><div className="mono" style={{fontSize:20}}>{q.active||0}</div></div>
                  <div><div className="stat-label">Waiting</div><div className="mono" style={{fontSize:20}}>{q.waiting||0}</div></div>
                  <div><div className="stat-label">Done</div><div className="mono" style={{fontSize:20}}>{q.completed||0}</div></div>
                </div>
                {q.failed > 0 && <div style={{fontSize:11,color:'var(--skip)',marginTop:8}}>{q.failed} failed</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
