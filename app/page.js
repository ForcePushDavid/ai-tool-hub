'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ToolCard from '@/components/ToolCard';
import { createClient } from '@/utils/supabase/client';

const categories = ['Vše', 'Text / Konverzace', 'Obrázky', 'Video', 'Audio', 'Kód', 'Prezentace', 'Produktivita', 'Marketing'];

export default function HomePage() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Vše');
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingTools, setPendingTools] = useState([]);

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        setIsAdmin(data?.role === 'admin');
      }
    };
    checkAdmin();
  }, []);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (activeCategory !== 'Vše') params.set('category', activeCategory);

      const res = await fetch(`/api/tools?${params}`);
      const data = await res.json();
      setTools(Array.isArray(data) ? data : []);

      if (isAdmin) {
        const pendingRes = await fetch('/api/tools?status=pending');
        const pendingData = await pendingRes.json();
        setPendingTools(Array.isArray(pendingData) ? pendingData : []);
      }
    } catch (err) {
      console.error('Error fetching tools:', err);
      setTools([]);
      setPendingTools([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, [activeCategory, isAdmin]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTools();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="container">
      <section className="hero">
        <h1>AI HUB</h1>
        <p>Prozkoumejte schválené nástroje umělé inteligence pro zaměstnance Alzy, zjistěte jejich možnosti a bezpečnostní podmínky.</p>
      </section>

      <div className="search-container">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Hledat nástroj..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="search-input"
        />
      </div>

      <div className="filter-tabs">
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
            id={`filter-${cat.replace(/\s|\/|/g, '-').toLowerCase()}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isAdmin && pendingTools.length > 0 && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--accent-primary)' }}>
          <h2 style={{ color: 'var(--accent-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⏳ Nástroje ke schválení ({pendingTools.length})
          </h2>
          <div className="tools-grid">
            {pendingTools.map(tool => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
          <p style={{ color: 'var(--text-muted)' }}>Načítám nástroje...</p>
        </div>
      ) : tools.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>Žádné nástroje nenalezeny</h3>
          <p>Zkuste změnit vyhledávání nebo kategorii.</p>
        </div>
      ) : (
        <div className="tools-grid" id="tools-grid">
          {tools.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}

      {!isAdmin && (
        <div style={{ marginTop: '4rem', textAlign: 'center', padding: '3rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Hledáte něco jiného?</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Nenašli jste nástroj, který používáte? Navrhněte ho a my ho po bezpečnostní kontrole zařadíme do katalogu.
          </p>
          <Link href="/tools/new" className="btn btn-primary" style={{ display: 'inline-flex' }}>
            Navrhnout nový nástroj
          </Link>
        </div>
      )}

      <footer style={{ marginTop: '5rem', padding: '2rem 0', textAlign: 'center', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <p>Vytvořil <strong>David Jeřela</strong> • <a href="mailto:david@jerela.eu" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>david@jerela.eu</a></p>
      </footer>
    </div>
  );
}
