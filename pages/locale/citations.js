import useSWR from 'swr';
import { fetchers } from '../../lib/api';
export default function LocaleCitations() {
  const { data: sites = [] } = useSWR('sites', fetchers.sites);
  const localeSites = sites.filter(s => s.engine === 'locale');
  return (
    <div className="fade-in">
      <div className="page-head"><div><div className="flex" style={{gap:10}}><div className="page-title">Citations</div><span className="engine-tag locale">Locale</span></div><div className="page-sub">M05 Entity Builder — NAP submissions to high-DA directories</div></div></div>
      <div className="grid grid-3" style={{marginBottom:14}}>
        {[{label:'Tier 1 Directories',value:'12',meta:'DA 85+'},{label:'Tier 2 Directories',value:'6',meta:'DA 45-84'},{label:'Auto-Submit',value:'✅',meta:'browser automation'}].map(s=>(
          <div key={s.label} className="stat locale"><div className="stat-label">{s.label}</div><div className="stat-value">{s.value}</div><div className="stat-meta">{s.meta}</div></div>
        ))}
      </div>
      <div className="panel">
        <div className="panel-title">◻ Directory Status</div>
        {localeSites.length === 0 ? <div className="empty">Add local sites first.</div> : (
          <table><thead><tr><th>Site</th><th>Submitted</th><th>Live</th><th>Pending</th></tr></thead>
          <tbody>{localeSites.map(s=>(
            <tr key={s.id}><td style={{fontWeight:600}}>{s.name}</td><td className="mono">—</td><td className="mono">—</td><td><button className="btn locale sm">Build Citations</button></td></tr>
          ))}</tbody></table>
        )}
      </div>
    </div>
  );
}
