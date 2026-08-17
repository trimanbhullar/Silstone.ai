import React from 'react';

/** Blog list page — grid of post preview cards + pagination, matches /blog-list. */
export function BlogListPage({ NavBar, Card, Footer }) {
  const posts = [
    { title: 'How We Helped HAERO Make a Rare Disease Understandable With AI', tag: 'Case Study' },
    { title: 'Applied AI vs. Experiments: Why Production-Ready Matters', tag: 'Strategy' },
    { title: 'What a 6-Week AI MVP Actually Looks Like', tag: 'Process' },
  ];
  return (
    <div style={{ background: 'var(--bg-canvas)', minHeight: '100%' }}>
      {NavBar}
      <section style={{ padding: 'var(--space-20) var(--container-pad)', maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 700,
          fontSize: 'var(--text-display-l-size)', margin: '0 0 var(--space-10)', textAlign: 'center',
        }}>Blog</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
          {posts.map((p) => (
            <Card key={p.title}>
              <div style={{ height: 140, background: 'var(--ink-700)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }} />
              <span style={{ color: 'var(--text-accent)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>{p.tag}</span>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: 18, fontWeight: 600, margin: '8px 0 0' }}>{p.title}</h3>
            </Card>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-10)' }}>
          {[1, 2, 3, 4].map((n) => (
            <span key={n} style={{
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 'var(--radius-pill)', color: n === 1 ? 'var(--text-on-accent)' : 'var(--text-secondary)',
              background: n === 1 ? 'var(--accent)' : 'transparent', fontSize: 14, fontFamily: 'var(--font-body)',
            }}>{n}</span>
          ))}
        </div>
      </section>
      {Footer}
    </div>
  );
}
window.BlogListPage = BlogListPage;
