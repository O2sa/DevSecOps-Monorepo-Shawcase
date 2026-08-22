export default function HomePage() {
  return (
    <div className="card">
      <div className="header">
        <h1>Public Web Application</h1>
        <span className="badge">
          <span className="status-dot"></span>
          Operational
        </span>
      </div>

      <p className="subtitle">
        Next.js client-facing web application scaffolding for the DevSecOps Proof-of-Concept monorepo.
      </p>

      <div className="info-grid">
        <div className="info-item">
          <div className="info-label">Service</div>
          <div className="info-value">apps/web</div>
        </div>
        <div className="info-item">
          <div className="info-label">Framework</div>
          <div className="info-value">Next.js 14 (App Router)</div>
        </div>
        <div className="info-item">
          <div className="info-label">Port</div>
          <div className="info-value">3000</div>
        </div>
        <div className="info-item">
          <div className="info-label">Status</div>
          <div className="info-value">Scaffolded (Phase 1)</div>
        </div>
      </div>

      <div>
        <a href="/api/health" className="api-link" target="_blank" rel="noopener noreferrer">
          View Health Endpoint (/api/health) &rarr;
        </a>
      </div>
    </div>
  );
}
