import React from 'react';

/** Site footer — contact block + copyright, matches silstone.ai footer. */
export function Footer({ logo, email = 'sales@silstonegroup.com', phone = '+1 613 558 5913' }) {
  return (
    <footer
      style={{
        background: 'var(--bg-canvas-true-black)',
        borderTop: '1px solid var(--border-subtle)',
        padding: 'var(--space-16) var(--container-pad) var(--space-8)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>{logo}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', fontFamily: 'var(--font-body)' }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Contact Us</span>
          <a href={`mailto:${email}`} style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-body-s-size)', textDecoration: 'none' }}>{email}</a>
          <a href={`tel:${phone}`} style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-body-s-size)', textDecoration: 'none' }}>{phone}</a>
        </div>
      </div>
      <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-caption-size)', fontFamily: 'var(--font-body)' }}>
        © 2026. All rights reserved.
      </div>
    </footer>
  );
}
