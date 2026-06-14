'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SecurityCheckContent() {
  const searchParams = useSearchParams();
  const preselectedTool = searchParams.get('tool');

  const [tools, setTools] = useState([]);
  const [selectedTool, setSelectedTool] = useState(preselectedTool || '');
  const [intent, setIntent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [loadingTools, setLoadingTools] = useState(true);

  useEffect(() => {
    fetch('/api/tools')
      .then(res => res.json())
      .then(data => {
        setTools(Array.isArray(data) ? data : []);
        setLoadingTools(false);
      })
      .catch(() => setLoadingTools(false));
  }, []);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!selectedTool || !intent.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/security-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId: selectedTool, userIntent: intent }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        alert(data.error || 'Chyba při analýze.');
      }
    } catch (err) {
      alert('Nepodařilo se provést analýzu.');
    } finally {
      setLoading(false);
    }
  };

  const verdictIcons = {
    safe: '✅',
    risky: '⚠️',
    dangerous: '🚫',
  };

  return (
    <div className="container">
      <div className="security-page">
        <h1>Security Check</h1>
        <p className="subtitle" style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.05rem' }}>
          Ověřte, zda je bezpečné použít AI nástroj pro váš konkrétní záměr. Systém analyzuje bezpečnostní podmínky nástroje a vyhodnotí rizika z hlediska GDPR a ochrany dat.
        </p>

        <div className="security-form-card">
          <form onSubmit={handleCheck}>
            <div className="form-group">
              <label className="form-label">Vyberte AI nástroj *</label>
              {loadingTools ? (
                <div style={{ color: 'var(--text-muted)', padding: '0.75rem' }}>Načítám nástroje...</div>
              ) : (
                <select
                  value={selectedTool}
                  onChange={(e) => setSelectedTool(e.target.value)}
                  className="form-select"
                  required
                  id="security-tool-select"
                >
                  <option value="">-- Vyberte nástroj --</option>
                  {tools.map(tool => (
                    <option key={tool.id} value={tool.id}>{tool.name} ({tool.category})</option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Popište svůj záměr *
                <span className="form-label-hint"> (co chcete s nástrojem dělat, jaká data budete používat)</span>
              </label>
              <textarea
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                className="form-textarea"
                placeholder='např. "Chci nahrát excel s e-maily zákazníků a udělat segmentaci" nebo "Potřebuji přeložit interní dokumenty s finančními údaji"'
                required
                style={{ minHeight: '120px' }}
                id="security-intent-input"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading || !selectedTool || !intent.trim()}
              id="security-check-btn"
            >
              {loading ? (
                <><span className="loading-spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> Analyzuji...</>
              ) : (
                '🔍 Analyzovat bezpečnost'
              )}
            </button>
          </form>
        </div>

        {result && (
          <div className="security-result" id="security-result">
            <div className={`security-verdict ${result.analysis.verdict}`}>
              <span style={{ fontSize: '2rem' }}>{verdictIcons[result.analysis.verdict] || '❓'}</span>
              <div>
                <div>{result.analysis.verdict_label}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: '400', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Nástroj: {result.tool.name}
                </div>
              </div>
            </div>

            <div className="security-detail-section">
              <h3>📋 Shrnutí</h3>
              <p>{result.analysis.summary}</p>
            </div>

            {result.analysis.sensitive_data && result.analysis.sensitive_data.length > 0 && (
              <div className="security-detail-section">
                <h3>🔍 Identifikovaná citlivá data</h3>
                <ul>
                  {result.analysis.sensitive_data.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            )}

            {result.analysis.risks && result.analysis.risks.length > 0 && (
              <div className="security-detail-section">
                <h3>⚠️ Identifikovaná rizika</h3>
                <ul>
                  {result.analysis.risks.map((risk, i) => <li key={i}>{risk}</li>)}
                </ul>
              </div>
            )}

            <div className="security-detail-section">
              <h3>🇪🇺 GDPR analýza</h3>
              <p>{result.analysis.gdpr_analysis}</p>
            </div>

            {result.analysis.recommendations && result.analysis.recommendations.length > 0 && (
              <div className="security-detail-section">
                <h3>✅ Doporučení</h3>
                <ul>
                  {result.analysis.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SecurityCheckPage() {
  return (
    <Suspense fallback={
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner" />
        </div>
      </div>
    }>
      <SecurityCheckContent />
    </Suspense>
  );
}
