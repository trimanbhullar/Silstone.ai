import React, { useState } from 'react';

/** Expand/collapse FAQ row — matches the "Everything You Need to Know" section on the homepage. */
export function FaqItem({ question, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          padding: 'var(--space-6) 0',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          fontSize: 'var(--text-body-l-size)',
        }}
      >
        {question}
        <span
          style={{
            flexShrink: 0,
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)',
            fontSize: 20,
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
            transition: 'transform var(--duration-base) var(--ease-standard)',
          }}
        >
          +
        </span>
      </button>
      {open && (
        <div
          style={{
            paddingBottom: 'var(--space-6)',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-body-m-size)',
            lineHeight: 'var(--text-body-m-leading)',
            maxWidth: '65ch',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
