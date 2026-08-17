import React from 'react';

/** Generic dark surface card — used for offering tiles, case-study previews, blog previews. */
export function Card({ children, hoverable = true, style, ...rest }) {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-8)',
        transition: 'border-color var(--duration-base) var(--ease-standard), transform var(--duration-base) var(--ease-standard)',
        ...style,
      }}
      onMouseEnter={hoverable ? (e) => { e.currentTarget.style.borderColor = 'var(--border-accent)'; } : undefined}
      onMouseLeave={hoverable ? (e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; } : undefined}
      {...rest}
    >
      {children}
    </div>
  );
}
