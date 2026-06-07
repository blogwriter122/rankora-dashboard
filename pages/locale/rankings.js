import useSWR from 'swr';
import { fetchers, api } from '../../lib/api';

export default function LocaleRankings() {
  const { data: sites = [], mutate } = useSWR('sites', fetchers.sites, { refreshInterval: 20000 });
  const localeSites = sites.filter(s => s.engine === 'locale');

  const run = async (type, siteId) => {
    try { await api.localeRun({ type, siteId, payload: {} }); alert(`${type} queued`); mutate(); }
    catch (e) { alert(e.message); }
  };

  return (
    <div className="fade-in">
      <div className="page-head"><div><div className="flex" style={{gap:10}}><div className="page-title">Rankings &amp; Health</div><span className="engine-tag locale">Locale</span></div><div className="page-sub">M10 Rank Tracker + M07 Technical Audit · Koneqti Score</div></div></div>
      <div className="panel">
        <div className="panel-title">📈 Site Health</div>
        {localeSites.length === 0 ? <div className="empty">No local sites yet.</div> : (
          <table><thead><tr><th>Site</th><th>City</th><th>Koneqti Score</th><th>Audit</th><th>Clicks</th><th>Offpage</th><th>Actions</th></tr></thead>
          <tbody>{localeSites.map(s => {
            const audit = s.battle_plan?.audit;
            return (
              <tr key={s.id}>
                <td style={{fontWeight:600}}>{s.name}</td>
                <td>{s.city}, {s.state}</td>
                <td>{s.koneqti_score ? (
                  <div><div className="mono">{s.koneqti_score}/100</div>
                  <div className="score-bar"><div className="score-fill" style={{width:`${s.koneqti_score}%`,background:s.koneqti_score>=70?'var(--go)':s.koneqti_score>=50?'var(--reach)':'var(--skip)'}} /></div></div>
                ) : '—'}</td>
                <td>{audit ? <span className={`badge ${audit.issues?.length > 5 ? 'high' : 'go'}`}>{audit.issues?.length} issues</span> : <span className="tag">not run</span>}</td>
                <td className="mono">{s.daily_clicks || 0}</td>
                <td>{s.offpage_unlocked ? <span className="badge go">🔓 on</span> : <span className="badge low">locked</span>}</td>
                <td><div className="flex" style={{gap:6}}>
                  <button className="btn locale sm" onClick={() => run('rank_check', s.id)}>Check GSC</button>
                  <button className="btn ghost sm" onClick={() => run('audit', s.id)}>Audit</button>
                </div></td>
              </tr>
            );
          })}</tbody></table>
        )}
      </div>

      {localeSites.some(s => s.battle_plan?.audit) && (
        <div className="panel" style={{marginTop:14}}>
          <div className="panel-title">⚙ Latest Audit Issues</div>
          {localeSites.filter(s => s.battle_plan?.audit).map(s => (
            <div key={s.id} style={{marginBottom:16}}>
              <div style={{fontWeight:600, marginBottom:6}}>{s.name} — Health {s.battle_plan.audit.healthScore}/100</div>
              {s.battle_plan.audit.issues?.slice(0, 8).map((iss, i) => (
                <div key={i} style={{fontSize:12, padding:'3px 0', color:'var(--text-dim)'}}>
                  <span className={`badge ${iss.severity === 'critical' ? 'skip' : iss.severity === 'high' ? 'high' : 'low'}`}>{iss.severity}</span> {iss.issue} → <span style={{color:'var(--text-faint)'}}>{iss.fix}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
