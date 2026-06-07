import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function NicheFinder() {
  const [mode, setMode] = useState('auto');
  const [niche, setNiche] = useState('');
  const [country, setCountry] = useState('US');
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState(null);

  const load = () => api.nicheResults().then(setResults).catch(() => {});
  useEffect(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, []);

  const runAuto = async () => {
    if (!niche) return alert('Enter a niche');
    setBusy(true);
    try { await api.nicheAuto(niche, country); alert('Auto-find queued — candidates appear below in ~30-60s'); }
    catch (e) { alert(e.message); }
    setBusy(false);
  };
  const runManual = async () => {
    if (!url) return alert('Paste a competitor URL');
    setBusy(true);
    try { await api.nicheManual(url); alert('Validating — result appears below shortly'); }
    catch (e) { alert(e.message); }
    setBusy(false);
  };

  return (
    <div className="fade-in">
      <div className="page-head">
        <div><div className="flex" style={{gap:10}}><div className="page-title">Niche Finder</div><span className="engine-tag forge">Forge</span></div>
        <div className="page-sub">Find weak sites to beat — Auto (bot scrapes + scores) or Manual (paste Ahrefs URL)</div></div>
      </div>

      <div className="row" style={{marginBottom:16, maxWidth:420}}>
        <button className={`btn ${mode==='auto'?'':'ghost'}`} onClick={()=>setMode('auto')}>Auto Mode</button>
        <button className={`btn ${mode==='manual'?'':'ghost'}`} onClick={()=>setMode('manual')}>Manual Mode</button>
      </div>

      {mode === 'auto' ? (
        <div className="panel" style={{marginBottom:16}}>
          <div className="panel-title">🔍 Auto Find</div>
          <div className="row" style={{maxWidth:600}}>
            <input value={niche} onChange={e=>setNiche(e.target.value)} placeholder="keto diet recipes" />
            <select value={country} onChange={e=>setCountry(e.target.value)} style={{maxWidth:100}}>
              {['US','UK','CA','AU','DE','FR','ES'].map(c=><option key={c}>{c}</option>)}
            </select>
            <button className="btn" onClick={runAuto} disabled={busy} style={{whiteSpace:'nowrap'}}>{busy?'…':'Find Sites'}</button>
          </div>
          <p style={{fontSize:11,color:'var(--text-faint)',marginTop:8}}>Bot scrapes Google, checks domain age (WHOIS) + content weakness, scores how beatable each is.</p>
        </div>
      ) : (
        <div className="panel" style={{marginBottom:16}}>
          <div className="panel-title">🔗 Manual (Ahrefs → Bot)</div>
          <div className="row" style={{maxWidth:600}}>
            <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://weaksite.com" />
            <button className="btn" onClick={runManual} disabled={busy} style={{whiteSpace:'nowrap'}}>{busy?'…':'Validate'}</button>
          </div>
          <p style={{fontSize:11,color:'var(--text-faint)',marginTop:8}}>Found a weak site in Ahrefs (low DR + traffic 100k+ + age &lt;18mo)? Paste it → validate → run Battle Plan.</p>
        </div>
      )}

      {results && (
        <div className="panel">
          <div className="panel-title">📋 Results <span className="tag" style={{marginLeft:8}}>{results.mode}</span></div>
          {results.candidates ? (
            <table>
              <thead><tr><th>Domain</th><th>Age</th><th>Words</th><th>Score</th><th>Verdict</th><th>Why</th></tr></thead>
              <tbody>{results.candidates.map((c,i)=>(
                <tr key={i}>
                  <td className="mono">{c.domain}</td>
                  <td className="mono">{c.ageMonths!=null?`${c.ageMonths}mo`:'—'}</td>
                  <td className="mono">{c.wordCount||'—'}</td>
                  <td className="mono">{c.beatableScore}</td>
                  <td>{c.verdict}</td>
                  <td style={{fontSize:11,color:'var(--text-faint)'}}>{(c.reasons||[]).join(', ')}</td>
                </tr>
              ))}</tbody>
            </table>
          ) : (
            <div>
              <div className="flex" style={{gap:10,marginBottom:8}}>
                <span className="mono">{results.domain}</span>
                {results.ready ? <span className="badge go">valid target</span> : <span className="badge skip">could not crawl</span>}
              </div>
              {results.ageMonths!=null && <div style={{fontSize:13}}>Domain age: {results.ageMonths} months</div>}
              {results.signals && <div style={{fontSize:12,color:'var(--text-dim)',marginTop:6}}>{results.signals.wordCount} words · {results.signals.hasSchema?'has schema':'no schema'} · {results.signals.thinContent?'thin':'full'} content</div>}
              <p style={{fontSize:12,color:'var(--text-faint)',marginTop:8}}>{results.note}</p>
            </div>
          )}
          <p style={{fontSize:11,color:'var(--text-faint)',marginTop:12}}>Next: add a site (Forge → Sites) with the niche, then run Research → Battle Plan against the chosen competitor.</p>
        </div>
      )}
    </div>
  );
}
