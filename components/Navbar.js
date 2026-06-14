'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar({ role }) {
  const pathname = usePathname();

  if (pathname === '/login') return null;

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        <span>AI HUB</span>
        {role === 'admin' && (
          <span style={{ fontSize: '0.65rem', background: 'var(--danger)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '1rem', marginLeft: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Admin Mode
          </span>
        )}
      </Link>
      <div className="navbar-links">
        <Link
          href="/"
          className={`navbar-link ${pathname === '/' ? 'active' : ''}`}
        >
          Katalog
        </Link>
        <Link
          href="/security-check"
          className={`navbar-link ${pathname === '/security-check' ? 'active' : ''}`}
        >
          Security Check
        </Link>
        {role === 'admin' && (
          <Link href="/tools/new" className="btn btn-primary btn-sm">
            + Přidat nástroj
          </Link>
        )}
        <button onClick={async () => {
          const { logout } = await import('@/app/login/actions');
          await logout();
        }} className="btn btn-secondary btn-sm" style={{ marginLeft: '0.5rem' }}>
          Odhlásit
        </button>
      </div>
    </nav>
  );
}
