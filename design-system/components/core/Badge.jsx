import React from 'react';

/** Small pill label — used for the "eyebrow" tags above section headings, e.g. category chips. */
export function Badge({ children, tone = 'accent' }) {
  const tones = {
    accent: { background: 'var(--accent-soft)', color: 'var(--text-accent)', border: '1px solid var(--accent-soft-border)' },
    neutral: { background: 'var(--bg-surface-raised)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' },
  };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        borderRadius: 'var(--radius-pill)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-caption-size)',
        fontWeight: 600,
        letterSpacing: 'var(--tracking-wide)',
        textTransform: 'uppercase',
        ...tones[tone],
      }}
    >
      {children}
    </span>
  );
}
