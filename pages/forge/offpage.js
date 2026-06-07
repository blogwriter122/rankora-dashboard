import useSWR from 'swr';
import { fetchers } from '../../lib/api';

export default function ForgeOffpage() {
  const { data: sites = [] } = useSWR('sites', fetchers.sites, { refreshInterval: 30000 });
  const forgeSites = sites.filter(s => !s.engine || s.engine === 'forge');
  const unlocked = forgeSites.filter(s => s.offpage_unlocked);
  const locked = forgeSites.filter(s => !s.offpage_unlocked);

  return (
    <div className="fade-in">
      <div className="page-head"><div><div className="flex" style={{gap:10}}><div className="page-title">Offpage Engine</div><span className="engine-tag forge">Forge</span></div><div className="page-sub">Auto-unlocks at 5 clicks/day for 3 consecutive days · Nandla Strategy</div></div></div>
      <div className="grid grid-3" style={{marginBottom:14}}>
        <div className="stat go"><div className="stat-label">Unlocked</div><div className="stat-value">{unlocked.length}</div><div className="stat-meta">offpage running</div></div>
        <div className="stat"><div className="stat-label">Locked</div><div className="stat-value">{locked.length}</div><div className="stat-meta">waiting for 5 clicks/day</div></div>
        <div className="stat reach"><div className="stat-label">Strategies</div><div className="stat-value">3</div><div className="stat-meta">Forum · PDF · SoftRank</div></div>
      </div>
      <div className="grid grid-3" style={{marginBottom:14}}>
        {[
          { title: 'Nandla Forum Strategy', desc: 'Post on niche forums with contextual links. Builds topical authority.', status: 'Ready' },
          { title: 'PDF Backlinks', desc: 'Convert pillar articles to PDFs. Submit to SlideShare, Scribd, Issuu (DA 90+).', status: 'Ready' },
          { title: 'SoftRank', desc: 'Chrome extension + web app with embedded money site links.', status: 'Coming Soon' },
        ].map(s => (
          <div key={s.title} className="panel">
            <div style={{fontWeight:700,marginBottom:6}}>{s.title}</div>
            <div style={{fontSize:12,color:'var(--text-dim)',marginBottom:12}}>{s.desc}</div>
            <span className={`badge ${s.status === 'Ready' ? 'go' : 'pending'}`}>{s.status}</span>
          </div>
        ))}
      </div>
      <div className="panel">
        <div className="panel-title">🔗 Site Status</div>
        {forgeSites.length === 0 ? <div className="empty">No sites yet.</div> : (
          <table><thead><tr><th>Site</th><th>Status</th><th>Clicks</th><th>Streak</th><th>Forum</th><th>PDF</th></tr></thead>
          <tbody>{forgeSites.map(s=>(
            <tr key={s.id}>
              <td style={{fontWeight:600}}>{s.name}</td>
              <td>{s.offpage_unlocked ? <span className="badge go">🔓 UNLOCKED</span> : <span className="badge low">🔒 LOCKED</span>}</td>
              <td className="mono">{s.daily_clicks||0}/day</td>
              <td className="mono">—</td>
              <td>{s.offpage_unlocked ? <button className="btn ghost sm">Run</button> : '—'}</td>
              <td>{s.offpage_unlocked ? <button className="btn ghost sm">Build PDF</button> : '—'}</td>
            </tr>
          ))}</tbody></table>
        )}
      </div>
    </div>
  );
}
