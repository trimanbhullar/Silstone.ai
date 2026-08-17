import React from 'react';

/** Top navigation bar — logo left, simple text links right, matches silstone.ai header. */
export function NavBar({ logo, links = [], cta }) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-5) var(--container-pad)',
        background: 'var(--bg-canvas-true-black)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>{logo}</div>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            style={{
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-body-s-size)',
              fontWeight: 500,
              transition: 'color var(--duration-base) var(--ease-standard)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            {l.label}
          </a>
        ))}
        {cta}
      </nav>
    </header>
  );
}
