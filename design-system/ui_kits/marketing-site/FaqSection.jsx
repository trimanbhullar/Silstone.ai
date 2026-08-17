import React from 'react';

/** FAQ section — "Everything You Need to Know About Working With Silstone.AI" */
export function FaqSection({ FaqItem }) {
  const faqs = [
    { q: 'Do you work with only specific industries?', a: 'No. We build AI solutions across biotech, finance, manufacturing, healthcare, logistics, retail, energy, and more through AI consulting and AI development services.' },
    { q: 'Do you only build chatbots?', a: 'Not at all. We create full end-to-end AI systems including models, agents, copilots, prediction engines, and automation pipelines.' },
    { q: 'Can you train AI on our internal documents or datasets?', a: 'Absolutely. We securely ingest, process, and train models using our AI document processing and AI software development capabilities.' },
    { q: "What's the usual project timeline?", a: 'Prototype → 2–4 weeks. MVP → 6–10 weeks. Full system → 2–4 months.' },
    { q: 'Do you provide AI strategy consulting as well?', a: 'Yes. We help organizations define their AI roadmap, identify high-value use cases, and implement systems that scale.' },
    { q: 'What makes Silstone.AI different?', a: 'We focus on applied AI that works in the real world, not experiments or prototypes that sit on shelves. Everything we build is practical, secure, scalable, and built for real adoption.' },
  ];
  return (
    <section style={{ padding: 'var(--space-20) var(--container-pad)', background: 'var(--bg-canvas)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 700,
          fontSize: 'var(--text-display-s-size)', margin: '0 0 var(--space-8)', textAlign: 'center',
        }}>
          Everything You Need to Know About Working With Silstone.AI
        </h2>
        {faqs.map((f) => (
          <FaqItem key={f.q} question={f.q}>{f.a}</FaqItem>
        ))}
      </div>
    </section>
  );
}
window.FaqSection = FaqSection;
