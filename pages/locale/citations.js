import { useState } from 'react';
import useSWR from 'swr';
import { fetchers, api, supabase } from '../../lib/api';

export default function LocaleCitations() {
  const { data: sites = [] } = useSWR('sites', fetchers.sites);
  const [siteId, setSiteId] = useState('');
  const [msg, setMsg] = useState('');
  const localeSites = sites.filter(s => s.engine === 'locale');

  const { data: citations = [] } = useSWR(
    siteId ? `citations-${siteId}` : null,
    async () => { const { data } = await supabase.from('citations').select('*').eq('site_id', siteId); return data || []; },
    { refreshInterval: 8000 }
  );

  const run = async (type) => {
    if (!siteId) return alert('Select a site');
    try { await api.localeRun({ type, siteId, payload: {} }); setMsg(`${type} queued ✓`); setTimeout(() => setMsg(''), 4000); }
    catch (e) { alert(e.message); }
  };

  const live = citations.filter(c => c.status === 'live').length;
  const submitted = citations.filter(c => c.status === 'submitted').length;

  return (
    <div className="fade-in">
      <div className="page-head"><div><div className="flex" style={{gap:10}}><div className="page-title">Citations</div><span className="engine-tag locale">Locale</span></div><div className="page-sub">M05 Entity Builder — NAP submissions to high-DA directories</div></div>{msg && <span className="badge go">{msg}</span>}</div>

      <div className="field" style={{maxWidth:360}}>
        <label>Local Site</label>
        <select value={siteId} onChange={e => setSiteId(e.target.value)}>
          <option value="">— select —</option>
          {localeSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {siteId && (
        <>
          <div className="grid grid-3" style={{marginBottom:14}}>
            <div className="stat go"><div className="stat-label">Live</div><div className="stat-value">{live}</div></div>
            <div className="stat reach"><div className="stat-label">Submitted</div><div className="stat-value">{submitted}</div></div>
            <div className="stat locale"><div className="stat-label">Total</div><div className="stat-value">{citations.length}</div></div>
          </div>
          <div className="flex" style={{gap:8, marginBottom:14}}>
            <button className="btn locale" onClick={() => run('citations')}>Build Citations</button>
            <button className="btn ghost" onClick={() => run('check_citations')}>Verify Live</button>
          </div>
          <div className="panel">
            <div className="panel-title">◻ Directory Status</div>
            {citations.length === 0 ? <div className="empty">No citations yet. Click "Build Citations" to start.</div> : (
              <table><thead><tr><th>Directory</th><th>DA</th><th>Status</th><th>Submitted</th></tr></thead>
              <tbody>{citations.map(c => (
                <tr key={c.id}>
                  <td style={{fontWeight:600}}>{c.directory}</td>
                  <td className="mono">{c.da}</td>
                  <td><span className={`badge ${c.status === 'live' ? 'go' : c.status === 'submitted' ? 'warmup' : 'pending'}`}>{c.status}</span></td>
                  <td style={{fontSize:11,color:'var(--text-faint)'}}>{c.submitted_at ? new Date(c.submitted_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}</tbody></table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
