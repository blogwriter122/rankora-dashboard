import useSWR from 'swr';
import { fetchers } from '../lib/api';

export default function Accounts() {
  const { data: accounts = [] } = useSWR('accounts', fetchers.accounts, { refreshInterval: 15000 });

  const active = accounts.filter((a) => a.status === 'active').length;
  const warmup = accounts.filter((a) => a.status === 'warmup').length;
  const banned = accounts.filter((a) => a.status === 'banned').length;

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="page-title">Platform Accounts</div>
          <div className="page-sub">Health, warmup status, and daily publishing limits</div>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <div className="stat"><div className="stat-label">Total</div><div className="stat-value">{accounts.length}</div></div>
        <div className="stat"><div className="stat-label">Active</div><div className="stat-value">{active}</div></div>
        <div className="stat amber"><div className="stat-label">Warmup</div><div className="stat-value">{warmup}</div></div>
        <div className="stat info"><div className="stat-label">Banned</div><div className="stat-value">{banned}</div></div>
      </div>

      <div className="panel">
        <div className="panel-title">◉ Accounts</div>
        {accounts.length === 0 ? (
          <div className="empty">No accounts yet.<br />Add via CLI: <span className="mono">node parasite/cli.js add-account &apos;&#123;...&#125;&apos;</span></div>
        ) : (
          <table>
            <thead><tr><th>Platform</th><th>Username</th><th>Status</th><th>Today</th><th>Limit</th><th>Warmup</th><th>Last Used</th></tr></thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id}>
                  <td><span className="tag">{a.platform}</span></td>
                  <td className="mono">{a.username || '—'}</td>
                  <td><span className={`badge ${a.status}`}>{a.status}</span></td>
                  <td className="mono">{a.published_today || 0}</td>
                  <td className="mono">{a.daily_limit}</td>
                  <td className="mono">{a.warmup_day ? `day ${a.warmup_day}` : '—'}</td>
                  <td style={{ fontSize: 11, color: 'var(--text-faint)' }}>{a.last_used ? new Date(a.last_used).toLocaleString() : 'never'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
