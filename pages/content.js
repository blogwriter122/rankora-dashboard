import { useState } from 'react';
import useSWR from 'swr';
import { fetchers, api } from '../lib/api';

export default function Content() {
  const { data: sites = [] } = useSWR('sites', fetchers.sites);
  const { data: jobs = [] } = useSWR('jobs', fetchers.jobs, { refreshInterval: 5000 });
  const [siteId, setSiteId] = useState('');
  const [seeds, setSeeds] = useState('');
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState('draft');
  const [msg, setMsg] = useState('');

  const site = sites.find((s) => s.id === siteId);
  const silo = site?.battle_plan?.silo;

  const act = async (fn, label) => {
    if (!siteId) return alert('Pick a site');
    try { await fn(); setMsg(`${label} queued ✓`); setTimeout(() => setMsg(''), 4000); }
    catch (e) { alert('Failed: ' + e.message); }
  };

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="page-title">Content Engine</div>
          <div className="page-sub">Keywords → silo → trust layer → write &amp; publish</div>
        </div>
        {msg && <span className="badge go">{msg}</span>}
      </div>

      <div className="field" style={{ maxWidth: 360 }}>
        <label>Active Site</label>
        <select value={siteId} onChange={(e) => setSiteId(e.target.value)}>
          <option value="">— select site —</option>
          {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="grid grid-2" style={{ marginTop: 8 }}>
        <div className="panel">
          <div className="panel-title">① Keyword Expansion</div>
          <div className="field"><label>Seeds (comma separated, blank = use main keyword)</label>
            <input value={seeds} onChange={(e) => setSeeds(e.target.value)} placeholder="keto recipes, keto snacks" />
          </div>
          <button className="btn ghost" onClick={() => act(() => api.keywords({ siteId, seeds: seeds ? seeds.split(',').map((x) => x.trim()) : undefined }), 'Keyword expansion')}>Expand Keywords</button>
        </div>

        <div className="panel">
          <div className="panel-title">② Architecture</div>
          <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>Generate the 10×10 topical authority map + internal link map (needs a battle plan first).</p>
          <div className="row">
            <button className="btn ghost" onClick={() => act(() => api.silo({ siteId }), 'Silo')}>Build Silo</button>
            <button className="btn ghost" onClick={() => act(() => api.trust({ siteId }), 'Trust pages')}>Build Trust Pages</button>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-title">③ Write &amp; Publish Silo</div>
        <div className="row" style={{ alignItems: 'flex-end' }}>
          <div className="field"><label>How many articles</label><input type="number" value={limit} onChange={(e) => setLimit(+e.target.value)} /></div>
          <div className="field"><label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="draft">draft</option><option value="publish">publish</option></select>
          </div>
          <div className="field"><button className="btn" onClick={() => act(() => api.writeSilo({ siteId, status, limit }), `${limit} articles`)}>Queue {limit} Articles</button></div>
        </div>
        {silo && <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>Silo ready: {silo.pillars?.length} pillars · {silo.totalArticles} articles mapped</p>}
        {!silo && <p style={{ fontSize: 12, color: 'var(--accent-2)' }}>No silo yet — build it above first.</p>}
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-title">◆ Write Queue</div>
        {jobs.filter((j) => j.job_type === 'write' || j.site_id === siteId).length === 0
          ? <div className="empty">No write jobs yet.</div>
          : (
            <table>
              <thead><tr><th>Keyword</th><th>Type</th><th>Status</th><th>URL</th></tr></thead>
              <tbody>
                {jobs.slice(0, 12).map((j) => (
                  <tr key={j.id}>
                    <td className="mono" style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.keyword}</td>
                    <td><span className="tag">{j.job_type}</span></td>
                    <td><span className={`badge ${j.status}`}>{j.status}</span></td>
                    <td>{j.published_urls?.[0] ? <a href={j.published_urls[0]} target="_blank" rel="noreferrer">view ↗</a> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}
