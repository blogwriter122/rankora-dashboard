import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function ReachKeywords() {
  const [keywords, setKeywords] = useState([]);
  const [niche, setNiche] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api.reachKeywords().then(setKeywords).catch(() => {});
  useEffect(() => { load(); const t = setInterval(load, 8000); return () => clearInterval(t); }, []);

  const discover = async () => {
    if (!niche) return alert('Enter a niche');
    setBusy(true);
    try { await api.reachDiscover(niche); alert('Discovery queued — keywords appear shortly'); }
    catch (e) { alert(e.message); }
    setBusy(false);
  };

  const pending = keywords.filter(k => k.status === 'pending');
  const byIntent = keywords.reduce((a, k) => { a[k.intent_type] = (a[k.intent_type]||0)+1; return a; }, {});

  return (
    <div className="fade-in">
      <div className="page-head">
        <div><div className="flex" style={{gap:10}}><div className="page-title">Keyword Manager</div><span className="engine-tag reach">Reach</span></div>
        <div className="page-sub">Demand-driven discovery — auto-refills when queue drops below threshold</div></div>
      </div>

      <div className="panel" style={{marginBottom:14}}>
        <div className="panel-title">🔑 Discover Keywords</div>
        <div className="row" style={{maxWidth:500}}>
          <input value={niche} onChange={e=>setNiche(e.target.value)} placeholder="ai tools" />
          <button className="btn reach" onClick={discover} disabled={busy} style={{whiteSpace:'nowrap'}}>{busy?'Queuing…':'Discover Now'}</button>
        </div>
        <p style={{fontSize:11,color:'var(--text-faint)',marginTop:8}}>The scheduler also runs hourly: if pending keywords drop below 30, it auto-discovers 20 more.</p>
      </div>

      <div className="grid grid-4" style={{marginBottom:14}}>
        <div className="stat reach"><div className="stat-label">Total</div><div className="stat-value">{keywords.length}</div></div>
        <div className="stat"><div className="stat-label">Pending</div><div className="stat-value">{pending.length}</div></div>
        <div className="stat go"><div className="stat-label">Commercial</div><div className="stat-value">{byIntent.commercial||0}</div></div>
        <div className="stat"><div className="stat-label">Transactional</div><div className="stat-value">{byIntent.transactional||0}</div></div>
      </div>

      <div className="panel">
        <div className="panel-title">▤ Keyword Queue</div>
        {keywords.length === 0 ? <div className="empty">No keywords yet. Discover some above.</div> : (
          <table>
            <thead><tr><th>Keyword</th><th>Type</th><th>Intent</th><th>Score</th><th>Status</th></tr></thead>
            <tbody>{keywords.slice(0,60).map(k => (
              <tr key={k.id}>
                <td style={{maxWidth:280,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{k.keyword}</td>
                <td><span className="tag">{k.content_type}</span></td>
                <td><span className={`badge ${k.intent_type==='transactional'?'go':k.intent_type==='commercial'?'high':'normal'}`}>{k.intent_type}</span></td>
                <td className="mono">{k.priority_score}</td>
                <td><span className={`badge ${k.status==='pending'?'pending':'done'}`}>{k.status}</span></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
