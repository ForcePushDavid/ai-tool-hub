'use client';

import { useState, useEffect, use } from 'react';
import ToolForm from '@/components/ToolForm';
import Link from 'next/link';

export default function EditToolPage({ params }) {
  const { id } = use(params);
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tools/${id}`)
      .then(res => res.json())
      .then(data => {
        setTool(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

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

  return (
    <div className="container">
      <div className="form-page">
        <Link href={`/tools/${id}`} className="back-link">← Zpět na detail</Link>
        <h1>Upravit {tool.name}</h1>
        <p className="subtitle">Upravte informace o nástroji v katalogu.</p>
        <ToolForm tool={tool} isEditing />
      </div>
    </div>
  );
}
