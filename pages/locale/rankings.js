import useSWR from 'swr';
import { fetchers } from '../../lib/api';
export default function LocaleRankings() {
  const { data: sites = [] } = useSWR('sites', fetchers.sites, { refreshInterval: 30000 });
  const localeSites = sites.filter(s => s.engine === 'locale');
  return (
    <div className="fade-in">
      <div className="page-head"><div><div className="flex" style={{gap:10}}><div className="page-title">Rankings</div><span className="engine-tag locale">Locale</span></div><div className="page-sub">M10 Rank Tracker + Koneqti Score</div></div></div>
      <div className="panel">
        <div className="panel-title">📈 Site Rankings</div>
        {localeSites.length === 0 ? <div className="empty">No local sites yet.</div> : (
          <table><thead><tr><th>Site</th><th>Niche</th><th>City</th><th>Koneqti Score</th><th>Clicks/day</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>{localeSites.map(s=>(
            <tr key={s.id}>
              <td style={{fontWeight:600}}>{s.name}</td>
              <td className="mono">{s.niche}</td>
              <td>{s.city}, {s.state}</td>
              <td>
                {s.koneqti_score ? (
                  <div><div className="mono">{s.koneqti_score}/100</div>
                  <div className="score-bar"><div className="score-fill" style={{width:`${s.koneqti_score}%`,background:s.koneqti_score>=70?'var(--go)':s.koneqti_score>=50?'var(--reach)':'var(--skip)'}} /></div></div>
                ) : '—'}
              </td>
              <td className="mono">{s.daily_clicks||0}</td>
              <td>{s.offpage_unlocked ? <span className="badge go">🔓 offpage on</span> : <span className="badge low">locked</span>}</td>
              <td><button className="btn locale sm">Check GSC</button></td>
            </tr>
          ))}</tbody></table>
        )}
      </div>
    </div>
  );
}
