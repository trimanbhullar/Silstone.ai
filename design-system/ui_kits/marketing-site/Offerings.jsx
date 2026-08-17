import React from 'react';

/** "What we build" offerings grid — Card tiles. */
export function Offerings({ Card, Badge }) {
  const items = [
    { title: 'AI Agents & Copilots', desc: 'Autonomous and human-in-the-loop agents embedded in your product.' },
    { title: 'Prediction Engines', desc: 'Models that forecast, score, and rank on your real production data.' },
    { title: 'AI Document Processing', desc: 'Securely ingest, process, and train on internal documents and datasets.' },
    { title: 'Automation Pipelines', desc: 'End-to-end workflows that remove manual, repetitive work.' },
    { title: 'AI Strategy Consulting', desc: 'Define your roadmap, identify high-value use cases, and scale.' },
    { title: 'AI Software Development', desc: 'Full-stack engineering to ship AI features that work in production.' },
  ];
  return (
    <section style={{ padding: 'var(--space-24) var(--container-pad)', background: 'var(--bg-canvas)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        <Badge tone="accent">What we do</Badge>
        <h2 style={{
          fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 700,
          fontSize: 'var(--text-display-m-size)', margin: 'var(--space-4) 0 var(--space-2)', maxWidth: 640,
        }}>
          AI Solutions That Adapt to Your Industry, Data & Vision
        </h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-6)', marginTop: 'var(--space-10)',
        }}>
          {items.map((it) => (
            <Card key={it.title}>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: 19, fontWeight: 600, margin: '0 0 8px' }}>{it.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6, margin: 0 }}>{it.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
window.Offerings = Offerings;
