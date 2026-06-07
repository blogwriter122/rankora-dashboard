import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function LocaleAgency() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.localePortfolio().then(setStats).catch(() => {}); }, []);

  return (
    <div className="fade-in">
      <div className="page-head"><div><div className="flex" style={{gap:10}}><div className="page-title">Agency Panel</div><span className="engine-tag locale">Locale</span></div><div className="page-sub">M11 — portfolio dashboard, white-label reports, rank & rent payments</div></div></div>

      <div className="grid grid-4" style={{marginBottom:14}}>
        <div className="stat locale"><div className="stat-label">Total Sites</div><div className="stat-value">{stats?.totalSites ?? '—'}</div></div>
        <div className="stat go"><div className="stat-label">Ranking Page 1</div><div className="stat-value">{stats?.rankingPage1 ?? '—'}</div></div>
        <div className="stat reach"><div className="stat-label">Page 2-3</div><div className="stat-value">{stats?.rankingPage2_3 ?? '—'}</div></div>
        <div className="stat"><div className="stat-label">Avg Koneqti</div><div className="stat-value">{stats?.avgKoneqti ?? '—'}</div></div>
      </div>

      <div className="grid grid-2">
        <div className="panel">
          <div className="panel-title">◈ Rank & Rent Calculator</div>
          <RentCalc />
        </div>
        <div className="panel"><div className="panel-title">⚙ Agency Features</div>
          {[
            ['White-label monthly reports', 'M11 — Claude-generated, client-safe'],
            ['Rank & rent pricing', 'leads × value × rental %'],
            ['Portfolio dashboard', 'all sites, ranking status, scores'],
            ['Alert system', 'ranking drops, site issues'],
            ['Chrome profile pool', '20 profiles → 200 pages/day'],
          ].map(([f, d]) => (
            <div key={f} style={{padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
              <div className="flex" style={{fontSize:13}}><span style={{color:'var(--go)',marginRight:8}}>✓</span><strong>{f}</strong></div>
              <div style={{fontSize:11,color:'var(--text-faint)',marginLeft:24}}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RentCalc() {
  const [leads, setLeads] = useState(40);
  const [value, setValue] = useState(100);
  const [pct, setPct] = useState(25);
  const monthly = Math.round(leads * value * (pct / 100));
  return (
    <div>
      <div className="row">
        <div className="field"><label>Leads/month</label><input type="number" value={leads} onChange={e=>setLeads(+e.target.value)} /></div>
        <div className="field"><label>Lead value $</label><input type="number" value={value} onChange={e=>setValue(+e.target.value)} /></div>
        <div className="field"><label>Rental %</label><input type="number" value={pct} onChange={e=>setPct(+e.target.value)} /></div>
      </div>
      <div className="success-msg" style={{marginTop:8}}>
        Monthly rent: <strong style={{fontFamily:'var(--mono)',fontSize:18}}>${monthly}/mo</strong>
        <div style={{fontSize:11,opacity:.8,marginTop:4}}>{leads} leads × ${value} × {pct}%</div>
      </div>
    </div>
  );
}
