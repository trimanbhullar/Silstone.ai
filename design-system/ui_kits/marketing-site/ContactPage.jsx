import React from 'react';

/** Contact page — form + direct contact card, matches /contact. */
export function ContactPage({ NavBar, Button, Footer }) {
  return (
    <div style={{ background: 'var(--bg-canvas)', minHeight: '100%' }}>
      {NavBar}
      <section style={{ padding: 'var(--space-24) var(--container-pad)', maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 700,
          fontSize: 'var(--text-display-l-size)', margin: '0 0 var(--space-3)', textAlign: 'center',
        }}>Contact Us</h1>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: 17, margin: '0 0 var(--space-10)' }}>
          Reach out anytime — we're here to help.
        </p>
        <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={(e) => e.preventDefault()}>
          {[
            ['Your Name*', 'text'],
            ['Your Company Name', 'text'],
            ['Work Email*', 'email'],
            ['Your Phone Number*', 'tel'],
          ].map(([label, type]) => (
            <label key={label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>{label}</span>
              <input type={type} style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)', padding: '12px 14px', color: 'var(--text-primary)',
                fontSize: 15, fontFamily: 'var(--font-body)', outline: 'none',
              }} />
            </label>
          ))}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>What are you trying to build?</span>
            <textarea rows={4} style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)', padding: '12px 14px', color: 'var(--text-primary)',
              fontSize: 15, fontFamily: 'var(--font-body)', outline: 'none', resize: 'vertical',
            }} />
          </label>
          <Button variant="primary" size="lg" style={{ marginTop: 'var(--space-2)' }}>Get in touch</Button>
        </form>
      </section>
      {Footer}
    </div>
  );
}
window.ContactPage = ContactPage;
