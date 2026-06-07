import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function ReachAnalytics() {
  const [rev, setRev] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => api.reachRevenue().then(setRev).catch(() => {});
  useEffect(() => { load(); }, []);

  const refresh = async () => {
    setBusy(true);
    try { await api.reachRevenueRefresh(); await load(); } catch (e) { alert(e.message); }
    setBusy(false);
  };

  const s = rev?.streams || {};
  const fmt = (n) => '$' + (n || 0).toLocaleString();

  return (
    <div className="fade-in">
      <div className="page-head">
        <div><div className="flex" style={{gap:10}}><div className="page-title">Analytics</div><span className="engine-tag reach">Reach</span></div>
        <div className="page-sub">Revenue across all 4 streams — ads, affiliate, CPA, PDF</div></div>
        <button className="btn reach" onClick={refresh} disabled={busy}>{busy ? 'Refreshing…' : '↻ Refresh Estimates'}</button>
      </div>

      <div className="grid grid-4" style={{marginBottom:16}}>
        <div className="stat go"><div className="stat-label">Total Revenue</div><div className="stat-value">{fmt(rev?.total)}</div><div className="stat-meta">est. monthly</div></div>
        <div className="stat reach"><div className="stat-label">Articles</div><div className="stat-value">{rev?.articles ?? '—'}</div><div className="stat-meta">published</div></div>
        <div className="stat"><div className="stat-label">Total Clicks</div><div className="stat-value">{(rev?.totalClicks || 0).toLocaleString()}</div><div className="stat-meta">monthly</div></div>
        <div className="stat locale"><div className="stat-label">Avg / Article</div><div className="stat-value">{rev?.articles ? fmt(Math.round(rev.total / rev.articles)) : '—'}</div></div>
      </div>

      <div className="grid grid-4" style={{marginBottom:16}}>
        <div className="stat"><div className="stat-label">💰 Display Ads</div><div className="stat-value">{fmt(s.ads)}</div></div>
        <div className="stat"><div className="stat-label">🔗 Affiliate</div><div className="stat-value">{fmt(s.affiliate)}</div></div>
        <div className="stat"><div className="stat-label">📋 CPA</div><div className="stat-value">{fmt(s.cpa)}</div></div>
        <div className="stat"><div className="stat-label">📄 PDF Sales</div><div className="stat-value">{fmt(s.pdf)}</div></div>
      </div>

      <div className="grid grid-2">
        <div className="panel">
          <div className="panel-title">▤ Revenue by Platform</div>
          {rev && Object.keys(rev.byPlatform || {}).length ? (
            <table><thead><tr><th>Platform</th><th>Revenue</th></tr></thead>
            <tbody>{Object.entries(rev.byPlatform).sort((a,b)=>b[1]-a[1]).map(([p,v])=>(
              <tr key={p}><td><span className="tag">{p}</span></td><td className="mono">{fmt(Math.round(v))}</td></tr>
            ))}</tbody></table>
          ) : <div className="empty">No revenue data yet.</div>}
        </div>
        <div className="panel">
          <div className="panel-title">▤ Revenue by Niche</div>
          {rev && Object.keys(rev.byNiche || {}).length ? (
            <table><thead><tr><th>Niche</th><th>Revenue</th></tr></thead>
            <tbody>{Object.entries(rev.byNiche).sort((a,b)=>b[1]-a[1]).map(([n,v])=>(
              <tr key={n}><td>{n}</td><td className="mono">{fmt(Math.round(v))}</td></tr>
            ))}</tbody></table>
          ) : <div className="empty">No niche data yet.</div>}
        </div>
      </div>

      <p style={{fontSize:11,color:'var(--text-faint)',marginTop:14}}>
        Ad revenue is estimated from clicks × niche RPM (Monumetric targets). Affiliate/CPA/PDF are actual recorded conversions. Click "Refresh Estimates" after rank tracking updates clicks.
      </p>
    </div>
  );
}
