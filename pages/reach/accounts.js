import useSWR from 'swr';
import { fetchers } from '../../lib/api';
export default function ReachAccounts() {
  const { data: accounts = [] } = useSWR('accounts', fetchers.accounts, { refreshInterval: 15000 });
  return (
    <div className="fade-in">
      <div className="page-head"><div><div className="flex" style={{gap:10}}><div className="page-title">Accounts</div><span className="engine-tag reach">Reach</span></div><div className="page-sub">Platform account health, warmup status, daily limits</div></div></div>
      <div className="grid grid-4" style={{marginBottom:14}}>
        <div className="stat"><div className="stat-label">Total</div><div className="stat-value">{accounts.length}</div></div>
        <div className="stat go"><div className="stat-label">Active</div><div className="stat-value">{accounts.filter(a=>a.status==='active').length}</div></div>
        <div className="stat reach"><div className="stat-label">Warmup</div><div className="stat-value">{accounts.filter(a=>a.status==='warmup').length}</div></div>
        <div className="stat"><div className="stat-label">Banned</div><div className="stat-value">{accounts.filter(a=>a.status==='banned').length}</div></div>
      </div>
      <div className="panel">
        <div className="panel-title">◉ Accounts</div>
        {accounts.length === 0 ? <div className="empty">No accounts yet.<br /><span className="mono" style={{fontSize:11}}>node reach/cli.js add-account</span></div> : (
          <table><thead><tr><th>Platform</th><th>Username</th><th>Status</th><th>Warmup</th><th>Today</th><th>Effective Limit</th><th>Last Used</th></tr></thead>
          <tbody>{accounts.map(a=>(
            <tr key={a.id}>
              <td><span className="tag">{a.platform}</span></td>
              <td className="mono">{a.username||'—'}</td>
              <td><span className={`badge ${a.status}`}>{a.status}</span></td>
              <td className="mono">{a.status==='warmup' ? `day ${a.warmup_day||1}` : '—'}</td>
              <td className="mono">{a.published_today||0}</td>
              <td className="mono">{a.status==='warmup' ? ((a.warmup_day||1)<=7?1:(a.warmup_day||1)<=14?2:a.daily_limit) : a.daily_limit}</td>
              <td style={{fontSize:11,color:'var(--text-faint)'}}>{a.last_used ? new Date(a.last_used).toLocaleString() : 'never'}</td>
            </tr>
          ))}</tbody></table>
        )}
      </div>
    </div>
  );
}
