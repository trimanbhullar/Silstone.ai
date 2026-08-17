import React from 'react';

/** Hero section — full-bleed black/video background, bold emphasized headline, dual CTA. */
export function Hero({ NavBar, Button }) {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: 640,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-canvas-true-black)',
        overflow: 'hidden',
      }}
    >
      <video
        autoPlay muted loop playsInline
        src="https://videos.pexels.com/video-files/3129576/3129576-uhd_2560_1440_30fps.mp4"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', opacity: 0.35,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {NavBar}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', textAlign: 'center', padding: '0 var(--container-pad)', gap: 'var(--space-8)',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', color: 'var(--text-primary)',
            fontSize: 'var(--text-display-xl-size)', fontWeight: 700, lineHeight: 1.05,
            letterSpacing: 'var(--tracking-tight)', maxWidth: 900, margin: 0,
          }}>
            Your <span style={{ color: 'var(--accent)' }}>On-Demand</span> AI Product Team
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)', color: 'var(--text-secondary)',
            fontSize: 'var(--text-body-l-size)', lineHeight: 1.6, maxWidth: 640, margin: 0,
          }}>
            We partner with <b style={{ color: 'var(--text-primary)' }}>founders</b>, <b style={{ color: 'var(--text-primary)' }}>product leaders</b>, and <b style={{ color: 'var(--text-primary)' }}>engineering teams</b> to design, build, and ship <b style={{ color: 'var(--text-primary)' }}>AI-powered</b> features that <b style={{ color: 'var(--text-primary)' }}>work in production</b> — fast, secure, and built for real users.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button variant="primary" size="lg">Book a strategy call</Button>
            <Button variant="ghost" size="lg" icon="→">Discover How We Work</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
window.Hero = Hero;
