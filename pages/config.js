import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export default function Config() {
  const [cfg, setCfg] = useState({ daily_target: 5, profile_mode: 'own', affiliate_dictionary: {}, cpa_offers: {} });
  const [affName, setAffName] = useState('');
  const [affUrl, setAffUrl] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => { api.getConfig().then(c => { if (c?.data) setCfg(prev => ({ ...prev, ...c.data, daily_target: c.daily_target || 5 })); }).catch(() => {}); }, []);

  const save = async () => {
    try { await api.saveConfig(cfg); setMsg('Saved ✓'); setTimeout(() => setMsg(''), 3000); }
    catch (e) { alert(e.message); }
  };
  const addAff = () => {
    if (!affName || !affUrl) return;
    setCfg({ ...cfg, affiliate_dictionary: { ...cfg.affiliate_dictionary, [affName]: affUrl } });
    setAffName(''); setAffUrl('');
  };
  const removeAff = (k) => {
    const d = { ...cfg.affiliate_dictionary }; delete d[k];
    setCfg({ ...cfg, affiliate_dictionary: d });
  };

  return (
    <div className="fade-in">
      <div className="page-head">
        <div><div className="page-title">System Config</div><div className="page-sub">Global settings — affiliate dictionary, CPA, publishing pace</div></div>
        <button className="btn" onClick={save}>Save Config</button>
      </div>
      {msg && <div className="success-msg" style={{marginBottom:14}}>{msg}</div>}

      <div className="grid grid-2">
        <div className="panel">
          <div className="panel-title">⚙ Publishing</div>
          <div className="field"><label>Daily Article Target</label><input type="number" value={cfg.daily_target} onChange={e=>setCfg({...cfg,daily_target:+e.target.value})} /></div>
          <div className="field"><label>Profile Mode</label>
            <select value={cfg.profile_mode} onChange={e=>setCfg({...cfg,profile_mode:e.target.value})}>
              <option value="own">Own Playwright Profiles</option>
              <option value="adspower">AdsPower</option>
            </select>
          </div>
          <div className="field"><label>Queue Threshold (auto-discover below)</label><input type="number" value={cfg.queue_threshold||30} onChange={e=>setCfg({...cfg,queue_threshold:+e.target.value})} /></div>
        </div>

        <div className="panel">
          <div className="panel-title">🔗 Affiliate Dictionary</div>
          <p style={{fontSize:11,color:'var(--text-faint)',marginBottom:10}}>Product name → affiliate URL. Auto-injected into every article that mentions the product.</p>
          <div className="row" style={{marginBottom:8}}>
            <input value={affName} onChange={e=>setAffName(e.target.value)} placeholder="NordVPN" />
            <input value={affUrl} onChange={e=>setAffUrl(e.target.value)} placeholder="https://mysite.com/go/nordvpn" />
            <button className="btn ghost sm" onClick={addAff}>Add</button>
          </div>
          {Object.entries(cfg.affiliate_dictionary || {}).map(([k,v]) => (
            <div key={k} className="flex-between" style={{padding:'6px 0',borderBottom:'1px solid var(--border)'}}>
              <span style={{fontSize:13}}><strong>{k}</strong> → <span className="mono" style={{fontSize:11,color:'var(--text-dim)'}}>{v}</span></span>
              <button className="btn ghost sm" onClick={()=>removeAff(k)}>×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
