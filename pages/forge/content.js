import { useState } from 'react';
import useSWR from 'swr';
import { fetchers, api } from '../../lib/api';

export default function ForgeContent() {
  const { data: sites = [] } = useSWR('sites', fetchers.sites);
  const { data: jobs = [] } = useSWR('jobs', fetchers.jobs, { refreshInterval: 5000 });
  const [siteId, setSiteId] = useState('');
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState('draft');
  const [msg, setMsg] = useState('');
  const forgeSites = sites.filter(s => !s.engine || s.engine === 'forge');
  const site = forgeSites.find(s => s.id === siteId);

  const act = async (fn, label) => {
    if (!siteId) return alert('Select a site');
    try { await fn(); setMsg(`${label} queued ✓`); setTimeout(() => setMsg(''), 4000); }
    catch(e) { alert(e.message); }
  };

  return (
    <div className="fade-in">
      <div className="page-head">
        <div><div className="flex" style={{gap:10}}><div className="page-title">Content Engine</div><span className="engine-tag forge">Forge</span></div><div className="page-sub">Keywords → silo → write → publish</div></div>
        {msg && <span className="badge go">{msg}</span>}
      </div>
      <div className="field" style={{maxWidth:360}}>
        <label>Site</label>
        <select value={siteId} onChange={e => setSiteId(e.target.value)}>
          <option value="">— select —</option>
          {forgeSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div className="grid grid-3" style={{marginTop:8}}>
        <div className="panel"><div className="panel-title">① Keywords</div><button className="btn ghost" onClick={() => act(() => api.keywords({siteId}), 'Keywords')}>Expand Keywords</button></div>
        <div className="panel"><div className="panel-title">② Architecture</div><div className="flex" style={{gap:8}}><button className="btn ghost sm" onClick={() => act(() => api.silo({siteId}), 'Silo')}>Build Silo</button><button className="btn ghost sm" onClick={() => act(() => api.trust({siteId}), 'Trust')}>Trust Pages</button></div></div>
        <div className="panel">
          <div className="panel-title">③ Write Silo</div>
          <div className="row" style={{marginBottom:8}}>
            <input type="number" value={limit} onChange={e => setLimit(+e.target.value)} style={{width:80}} />
            <select value={status} onChange={e => setStatus(e.target.value)}><option value="draft">draft</option><option value="publish">publish</option></select>
          </div>
          <button className="btn" onClick={() => act(() => api.writeSilo({siteId,status,limit}), `${limit} articles`)}>Queue {limit} Articles</button>
          {site?.battle_plan?.silo && <div style={{fontSize:11,color:'var(--text-faint)',marginTop:6}}>Silo: {site.battle_plan.silo.pillars?.length} pillars · {site.battle_plan.silo.totalArticles} articles</div>}
        </div>
      </div>
      <div className="panel" style={{marginTop:14}}>
        <div className="panel-title">◆ Write Queue</div>
        {jobs.length === 0 ? <div className="empty">No jobs yet.</div> : (
          <table><thead><tr><th>Keyword</th><th>Type</th><th>Status</th><th>URL</th></tr></thead>
          <tbody>{jobs.slice(0,12).map(j => (
            <tr key={j.id}>
              <td className="mono" style={{maxWidth:240,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{j.keyword}</td>
              <td><span className="tag">{j.job_type}</span></td>
              <td><span className={`badge ${j.status}`}>{j.status}</span></td>
              <td>{j.published_urls?.[0] ? <a href={j.published_urls[0]} target="_blank" rel="noreferrer">view ↗</a> : '—'}</td>
            </tr>
          ))}</tbody></table>
        )}
      </div>
    </div>
  );
}
