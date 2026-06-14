'use client';

import { useState, useEffect } from 'react';
import ToolCard from '@/components/ToolCard';

const categories = ['Vše', 'Text / Konverzace', 'Obrázky', 'Video', 'Audio', 'Kód', 'Prezentace', 'Produktivita', 'Marketing'];

export default function HomePage() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Vše');

  const fetchTools = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (activeCategory !== 'Vše') params.set('category', activeCategory);

      const res = await fetch(`/api/tools?${params}`);
      const data = await res.json();
      setTools(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching tools:', err);
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, [activeCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTools();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="container">
      <section className="hero">
        <img src="/tourist-signs.png" alt="Rozcestník AI nástrojů" style={{ width: '100%', maxWidth: '350px', margin: '0 auto 2rem', borderRadius: 'var(--radius-md)', display: 'block', border: '2px solid var(--border-color)', boxShadow: '4px 4px 0px var(--border-color)' }} />
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
    </div>
  );
}
