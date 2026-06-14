import Link from 'next/link';

const categoryIcons = {
  'Text / Konverzace': '💬',
  'Obrázky': '🎨',
  'Video': '🎬',
  'Audio': '🎵',
  'Kód': '💻',
  'Prezentace': '📊',
  'Produktivita': '⚡',
  'Marketing': '📣',
};

const pricingClasses = {
  'Free': 'badge-free',
  'Freemium': 'badge-freemium',
  'Paid': 'badge-paid',
  'Enterprise': 'badge-enterprise',
};

export default function ToolCard({ tool }) {
  const icon = categoryIcons[tool.category] || '🔧';
  const pricingClass = pricingClasses[tool.pricing_model] || 'badge-freemium';

  return (
    <Link href={`/tools/${tool.id}`} className="tool-card" id={`tool-card-${tool.id}`}>
      <div className="tool-card-header">
        <div className="tool-card-icon">{icon}</div>
        <div className="tool-card-badges">
          <span className={`badge ${pricingClass}`}>{tool.pricing_model}</span>
        </div>
      </div>
      <h3 className="tool-card-name">{tool.name}</h3>
      <p className="tool-card-desc">{tool.description}</p>
      <div className="tool-card-footer">
        <div className="tool-card-security">
          {tool.gdpr_compliant ? (
            <><span className="badge badge-gdpr-yes">✓ GDPR</span></>
          ) : (
            <><span className="badge badge-gdpr-no">⚠ GDPR</span></>
          )}
          <span className="badge badge-category">{tool.category}</span>
        </div>
        <span className="tool-card-arrow">→</span>
      </div>
    </Link>
  );
}
