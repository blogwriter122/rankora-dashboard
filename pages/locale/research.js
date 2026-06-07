import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { fetchers, api } from '../../lib/api';

export default function LocaleResearch() {
  const { data: sites = [], mutate } = useSWR('sites', fetchers.sites, { refreshInterval: 8000 });
  const [siteId, setSiteId] = useState('');
  const [scale, setScale] = useState('single');
  const [competitor, setCompetitor] = useState('');
  const [locations, setLocations] = useState('');   // multi: "Dallas,TX\nAustin,TX"
  const [states, setStates] = useState('TX,CA,FL');  // nationwide
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');

  const localeSites = sites.filter(s => s.engine === 'locale');
  const site = localeSites.find(s => s.id === siteId);
  const plan = site?.battle_plan;
  const battle = plan?.battle;
  const scalePlan = plan?.scalePlan;

  // When a site is picked, default the scale selector to the site's saved scale
  useEffect(() => { if (site?.scale) setScale(site.scale); }, [siteId]);

  const run = async (type, payload, label) => {
    setBusy(label);
    try { await api.localeRun({ type, siteId, payload }); setMsg(`${label} queued ✓`); mutate(); setTimeout(() => setMsg(''), 4000); }
    catch (e) { alert(e.message); }
    setBusy('');
  };

  const runBattle = () => run('battle', { niche: site.niche, city: site.city, state: site.state, country: site.country }, 'Battle');
  const runResearch = () => run('research', { niche: site.niche, city: site.city, state: site.state, country: site.country, language: site.language }, 'Research');
  const runScale = () => {
    const payload = { niche: site.niche, scale };
    if (scale === 'single') { payload.city = site.city; payload.state = site.state; }
    if (scale === 'multi') {
      payload.locations = locations.split('\n').map(l => { const [city, st] = l.split(','); return { city: city?.trim(), state: st?.trim() }; }).filter(l => l.city);
    }
    if (scale === 'nationwide') { payload.states = states.split(',').map(s => s.trim().toUpperCase()); payload.topCitiesPerState = 5; }
    run('scale', payload, 'Scale plan');
  };

  return (
    <div className="fade-in">
      <div className="page-head">
        <div><div className="flex" style={{gap:10}}><div className="page-title">Research &amp; Battle</div><span className="engine-tag locale">Locale</span></div>
        <div className="page-sub">Competitor battle · keyword research · single / multi-location / nationwide architecture</div></div>
        {msg && <span className="badge go">{msg}</span>}
      </div>

      <div className="field" style={{maxWidth:380}}>
        <label>Local Site</label>
        <select value={siteId} onChange={e => setSiteId(e.target.value)}>
          <option value="">— select —</option>
          {localeSites.map(s => <option key={s.id} value={s.id}>{s.name} — {s.city}, {s.state}</option>)}
        </select>
      </div>

      {site && (
        <>
          {/* Scale selector */}
          <div className="panel" style={{marginTop:10, marginBottom:14}}>
            <div className="panel-title">⬚ Location Scale</div>
            <div className="row" style={{marginBottom:14}}>
              {[
                { k:'single', t:'Single Location', d:'One city. Classic rank & rent.' },
                { k:'multi', t:'Multi-Location', d:'Several cities, one business.' },
                { k:'nationwide', t:'Nationwide', d:'State → city pyramid.' },
              ].map(opt => (
                <button key={opt.k} className={`btn ${scale===opt.k?'locale':'ghost'}`} onClick={() => setScale(opt.k)} style={{flexDirection:'column', alignItems:'flex-start', padding:'12px 14px', height:'auto'}}>
                  <span style={{fontWeight:700}}>{opt.t}</span>
                  <span style={{fontSize:10, opacity:.7, fontWeight:400, marginTop:2}}>{opt.d}</span>
                </button>
              ))}
            </div>

            {scale === 'single' && <p style={{fontSize:12, color:'var(--text-dim)'}}>Builds: home + service pages + neighborhood area pages for <strong>{site.city}, {site.state}</strong>.</p>}
            {scale === 'multi' && (
              <div className="field"><label>Locations (one per line: City,State)</label>
                <textarea rows={4} value={locations} onChange={e => setLocations(e.target.value)} placeholder={'Dallas,TX\nAustin,TX\nHouston,TX'} /></div>
            )}
            {scale === 'nationwide' && (
              <div className="field"><label>Target States (comma separated, blank = all major)</label>
                <input value={states} onChange={e => setStates(e.target.value)} placeholder="TX,CA,FL,NY" />
                <div style={{fontSize:11,color:'var(--text-faint)',marginTop:4}}>Each state → ~5 city pages. 10 states ≈ 50+ city pages.</div></div>
            )}
            <button className="btn locale" style={{marginTop:8}} disabled={!!busy} onClick={runScale}>
              {busy==='Scale plan' ? <><span className="spin">◌</span> Building…</> : `Build ${scale} Architecture`}
            </button>
            {scalePlan && <span className="badge locale" style={{marginLeft:10}}>{scalePlan.total} pages · {scalePlan.scale}</span>}
          </div>

          {/* Battle + Research actions */}
          <div className="grid grid-2">
            <div className="panel">
              <div className="panel-title">⚔ Competitor Battle</div>
              <p style={{fontSize:12,color:'var(--text-dim)',marginBottom:12}}>Analyzes the Local Pack (map 3-pack) + organic results for <strong>{site.niche} {site.city}</strong>. Finds directories, thin sites, missing schema, weak review counts.</p>
              <div className="flex" style={{gap:8}}>
                <button className="btn locale" disabled={!!busy} onClick={runBattle}>{busy==='Battle'?<><span className="spin">◌</span> Analyzing…</>:'⚔ Run Battle Analysis'}</button>
                <button className="btn ghost" disabled={!!busy} onClick={runResearch}>{busy==='Research'?'…':'Keyword Research'}</button>
              </div>
            </div>

            <div className="panel">
              <div className="panel-title">⚖ Battle Verdict</div>
              {!battle ? <div className="empty">No battle analysis yet.</div> : (
                <div>
                  <div className="flex-between" style={{marginBottom:10}}>
                    <span className="verdict" style={{color: battle.verdict==='GO'?'var(--go)':'var(--skip)'}}>{battle.verdict}</span>
                    <span className={`badge ${battle.verdict==='GO'?'go':'skip'}`}>{battle.confidence}</span>
                  </div>
                  <p style={{fontSize:12,color:'var(--text-dim)',marginBottom:10}}>{battle.summary}</p>
                  <div className="flex" style={{flexWrap:'wrap',gap:6}}>
                    <span className="tag">{battle.signals?.directoryCount} directories</span>
                    <span className="tag">{battle.signals?.realSiteCount} real sites</span>
                    <span className="tag">{battle.signals?.thinSites} thin</span>
                    <span className="tag">{battle.signals?.weakPack} weak map listings</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Battle detail */}
          {battle && (
            <div className="grid grid-2" style={{marginTop:14}}>
              <div className="panel">
                <div className="panel-title">🗺 Local Pack (Map 3-Pack)</div>
                {battle.localPack?.length ? (
                  <table><thead><tr><th>Business</th><th>Rating</th><th>Reviews</th></tr></thead>
                  <tbody>{battle.localPack.map((b,i)=>(
                    <tr key={i}><td>{b.name}</td><td className="mono">{b.rating||'—'}</td><td className="mono">{b.reviews||0}</td></tr>
                  ))}</tbody></table>
                ) : <div className="empty">No map pack detected.</div>}
              </div>
              <div className="panel">
                <div className="panel-title">🎯 Gaps to Exploit</div>
                {battle.gapsToFill?.map((g,i)=>(
                  <div key={i} style={{fontSize:12,padding:'4px 0',color:'var(--text-dim)'}}>
                    <span className={`badge ${g.priority}`}>{g.type}</span> {g.action}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Page plan preview */}
          {scalePlan?.pages?.length > 0 && (
            <div className="panel" style={{marginTop:14}}>
              <div className="panel-title">▤ Page Plan ({scalePlan.pages.length} pages)</div>
              {scalePlan.summary && <p style={{fontSize:12,color:'var(--text-faint)',marginBottom:10}}>{scalePlan.summary}</p>}
              <div style={{maxHeight:300, overflowY:'auto'}}>
                <table><thead><tr><th>Type</th><th>Title</th><th>Keyword</th></tr></thead>
                <tbody>{scalePlan.pages.slice(0,50).map((p,i)=>(
                  <tr key={i}><td><span className="tag">{p.type}</span></td><td>{p.title}</td><td className="mono" style={{fontSize:11,color:'var(--text-faint)'}}>{p.kw||'—'}</td></tr>
                ))}</tbody></table>
              </div>
              <button className="btn locale" style={{marginTop:12}} disabled={!!busy} onClick={() => run('content', {}, 'Content')}>Write All Pages</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
