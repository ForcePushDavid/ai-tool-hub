'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const categories = [
  'Text / Konverzace',
  'Obrázky',
  'Video',
  'Audio',
  'Kód',
  'Prezentace',
  'Produktivita',
  'Marketing',
];

const pricingModels = ['Free', 'Freemium', 'Paid', 'Enterprise'];
const licenseTypes = ['Osobní', 'Firemní', 'Obojí', 'Open Source'];

export default function ToolForm({ tool, isEditing }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [autofilling, setAutofilling] = useState(false);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(true); // Default to true to prevent flickering before fetch
  const [formData, setFormData] = useState({
    name: tool?.name || '',
    description: tool?.description || '',
    category: tool?.category || categories[0],
    pricing_model: tool?.pricing_model || pricingModels[0],
    tips: tool?.tips || '',
    website_url: tool?.website_url || '',
    license_type: tool?.license_type || licenseTypes[0],
    data_policy: tool?.data_policy || '',
    gdpr_compliant: tool?.gdpr_compliant || false,
    data_retention: tool?.data_retention || '',
    security_notes: tool?.security_notes || '',
    request_reason: tool?.request_reason || '',
  });

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        setIsAdmin(data?.role === 'admin');
      } else {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAutofill = async () => {
    if (!formData.name || formData.name.trim().length < 2) {
      setError('Nejdříve vyplňte název nástroje pro předvyplnění.');
      return;
    }
    setAutofilling(true);
    setError('');
    
    try {
      const res = await fetch('/api/tools/autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Nepodařilo se předvyplnit nástroj.');
      }
      
      const data = await res.json();
      setFormData(prev => ({ ...prev, ...data }));
    } catch (err) {
      setError(err.message);
    } finally {
      setAutofilling(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = isEditing ? `/api/tools/${tool.id}` : '/api/tools';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Něco se pokazilo');
      }

      const data = await res.json();
      
      if (data.pending) {
        alert('Děkujeme! Nástroj byl odeslán a čeká na schválení administrátorem.');
        router.push('/');
      } else {
        router.push(`/tools/${data.id}`);
      }
      
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-card" id="tool-form">
      {error && <div className="toast toast-error" style={{ position: 'relative', top: 0, right: 0, marginBottom: '1rem' }}>{error}</div>}

      <div className="form-group">
        <label className="form-label">Název nástroje *</label>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            placeholder="např. ChatGPT"
            required
            id="input-name"
            style={{ flex: 1 }}
          />
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleAutofill}
            disabled={autofilling || !formData.name}
            style={{ whiteSpace: 'nowrap' }}
          >
            {autofilling ? '⏳ Generuji...' : '✨ Předvyplnit pomocí AI'}
          </button>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Popis *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="form-textarea"
          placeholder="Stručný popis nástroje a jeho hlavních funkcí..."
          required
          id="input-description"
        />
      </div>

      {!isAdmin && !isEditing && (
        <div className="form-group">
          <label className="form-label" style={{ color: 'var(--accent-primary)' }}>
            Důvod žádosti / K čemu budete nástroj využívat? *
          </label>
          <textarea
            name="request_reason"
            value={formData.request_reason}
            onChange={handleChange}
            className="form-textarea"
            placeholder="Zde popište, jaké konkrétní úkoly chcete pomocí tohoto nástroje řešit..."
            required
            id="input-request-reason"
            style={{ borderColor: 'var(--accent-primary)' }}
          />
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Kategorie</label>
          <select name="category" value={formData.category} onChange={handleChange} className="form-select" id="input-category">
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Cenový model</label>
          <select name="pricing_model" value={formData.pricing_model} onChange={handleChange} className="form-select" id="input-pricing">
            {pricingModels.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Typ licence</label>
          <select name="license_type" value={formData.license_type} onChange={handleChange} className="form-select" id="input-license">
            {licenseTypes.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Web nástroje</label>
          <input
            type="url"
            name="website_url"
            value={formData.website_url}
            onChange={handleChange}
            className="form-input"
            placeholder="https://..."
            id="input-url"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Tipy pro efektivní využití
          <span className="form-label-hint"> (volitelné)</span>
        </label>
        <textarea
          name="tips"
          value={formData.tips}
          onChange={handleChange}
          className="form-textarea"
          placeholder="Tipy a triky pro efektivní použití nástroje..."
          id="input-tips"
        />
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.5rem 0' }} />
      <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🔒 Bezpečnost a data</h3>

      <div className="form-group">
        <label className="form-label">Datová politika</label>
        <textarea
          name="data_policy"
          value={formData.data_policy}
          onChange={handleChange}
          className="form-textarea"
          placeholder="Jak nástroj nakládá s uživatelskými daty..."
          id="input-data-policy"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Uchovávání dat</label>
          <input
            type="text"
            name="data_retention"
            value={formData.data_retention}
            onChange={handleChange}
            className="form-input"
            placeholder="např. 30 dní, neukládá..."
            id="input-retention"
          />
        </div>
        <div className="form-group">
          <div className="form-checkbox-group" style={{ marginTop: '1.8rem' }}>
            <input
              type="checkbox"
              name="gdpr_compliant"
              checked={formData.gdpr_compliant}
              onChange={handleChange}
              className="form-checkbox"
              id="input-gdpr"
            />
            <label htmlFor="input-gdpr" className="form-label" style={{ marginBottom: 0 }}>GDPR kompatibilní</label>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Bezpečnostní poznámky</label>
        <textarea
          name="security_notes"
          value={formData.security_notes}
          onChange={handleChange}
          className="form-textarea"
          placeholder="Důležité bezpečnostní informace, omezení..."
          id="input-security-notes"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading} id="btn-submit">
          {loading ? 'Zpracovávám...' : (isEditing ? 'Uložit změny' : (isAdmin ? 'Přidat nástroj' : 'Odeslat ke schválení'))}
        </button>
        <button type="button" className="btn btn-secondary btn-lg" onClick={() => router.back()} id="btn-cancel">
          Zrušit
        </button>
      </div>
    </form>
  );
}
