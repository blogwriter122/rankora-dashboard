import { useState } from 'react';
import useSWR from 'swr';
import { fetchers, supabase } from '../lib/api';

const LIBRARY = [
  'Word Counter', 'AI Text Humanizer', 'Case Converter', 'Hashtag Generator',
  'BMI Calculator', 'Meta Description Generator', 'Blog Income Calculator',
  'QR Code Generator', 'Loan EMI Calculator', 'Password Generator',
];

export default function Tools() {
  const { data: tools = [] } = useSWR('tools', fetchers.tools, { refreshInterval: 10000 });
  const { data: sites = [] } = useSWR('sites', fetchers.sites);
  const [siteId, setSiteId] = useState('');
  const [msg, setMsg] = useState('');

  // Note: tools are queued via the WP queue. The dashboard writes a job row;
  // the tools-builder worker picks it up. Here we insert a tool request row.
  async function build(name) {
    if (!siteId) return alert('Pick a site');
    try {
      await supabase.from('tools').insert({
        site_id: siteId, name, keyword: name.toLowerCase(), status: 'pending',
      });
      setMsg(`${name} requested — worker will build & publish`);
      setTimeout(() => setMsg(''), 4000);
    } catch (e) { alert('Failed: ' + e.message); }
  }

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="page-title">Tools Empire</div>
          <div className="page-sub">Generate interactive tools → 4-6 pageviews per visitor</div>
        </div>
        {msg && <span className="badge go">{msg}</span>}
      </div>

      <div className="field" style={{ maxWidth: 360 }}>
        <label>Target Site</label>
        <select value={siteId} onChange={(e) => setSiteId(e.target.value)}>
          <option value="">— select site —</option>
          {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="panel" style={{ marginTop: 8 }}>
        <div className="panel-title">⚒ Tool Library</div>
        <div className="grid grid-3">
          {LIBRARY.map((name) => {
            const built = tools.find((t) => t.name === name && t.site_id === siteId);
            return (
              <div key={name} className="panel" style={{ padding: 16 }}>
                <div className="flex-between">
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{name}</span>
                  {built ? <span className={`badge ${built.status === 'published' ? 'done' : 'pending'}`}>{built.status}</span> : null}
                </div>
                <button className="btn sm ghost" style={{ marginTop: 12, width: '100%' }} onClick={() => build(name)} disabled={!!built}>
                  {built ? 'Requested' : 'Build & Publish'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {tools.length > 0 && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-title">Built Tools</div>
          <table>
            <thead><tr><th>Name</th><th>Category</th><th>Status</th><th>URL</th></tr></thead>
            <tbody>
              {tools.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td className="mono" style={{ fontSize: 11 }}>{t.category || '—'}</td>
                  <td><span className={`badge ${t.status === 'published' ? 'done' : 'pending'}`}>{t.status}</span></td>
                  <td>{t.wp_page_url ? <a href={t.wp_page_url} target="_blank" rel="noreferrer">view ↗</a> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
