'use client';

export default function SsoButtons() {
  const handleClick = () => {
    alert('V rámci dema použijte prosím přihlášení e-mailem a heslem.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
      <button
        type="button"
        className="btn btn-secondary"
        style={{ width: '100%', justifyContent: 'center' }}
        onClick={handleClick}
      >
        Přihlásit přes Google Workspace
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        style={{ width: '100%', justifyContent: 'center' }}
        onClick={handleClick}
      >
        Přihlásit přes Microsoft 365
      </button>
    </div>
  );
}
