import { useState } from 'react';
import useSWR from 'swr';
import { fetchers, api } from '../../lib/api';

export default function MoneyPages() {
  const { data: sites = [] } = useSWR('sites', fetchers.sites);
  const { data: published = [] } = useSWR('published', fetchers.published, { refreshInterval: 6000 });
  const [siteId, setSiteId] = useState('');
  const [type, setType] = useState('review');
  const [status, setStatus] = useState('publish');
  const [msg, setMsg] = useState('');

  // review fields
  const [product, setProduct] = useState('');
  const [affUrl, setAffUrl] = useState('');
  // vs fields
  const [vsA, setVsA] = useState('');
  const [vsB, setVsB] = useState('');
  const [vsAUrl, setVsAUrl] = useState('');
  const [vsBUrl, setVsBUrl] = useState('');
  // best fields
  const [category, setCategory] = useState('');
  const [products, setProducts] = useState('');

  const allSites = sites; // money pages can go on any site

  async function launch() {
    if (!siteId) return alert('Select a site');
    let payload = { siteId, type, status };
    if (type === 'review') {
      if (!product) return alert('Enter a product name');
      payload = { ...payload, product, affiliateUrl: affUrl };
    } else if (type === 'vs') {
      if (!vsA || !vsB) return alert('Enter both products');
      payload = { ...payload, a: vsA, b: vsB, links: { a: vsAUrl, b: vsBUrl } };
    } else if (type === 'best') {
      if (!category || !products) return alert('Enter category + products');
      const list = products.split('\n').map(l => { const [name, url] = l.split('|'); return { name: name?.trim(), url: url?.trim() }; }).filter(p => p.name);
      payload = { ...payload, category, products: list };
    }
    try { await api.reachWp(payload); setMsg(`${type} page queued ✓`); setTimeout(() => setMsg(''), 4000); }
    catch (e) { alert(e.message); }
  }

  const moneyPages = published.filter(p => ['own_site'].includes(p.platform) && p.engine === 'reach');

  return (
    <div className="fade-in">
      <div className="page-head">
        <div><div className="flex" style={{gap:10}}><div className="page-title">Money Pages</div><span className="engine-tag reach">Reach</span></div>
        <div className="page-sub">Bot 4 — Review, VS, and Best-of pages with affiliate slots (where traffic converts)</div></div>
        {msg && <span className="badge go">{msg}</span>}
      </div>

      <div className="grid grid-2">
        <div className="panel">
          <div className="panel-title">📝 Create Money Page</div>
          <div className="field">
            <label>Site</label>
            <select value={siteId} onChange={e => setSiteId(e.target.value)}>
              <option value="">— select site —</option>
              {allSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="row" style={{marginBottom:16}}>
            {[{k:'review',t:'Review'},{k:'vs',t:'VS Compare'},{k:'best',t:'Best-of'}].map(o => (
              <button key={o.k} className={`btn sm ${type===o.k?'reach':'ghost'}`} onClick={()=>setType(o.k)} style={{flex:1}}>{o.t}</button>
            ))}
          </div>

          {type === 'review' && (
            <>
              <div className="field"><label>Product Name</label><input value={product} onChange={e=>setProduct(e.target.value)} placeholder="NordVPN" /></div>
              <div className="field"><label>Affiliate Link (optional)</label><input value={affUrl} onChange={e=>setAffUrl(e.target.value)} placeholder="https://mysite.com/go/nordvpn" /></div>
            </>
          )}
          {type === 'vs' && (
            <>
              <div className="row">
                <div className="field"><label>Product A</label><input value={vsA} onChange={e=>setVsA(e.target.value)} placeholder="NordVPN" /></div>
                <div className="field"><label>Product B</label><input value={vsB} onChange={e=>setVsB(e.target.value)} placeholder="ExpressVPN" /></div>
              </div>
              <div className="row">
                <div className="field"><label>A Link</label><input value={vsAUrl} onChange={e=>setVsAUrl(e.target.value)} placeholder="link A" /></div>
                <div className="field"><label>B Link</label><input value={vsBUrl} onChange={e=>setVsBUrl(e.target.value)} placeholder="link B" /></div>
              </div>
            </>
          )}
          {type === 'best' && (
            <>
              <div className="field"><label>Category</label><input value={category} onChange={e=>setCategory(e.target.value)} placeholder="VPNs for streaming" /></div>
              <div className="field"><label>Products (one per line: Name | affiliate-url)</label>
                <textarea rows={5} value={products} onChange={e=>setProducts(e.target.value)} placeholder={'NordVPN | https://mysite.com/go/nord\nExpressVPN | https://mysite.com/go/express\nSurfshark | https://mysite.com/go/surf'} /></div>
            </>
          )}

          <div className="row" style={{alignItems:'flex-end'}}>
            <div className="field"><label>Status</label><select value={status} onChange={e=>setStatus(e.target.value)}><option value="publish">publish</option><option value="draft">draft</option></select></div>
            <div className="field"><button className="btn reach" style={{marginTop:22,width:'100%'}} onClick={launch} disabled={!siteId}>Create {type} Page</button></div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">💰 Page Types</div>
          {[
            ['Review', 'Single product, affiliate-optimized. Pros/cons, pricing, verdict + FAQ.'],
            ['VS Compare', 'Product A vs B. Side-by-side table, who-should-pick-which.'],
            ['Best-of', 'Roundup ranking multiple products. Comparison table + mini-reviews.'],
          ].map(([t, d]) => (
            <div key={t} style={{padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
              <strong>{t}</strong>
              <div style={{fontSize:12,color:'var(--text-dim)',marginTop:2}}>{d}</div>
            </div>
          ))}
          <div style={{fontSize:11,color:'var(--text-faint)',marginTop:12}}>
            All pages include affiliate slots, comparison tables, schema (Review/Article), and FAQ. Published to the selected site via WordPress REST.
          </div>
        </div>
      </div>

      <div className="panel" style={{marginTop:14}}>
        <div className="panel-title">📄 PDF Product Builder (Stream 4)</div>
        <PdfBuilder sites={allSites} />
      </div>

      <div className="panel" style={{marginTop:14}}>
        <div className="panel-title">📤 Published Money Pages</div>
        {moneyPages.length === 0 ? <div className="empty">No money pages yet.</div> : (
          <table><thead><tr><th>Title</th><th>URL</th><th>When</th></tr></thead>
          <tbody>{moneyPages.slice(0,15).map(p=>(
            <tr key={p.id}>
              <td style={{maxWidth:280,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.keyword}</td>
              <td>{p.url ? <a href={p.url} target="_blank" rel="noreferrer">view ↗</a> : '—'}</td>
              <td className="mono" style={{fontSize:11,color:'var(--text-faint)'}}>{new Date(p.published_at).toLocaleDateString()}</td>
            </tr>
          ))}</tbody></table>
        )}
      </div>
    </div>
  );
}

function PdfBuilder({ sites }) {
  const [siteId, setSiteId] = useState('');
  const [type, setType] = useState('guide');
  const [niche, setNiche] = useState('');
  const [title, setTitle] = useState('');
  const [msg, setMsg] = useState('');
  const TYPES = [['guide','Guide $19'],['template','Template $9'],['checklist','Checklist $7'],['swipe','Swipe $12'],['course','Course $39']];
  async function build() {
    if (!siteId || !niche) return alert('Pick site + niche');
    try {
      const { api } = await import('../../lib/api');
      await api.reachProduct({ siteId, type, niche, title, moneyUrl: sites.find(s=>s.id===siteId)?.wp_url });
      setMsg('PDF product queued ✓'); setTimeout(()=>setMsg(''),4000);
    } catch(e){ alert(e.message); }
  }
  return (
    <div>
      {msg && <div className="success-msg" style={{marginBottom:10}}>{msg}</div>}
      <div className="row" style={{flexWrap:'wrap',gap:10}}>
        <select value={siteId} onChange={e=>setSiteId(e.target.value)}><option value="">— site —</option>{sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
        <select value={type} onChange={e=>setType(e.target.value)}>{TYPES.map(([k,l])=><option key={k} value={k}>{l}</option>)}</select>
        <input value={niche} onChange={e=>setNiche(e.target.value)} placeholder="niche (bundles its articles)" />
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="title (optional)" />
        <button className="btn reach sm" onClick={build} style={{whiteSpace:'nowrap'}}>Build PDF + List</button>
      </div>
      <p style={{fontSize:11,color:'var(--text-faint)',marginTop:8}}>Bundles published articles in the niche into a branded PDF, lists it on WooCommerce as a digital download (100% margin).</p>
    </div>
  );
}
