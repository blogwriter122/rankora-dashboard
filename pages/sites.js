import { useState } from 'react';
import useSWR from 'swr';
import { fetchers, api } from '../lib/api';

export default function Sites() {
  const { data: sites = [], mutate } = useSWR('sites', fetchers.sites, { refreshInterval: 10000 });
  const [open, setOpen] = useState(false);

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="page-title">Sites</div>
          <div className="page-sub">Build new sites or plug in existing WordPress sites</div>
        </div>
        <button className="btn" onClick={() => setOpen(true)}>+ Add Site</button>
      </div>

      {sites.length === 0 ? (
        <div className="panel"><div className="empty">No sites yet. Add your first site to begin.</div></div>
      ) : (
        <div className="grid grid-3">
          {sites.map((s) => (
            <div key={s.id} className="panel">
              <div className="flex-between" style={{ marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>{s.name}</span>
                <span className={`badge ${s.mode === 'existing' ? 'info' : 'normal'}`}>{s.mode}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }} className="mono">{s.domain || s.wp_url || 'no url'}</div>
              <div className="flex" style={{ flexWrap: 'wrap', marginTop: 10 }}>
                <span className="tag">{s.niche || 'no niche'}</span>
                <span className="tag">{s.country}</span>
                <span className="tag">{s.language}</span>
              </div>
              <div className="flex-between" style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>{s.daily_clicks || 0} clicks/day</span>
                {s.offpage_unlocked ? <span className="badge go">offpage on</span> : <span className="badge low">offpage off</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {open && <AddSiteModal onClose={() => setOpen(false)} onDone={() => { setOpen(false); mutate(); }} />}
    </div>
  );
}

function AddSiteModal({ onClose, onDone }) {
  const [mode, setMode] = useState('build');
  const [f, setF] = useState({
    name: '', niche: '', main_keyword: '', country: 'US', language: 'english',
    wp_url: '', wp_user: '', wp_app_pass: '', competitors: '',
  });
  const [verify, setVerify] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function doVerify() {
    setVerify({ loading: true });
    try {
      const r = await api.verifySite({ wp_url: f.wp_url, wp_user: f.wp_user, wp_app_pass: f.wp_app_pass });
      setVerify(r);
    } catch (e) { setVerify({ ok: false, error: e.message }); }
  }

  async function save() {
    setSaving(true);
    try {
      await api.addSite({
        ...f,
        mode,
        competitors: f.competitors ? f.competitors.split(',').map((x) => x.trim()) : [],
      });
      onDone();
    } catch (e) { alert('Save failed: ' + e.message); setSaving(false); }
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">Add Site</div>

        <div className="row" style={{ marginBottom: 18 }}>
          <button className={`btn ${mode === 'build' ? '' : 'ghost'}`} onClick={() => setMode('build')}>Build New</button>
          <button className={`btn ${mode === 'existing' ? '' : 'ghost'}`} onClick={() => setMode('existing')}>Existing Site</button>
        </div>

        <div className="field"><label>Site Name</label><input value={f.name} onChange={set('name')} placeholder="Keto Authority" /></div>
        <div className="row">
          <div className="field"><label>Niche</label><input value={f.niche} onChange={set('niche')} placeholder="keto diet" /></div>
          <div className="field"><label>Main Keyword</label><input value={f.main_keyword} onChange={set('main_keyword')} placeholder="keto for beginners" /></div>
        </div>
        <div className="row">
          <div className="field"><label>Country</label>
            <select value={f.country} onChange={set('country')}>
              {['US','UK','DE','FR','ES','PK','BR','SA'].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field"><label>Language</label>
            <select value={f.language} onChange={set('language')}>
              {['english','german','french','spanish','arabic','portuguese'].map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="field"><label>WordPress URL</label><input value={f.wp_url} onChange={set('wp_url')} placeholder="https://yoursite.com" /></div>
        <div className="row">
          <div className="field"><label>WP User</label><input value={f.wp_user} onChange={set('wp_user')} placeholder="admin" /></div>
          <div className="field"><label>WP App Password</label><input value={f.wp_app_pass} onChange={set('wp_app_pass')} placeholder="xxxx xxxx xxxx" /></div>
        </div>

        {mode === 'build' && (
          <div className="field"><label>Competitors (comma separated)</label><input value={f.competitors} onChange={set('competitors')} placeholder="https://comp1.com, https://comp2.com" /></div>
        )}

        <div className="flex" style={{ marginTop: 8, marginBottom: 16 }}>
          <button className="btn ghost sm" onClick={doVerify} disabled={!f.wp_url || !f.wp_user}>Verify WP</button>
          {verify?.loading && <span className="spin">◌</span>}
          {verify && !verify.loading && (verify.ok
            ? <span className="badge go">connected as {verify.user}</span>
            : <span className="badge skip">{verify.error}</span>)}
        </div>

        <div className="flex-between" style={{ marginTop: 8 }}>
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={save} disabled={saving || !f.name}>{saving ? 'Saving…' : 'Save Site'}</button>
        </div>
      </div>
    </div>
  );
}
