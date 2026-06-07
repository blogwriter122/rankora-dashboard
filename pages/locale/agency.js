export default function LocaleAgency() {
  return (
    <div className="fade-in">
      <div className="page-head"><div><div className="flex" style={{gap:10}}><div className="page-title">Agency Panel</div><span className="engine-tag locale">Locale</span></div><div className="page-sub">M11 — client management, white label reports, rank & rent payments</div></div></div>
      <div className="grid grid-4" style={{marginBottom:14}}>
        {[{l:'Active Clients',v:'0'},{l:'Sites Ranking P1',v:'0'},{l:'Monthly Revenue',v:'$0'},{l:'Sites Rented',v:'0'}].map(s=>(
          <div key={s.l} className="stat locale"><div className="stat-label">{s.l}</div><div className="stat-value">{s.v}</div></div>
        ))}
      </div>
      <div className="grid grid-2">
        <div className="panel"><div className="panel-title">◈ Client List</div><div className="empty">No clients yet.<br />Add clients as you sign them.</div></div>
        <div className="panel"><div className="panel-title">⚙ Agency Features</div>
          {['White-label reports','Automated client onboarding','Rank & rent payment triggers','1000-site master dashboard','Chrome profile pool management'].map(f=>(
            <div key={f} className="flex" style={{padding:'8px 0',borderBottom:'1px solid var(--border)',fontSize:13}}><span style={{color:'var(--go)',marginRight:8}}>✓</span>{f}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
