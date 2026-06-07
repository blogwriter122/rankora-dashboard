import { useState } from 'react';
import useSWR from 'swr';
import { fetchers, api } from '../../lib/api';
export default function LocaleScorer() {
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [model, setModel] = useState('rank_rent');
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState(null);

  async function score() {
    if (!city) return alert('Enter a city');
    setBusy(true);
    try {
      const r = await api.localeScore({ city, state, country: 'US', model });
      setResults(r);
    } catch(e) { alert('Failed: ' + e.message); }
    setBusy(false);
  }

  const approved = results?.results?.filter(r => r.total >= 70) || [];
  const possible = results?.results?.filter(r => r.total >= 50 && r.total < 70) || [];

  return (
    <div className="fade-in">
      <div className="page-head"><div><div className="flex" style={{gap:10}}><div className="page-title">Niche Scorer</div><span className="engine-tag locale">Locale</span></div><div className="page-sub">6-criterion matrix → scores every viable niche in your city (0–100)</div></div></div>
      <div className="panel" style={{marginBottom:14}}>
        <div className="panel-title">◎ Score Niches</div>
        <div className="row">
          <div className="field"><label>City</label><input value={city} onChange={e=>setCity(e.target.value)} placeholder="Dallas" /></div>
          <div className="field"><label>State</label><input value={state} onChange={e=>setState(e.target.value)} placeholder="TX" /></div>
          <div className="field"><label>Model</label><select value={model} onChange={e=>setModel(e.target.value)}><option value="rank_rent">Rank & Rent</option><option value="client_seo">Client SEO</option></select></div>
          <div className="field" style={{display:'flex',alignItems:'flex-end'}}><button className="btn locale" onClick={score} disabled={busy||!city}>{busy?<><span className="spin">◌</span> Scoring…</>:'Score All Niches'}</button></div>
        </div>
      </div>

      {results && (
        <>
          <div className="grid grid-3" style={{marginBottom:14}}>
            <div className="stat go"><div className="stat-label">Approved (70+)</div><div className="stat-value">{approved.length}</div></div>
            <div className="stat reach"><div className="stat-label">Possible (50-69)</div><div className="stat-value">{possible.length}</div></div>
            <div className="stat locale"><div className="stat-label">City</div><div className="stat-value" style={{fontSize:18}}>{results.city}</div></div>
          </div>
          <div className="panel">
            <div className="panel-title">◎ Scoring Report — {results.city}, {results.state}</div>
            <table>
              <thead><tr><th>Niche</th><th>C1 Intent</th><th>C2 Volume</th><th>C3 Comp</th><th>C4 Lead $</th><th>C5 Season</th><th>C6 City</th><th>Total</th><th>Verdict</th><th></th></tr></thead>
              <tbody>
                {results.results?.map(r => (
                  <tr key={r.niche}>
                    <td style={{fontWeight:600,textTransform:'capitalize'}}>{r.niche}</td>
                    <td className="mono">{r.c1}</td>
                    <td className="mono">{r.c2}</td>
                    <td className="mono">{r.c3}</td>
                    <td className="mono">{r.c4}</td>
                    <td className="mono">{r.c5}</td>
                    <td className="mono">{r.c6}</td>
                    <td><strong className="mono">{r.total}</strong></td>
                    <td><span className={`badge ${r.total>=70?'approved':r.total>=50?'possible':'skip'}`}>{r.total>=70?'✅ Approved':r.total>=50?'⚠️ Possible':'❌ Skip'}</span></td>
                    <td>{r.total >= 50 && <button className="btn locale sm">Research</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
