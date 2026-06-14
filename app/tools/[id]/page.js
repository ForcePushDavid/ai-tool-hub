'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function ToolDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch(`/api/tools/${id}`)
      .then(res => res.json())
      .then(data => {
        setTool(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const checkAdmin = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        setIsAdmin(data?.role === 'admin');
      }
    };
    checkAdmin();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/tools/${id}`, { method: 'DELETE' });
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleApprove = async () => {
    try {
      await fetch(`/api/tools/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      // Refresh the local state
      setTool(prev => ({ ...prev, status: 'approved' }));
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (!tool || tool.error) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon">😕</div>
          <h3>Nástroj nenalezen</h3>
          <Link href="/" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>Zpět na katalog</Link>
        </div>
      </div>
    );
  }

  const pricingClasses = { Free: 'badge-free', Freemium: 'badge-freemium', Paid: 'badge-paid', Enterprise: 'badge-enterprise' };

  return (
    <div className="container">
      <div className="tool-detail">
        <Link href="/" className="back-link" id="back-link">← Zpět na katalog</Link>

        <div className="tool-detail-header">
          <div>
            <h1 className="tool-detail-title">{tool.name}</h1>
            <div className="tool-detail-meta">
              <span className={`badge ${pricingClasses[tool.pricing_model] || 'badge-freemium'}`}>{tool.pricing_model}</span>
              <span className="badge badge-category">{tool.category}</span>
              {tool.gdpr_compliant ? (
                <span className="badge badge-gdpr-yes">✓ GDPR Compliant</span>
              ) : (
                <span className="badge badge-gdpr-no">⚠ GDPR – ověřte</span>
              )}
              {tool.status === 'pending' && (
                <span className="badge badge-danger">⏳ Ke schválení</span>
              )}
            </div>
          </div>
          {isAdmin && (
            <div className="tool-detail-actions">
              {tool.status === 'pending' && (
                <button className="btn btn-primary" onClick={handleApprove} style={{ background: 'var(--success)' }}>
                  ✅ Schválit nástroj
                </button>
              )}
              <Link href={`/tools/${id}/edit`} className="btn btn-secondary" id="btn-edit">✏️ Upravit</Link>
              <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)} id="btn-delete">🗑️ Smazat</button>
            </div>
          )}
        </div>

        <div className="tool-detail-section">
          <h2>📝 Popis</h2>
          <p>{tool.description}</p>
        </div>

        {isAdmin && tool.request_reason && (
          <div className="tool-detail-section" style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--accent-primary)' }}>
            <h2>👤 Důvod žádosti od uživatele</h2>
            <p style={{ fontStyle: 'italic' }}>{tool.request_reason}</p>
          </div>
        )}

        {tool.tips && (
          <div className="tool-detail-section">
            <h2>💡 Tipy pro efektivní využití</h2>
            <ul>
              {tool.tips.split('\n').filter(t => t.trim()).map((tip, i) => (
                <li key={i}>{tip.replace(/^[-•]\s*/, '')}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="tool-detail-section">
          <h2>🔒 Bezpečnost a data</h2>
          <div className="security-grid">
            <div className="security-item">
              <div className="security-item-label">GDPR</div>
              <div className="security-item-value" style={{ color: tool.gdpr_compliant ? 'var(--success)' : 'var(--danger)' }}>
                {tool.gdpr_compliant ? '✓ Kompatibilní' : '⚠ Neověřeno'}
              </div>
            </div>
            <div className="security-item">
              <div className="security-item-label">Licence</div>
              <div className="security-item-value">{tool.license_type || 'Neuvedeno'}</div>
            </div>
            <div className="security-item">
              <div className="security-item-label">Uchovávání dat</div>
              <div className="security-item-value">{tool.data_retention || 'Neuvedeno'}</div>
            </div>
            <div className="security-item">
              <div className="security-item-label">Cenový model</div>
              <div className="security-item-value">{tool.pricing_model}</div>
            </div>
          </div>
        </div>

        {tool.data_policy && (
          <div className="tool-detail-section">
            <h2>📋 Datová politika</h2>
            <p>{tool.data_policy}</p>
          </div>
        )}

        {tool.security_notes && (
          <div className="tool-detail-section">
            <h2>⚠️ Bezpečnostní poznámky</h2>
            <p>{tool.security_notes}</p>
          </div>
        )}

        {tool.website_url && (
          <div className="tool-detail-section">
            <h2>🌐 Odkazy</h2>
            <p><a href={tool.website_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>{tool.website_url}</a></p>
          </div>
        )}

        <div style={{ marginTop: '1.5rem' }}>
          <Link
            href={`/security-check?tool=${id}`}
            className="btn btn-primary"
            id="btn-security-check"
          >
            🔒 Ověřit bezpečnost použití
          </Link>
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Smazat nástroj?</h3>
            <p>Opravdu chcete smazat <strong>{tool.name}</strong>? Tuto akci nelze vrátit zpět.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Zrušit</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Mažu...' : 'Smazat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
