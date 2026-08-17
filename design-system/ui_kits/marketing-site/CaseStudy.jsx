import React from 'react';

/** Partner strip + case-study teaser ("How We Helped HAERO..."). */
export function CaseStudy({ Badge, Card }) {
  return (
    <section style={{ padding: 'var(--space-20) var(--container-pad)', background: 'var(--bg-canvas-true-black)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap',
          padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)', marginBottom: 'var(--space-12)',
        }}>
          <img src="../../assets/partner-logo-dark.png" style={{ height: 32, filter: 'invert(1) brightness(1.5)' }} alt="AI co-builder" />
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, margin: 0 }}>
            Leveraging the latest AI-Coding technology, we speed up delivery by up to <b style={{ color: 'var(--accent)' }}>40%</b>.
          </p>
        </div>
        <Badge tone="neutral">Case Study</Badge>
        <h2 style={{
          fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 700,
          fontSize: 'var(--text-display-s-size)', margin: 'var(--space-4) 0 var(--space-3)', maxWidth: 700,
        }}>
          How We Helped HAERO Make a Rare Disease Understandable With AI
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6, maxWidth: 620, margin: 0 }}>
          HAE is a rare and lesser-known disease where data is extremely limited, and whatever exists is difficult for patients and families to understand.
        </p>
      </div>
    </section>
  );
}
window.CaseStudy = CaseStudy;
