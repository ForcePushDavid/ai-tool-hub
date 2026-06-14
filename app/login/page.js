import { login, signup } from './actions'
import SsoButtons from '@/components/SsoButtons'

export default async function LoginPage({ searchParams }) {
  const { message } = await searchParams

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="form-card" style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="navbar-brand-icon" style={{ margin: '0 auto 1rem', width: '48px', height: '48px', fontSize: '1.5rem' }}>👽</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Přihlášení do Alza AI Hub</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Zadejte své údaje nebo využijte firemní SSO.
          </p>
        </div>

        <SsoButtons />

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          <span style={{ padding: '0 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>NEBO</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        </div>

        <form>
          {message && (
            <div className="toast-error" style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {message}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">E-mail</label>
            <input
              className="form-input"
              id="email"
              name="email"
              type="email"
              placeholder="vy@firma.cz"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" htmlFor="password">Heslo</label>
            <input
              className="form-input"
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button formAction={login} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Přihlásit se
            </button>
            <button formAction={signup} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              Vytvořit testovací účet
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
