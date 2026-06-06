import Link from 'next/link';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { api } from '../lib/api';

const NAV = [
  { href: '/', icon: '◆', label: 'Overview' },
  { href: '/sites', icon: '⬡', label: 'Sites' },
  { href: '/research', icon: '⊕', label: 'Research' },
  { href: '/content', icon: '✎', label: 'Content' },
  { href: '/parasite', icon: '⇶', label: 'Traffic Engine' },
  { href: '/trends', icon: '⚡', label: 'Trends' },
  { href: '/accounts', icon: '◉', label: 'Accounts' },
  { href: '/tools', icon: '⚒', label: 'Tools' },
];

export default function Layout({ children }) {
  const router = useRouter();
  const { data: health } = useSWR('health', () => api.health().catch(() => null), { refreshInterval: 15000 });
  const online = !!health?.ok;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="logo">RANK<span>ORA</span></div>
        <div className="logo-sub">Control Room</div>
        <nav>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`nav-item ${router.pathname === n.href ? 'active' : ''}`}>
              <span className="nav-icon">{n.icon}</span>{n.label}
            </Link>
          ))}
        </nav>
        <div className="nav-spacer" />
        <div className="flex" style={{ fontSize: 11, color: 'var(--text-faint)', padding: '0 12px' }}>
          <span className={`status-dot ${online ? '' : 'off'}`} />
          Engine {online ? 'online' : 'offline'}
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
