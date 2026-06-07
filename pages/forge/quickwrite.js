import { useState } from 'react';
import useSWR from 'swr';
import { fetchers, api } from '../../lib/api';

export default function QuickWrite() {
  const { data: sites = [] } = useSWR('sites', fetchers.sites);
  const [siteId, setSiteId] = useState('');
  const [mode, setMode] = useState('keywords');  // keywords | sheets
  const [keywords, setKeywords] = useState('');
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [status, setStatus] = useState('publish');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const forgeSites = sites.filter(s => !s.engine || s.engine === 'forge');

  async function launch() {
    if (!siteId) return alert('Select a site first');
    if (mode === 'keywords' && !keywords.trim()) return alert('Enter at least one keyword');
    if (mode === 'sheets' && !sheetsUrl.trim()) return alert('Enter Google Sheets URL');
    setBusy(true);
    try {
      const kwList = mode === 'keywords'
        ? keywords.split('\n').map(k => k.trim()).filter(Boolean)
        : [];
      await api.write({
        siteId,
        keywords: kwList,
        sheetUrl: mode === 'sheets' ? sheetsUrl : null,
        status,
        jobType: 'quickwrite',
      });
      setMsg(`✅ ${kwList.length || 'Sheet'} queued — worker will write + publish`);
      setKeywords('');
    } catch (e) { alert('Failed: ' + e.message); }
    setBusy(false);
  }

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="flex" style={{ gap: 10 }}>
            <div className="page-title">Quick Write</div>
            <span className="engine-tag forge">Forge</span>
          </div>
          <div className="page-sub">Upgraded BlogBot — give keywords or Google Sheet → writes + publishes automatically</div>
        </div>
      </div>

      {msg && <div className="success-msg" style={{ marginBottom: 16 }}>{msg}</div>}

      <div className="grid grid-2">
        <div className="panel">
          <div className="panel-title">✎ Write Configuration</div>

          <div className="field">
            <label>Target Site</label>
            <select value={siteId} onChange={e => setSiteId(e.target.value)}>
              <option value="">— select site —</option>
              {forgeSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="row" style={{ marginBottom: 16 }}>
            <button className={`btn ${mode === 'keywords' ? '' : 'ghost'}`} onClick={() => setMode('keywords')}>Type Keywords</button>
            <button className={`btn ${mode === 'sheets' ? '' : 'ghost'}`} onClick={() => setMode('sheets')}>Google Sheet</button>
          </div>

          {mode === 'keywords' && (
            <div className="field">
              <label>Keywords (one per line)</label>
              <textarea rows={8} value={keywords} onChange={e => setKeywords(e.target.value)}
                placeholder={'best keto breakfast ideas\nketo for beginners\nketo vs paleo\nhow to start keto diet'} />
              <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>
                {keywords.split('\n').filter(k => k.trim()).length} keywords
              </div>
            </div>
          )}

          {mode === 'sheets' && (
            <div className="field">
              <label>Google Sheets URL (same format as BlogBot)</label>
              <input value={sheetsUrl} onChange={e => setSheetsUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..." />
              <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6 }}>
                Sheet must have a "Title" or "Keyword" column and optional "Status" column.<br />
                Bot reads pending rows, writes each, marks done.
              </div>
            </div>
          )}

          <div className="row" style={{ alignItems: 'flex-end' }}>
            <div className="field">
              <label>Publish Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="publish">Publish immediately</option>
                <option value="draft">Save as draft</option>
              </select>
            </div>
            <div className="field">
              <button className="btn" style={{ marginTop: 22, width: '100%' }} onClick={launch} disabled={busy || !siteId}>
                {busy ? <><span className="spin">◌</span> Queuing…</> : '▶ Start Writing'}
              </button>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">⚡ Upgraded vs BlogBot</div>
          <table>
            <thead><tr><th>Feature</th><th>BlogBot</th><th>Quick Write</th></tr></thead>
            <tbody>
              {[
                ['Input', 'Google Sheets', 'Sheets + Dashboard'],
                ['Research', '❌ None', '✅ PAA + NLP + Gaps'],
                ['Prompt', 'Basic', 'SEO+AEO+GEO Master'],
                ['Meta', '❌ None', '✅ Title + Description'],
                ['FAQ', '❌ None', '✅ Auto-generated'],
                ['Schema', '❌ None', '✅ JSON-LD injected'],
                ['QC Check', '❌ None', '✅ Auto-retry if fail'],
                ['Indexing', '❌ None', '✅ IndexNow ping'],
              ].map(([f, old, nw]) => (
                <tr key={f}>
                  <td style={{ fontWeight: 600 }}>{f}</td>
                  <td style={{ color: 'var(--text-faint)', fontSize: 12 }}>{old}</td>
                  <td style={{ color: 'var(--go)', fontSize: 12 }}>{nw}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
