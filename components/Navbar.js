'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        <div className="navbar-brand-icon">🤖</div>
        <span>AI Tool Hub</span>
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
          🔒 Security Check
        </Link>
        <Link href="/tools/new" className="btn btn-primary btn-sm">
          + Přidat nástroj
        </Link>
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
