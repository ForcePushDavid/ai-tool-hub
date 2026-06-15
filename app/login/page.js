import { login, signup } from './actions'
import SsoButtons from '@/components/SsoButtons'
import SubmitButton from '@/components/SubmitButton'
import ImageSlider from '@/components/ImageMarquee'

export default async function LoginPage({ searchParams }) {
  const { message } = await searchParams

  return (
    <div className="login-split-layout">
      <div className="login-marquee-panel">
        <ImageSlider />
      </div>
      <div className="login-form-panel">
        <div className="login-form-wrapper">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
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
            <div style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1rem',
              fontSize: '0.85rem',
              background: message.startsWith('✅') ? '#e8f5e9' : '#fdecea',
              color: message.startsWith('✅') ? '#2e7d32' : '#c62828',
              border: message.startsWith('✅') ? '1px solid #a5d6a7' : '1px solid #ef9a9a',
            }}>
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
            <SubmitButton formAction={login} variant="primary" style={{ width: '100%', justifyContent: 'center' }}>
              Přihlásit se
            </SubmitButton>
            <SubmitButton formAction={signup} variant="secondary" style={{ width: '100%', justifyContent: 'center' }}>
              Vytvořit testovací účet
            </SubmitButton>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}
