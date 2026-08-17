/* @ds-bundle: {"format":4,"namespace":"SilstoneAIDesignSystem_aca135","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"FaqItem","sourcePath":"components/feedback/FaqItem.jsx"},{"name":"Footer","sourcePath":"components/navigation/Footer.jsx"},{"name":"NavBar","sourcePath":"components/navigation/NavBar.jsx"},{"name":"BlogListPage","sourcePath":"ui_kits/marketing-site/BlogListPage.jsx"},{"name":"CaseStudy","sourcePath":"ui_kits/marketing-site/CaseStudy.jsx"},{"name":"ContactPage","sourcePath":"ui_kits/marketing-site/ContactPage.jsx"},{"name":"FaqSection","sourcePath":"ui_kits/marketing-site/FaqSection.jsx"},{"name":"Hero","sourcePath":"ui_kits/marketing-site/Hero.jsx"},{"name":"Offerings","sourcePath":"ui_kits/marketing-site/Offerings.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"574153e0691b","components/core/Button.jsx":"754cec9bf0a6","components/core/Card.jsx":"2d4b9edf670f","components/feedback/FaqItem.jsx":"a59542f032ca","components/navigation/Footer.jsx":"facad2e5277b","components/navigation/NavBar.jsx":"5fd4cab17026","ui_kits/marketing-site/BlogListPage.jsx":"8a93395e8353","ui_kits/marketing-site/CaseStudy.jsx":"409afbe2246b","ui_kits/marketing-site/ContactPage.jsx":"17e7a832713d","ui_kits/marketing-site/FaqSection.jsx":"edb013d2f4be","ui_kits/marketing-site/Hero.jsx":"b447977f89a1","ui_kits/marketing-site/Offerings.jsx":"73d2733ec409"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.SilstoneAIDesignSystem_aca135 = window.SilstoneAIDesignSystem_aca135 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
/** Small pill label — used for the "eyebrow" tags above section headings, e.g. category chips. */
function Badge({
  children,
  tone = 'accent'
}) {
  const tones = {
    accent: {
      background: 'var(--accent-soft)',
      color: 'var(--text-accent)',
      border: '1px solid var(--accent-soft-border)'
    },
    neutral: {
      background: 'var(--bg-surface-raised)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-subtle)'
    }
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 12px',
      borderRadius: 'var(--radius-pill)',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-caption-size)',
      fontWeight: 600,
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase',
      ...tones[tone]
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Primary CTA / secondary / ghost button matching the silstone.ai marketing site.
 * Primary buttons are solid teal with black text (high-contrast on the dark canvas);
 * secondary buttons are outlined; ghost buttons are text-only with an arrow, used for
 * links like "Discover How We Work →".
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon = null,
  as: Tag = 'button',
  ...rest
}) {
  const sizePad = {
    sm: '8px 16px',
    md: '12px 24px',
    lg: '16px 32px'
  }[size];
  const sizeText = {
    sm: 'var(--text-body-s-size)',
    md: 'var(--text-body-m-size)',
    lg: 'var(--text-body-l-size)'
  }[size];
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    fontSize: sizeText,
    padding: sizePad,
    borderRadius: 'var(--radius-pill)',
    border: '1px solid transparent',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all var(--duration-base) var(--ease-standard)',
    whiteSpace: 'nowrap'
  };
  const variants = {
    primary: {
      background: 'var(--accent)',
      color: 'var(--text-on-accent)',
      boxShadow: 'var(--shadow-sm)'
    },
    secondary: {
      background: 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-default)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-accent)',
      padding: '4px 0',
      borderRadius: 0
    }
  };
  const style = {
    ...base,
    ...variants[variant]
  };
  return /*#__PURE__*/React.createElement(Tag, _extends({
    style: style,
    onMouseEnter: e => {
      if (variant === 'primary') e.currentTarget.style.background = 'var(--accent-hover)';
      if (variant === 'secondary') {
        e.currentTarget.style.borderColor = 'var(--accent)';
        e.currentTarget.style.color = 'var(--accent)';
      }
      if (variant === 'ghost') e.currentTarget.style.color = 'var(--accent-hover)';
    },
    onMouseLeave: e => {
      if (variant === 'primary') e.currentTarget.style.background = 'var(--accent)';
      if (variant === 'secondary') {
        e.currentTarget.style.borderColor = 'var(--border-default)';
        e.currentTarget.style.color = 'var(--text-primary)';
      }
      if (variant === 'ghost') e.currentTarget.style.color = 'var(--text-accent)';
    }
  }, rest), children, icon);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Generic dark surface card — used for offering tiles, case-study previews, blog previews. */
function Card({
  children,
  hoverable = true,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-8)',
      transition: 'border-color var(--duration-base) var(--ease-standard), transform var(--duration-base) var(--ease-standard)',
      ...style
    },
    onMouseEnter: hoverable ? e => {
      e.currentTarget.style.borderColor = 'var(--border-accent)';
    } : undefined,
    onMouseLeave: hoverable ? e => {
      e.currentTarget.style.borderColor = 'var(--border-subtle)';
    } : undefined
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/feedback/FaqItem.jsx
try { (() => {
const {
  useState
} = React;
/** Expand/collapse FAQ row — matches the "Everything You Need to Know" section on the homepage. */
function FaqItem({
  question,
  children,
  defaultOpen = false
}) {
  const [open, setOpen] = useState(defaultOpen);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(o => !o),
    style: {
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
      fontSize: 'var(--text-body-l-size)'
    }
  }, question, /*#__PURE__*/React.createElement("span", {
    style: {
      flexShrink: 0,
      width: 24,
      height: 24,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--accent)',
      fontSize: 20,
      transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
      transition: 'transform var(--duration-base) var(--ease-standard)'
    }
  }, "+")), open && /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 'var(--space-6)',
      color: 'var(--text-secondary)',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-body-m-size)',
      lineHeight: 'var(--text-body-m-leading)',
      maxWidth: '65ch'
    }
  }, children));
}
Object.assign(__ds_scope, { FaqItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/FaqItem.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Footer.jsx
try { (() => {
/** Site footer — contact block + copyright, matches silstone.ai footer. */
function Footer({
  logo,
  email = 'sales@silstonegroup.com',
  phone = '+1 613 558 5913'
}) {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--bg-canvas-true-black)',
      borderTop: '1px solid var(--border-subtle)',
      padding: 'var(--space-16) var(--container-pad) var(--space-8)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-6)',
      flexWrap: 'wrap',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center'
    }
  }, logo), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-1)',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-primary)',
      fontWeight: 600
    }
  }, "Contact Us"), /*#__PURE__*/React.createElement("a", {
    href: `mailto:${email}`,
    style: {
      color: 'var(--text-secondary)',
      fontSize: 'var(--text-body-s-size)',
      textDecoration: 'none'
    }
  }, email), /*#__PURE__*/React.createElement("a", {
    href: `tel:${phone}`,
    style: {
      color: 'var(--text-secondary)',
      fontSize: 'var(--text-body-s-size)',
      textDecoration: 'none'
    }
  }, phone))), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-tertiary)',
      fontSize: 'var(--text-caption-size)',
      fontFamily: 'var(--font-body)'
    }
  }, "\xA9 2026. All rights reserved."));
}
Object.assign(__ds_scope, { Footer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Footer.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavBar.jsx
try { (() => {
/** Top navigation bar — logo left, simple text links right, matches silstone.ai header. */
function NavBar({
  logo,
  links = [],
  cta
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--space-5) var(--container-pad)',
      background: 'var(--bg-canvas-true-black)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center'
    }
  }, logo), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-8)'
    }
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.label,
    href: l.href,
    style: {
      color: 'var(--text-secondary)',
      textDecoration: 'none',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-body-s-size)',
      fontWeight: 500,
      transition: 'color var(--duration-base) var(--ease-standard)'
    },
    onMouseEnter: e => e.currentTarget.style.color = 'var(--text-primary)',
    onMouseLeave: e => e.currentTarget.style.color = 'var(--text-secondary)'
  }, l.label)), cta));
}
Object.assign(__ds_scope, { NavBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/BlogListPage.jsx
try { (() => {
/** Blog list page — grid of post preview cards + pagination, matches /blog-list. */
function BlogListPage({
  NavBar,
  Card,
  Footer
}) {
  const posts = [{
    title: 'How We Helped HAERO Make a Rare Disease Understandable With AI',
    tag: 'Case Study'
  }, {
    title: 'Applied AI vs. Experiments: Why Production-Ready Matters',
    tag: 'Strategy'
  }, {
    title: 'What a 6-Week AI MVP Actually Looks Like',
    tag: 'Process'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--bg-canvas)',
      minHeight: '100%'
    }
  }, NavBar, /*#__PURE__*/React.createElement("section", {
    style: {
      padding: 'var(--space-20) var(--container-pad)',
      maxWidth: 'var(--container-max)',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      color: 'var(--text-primary)',
      fontWeight: 700,
      fontSize: 'var(--text-display-l-size)',
      margin: '0 0 var(--space-10)',
      textAlign: 'center'
    }
  }, "Blog"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: 'var(--space-6)'
    }
  }, posts.map(p => /*#__PURE__*/React.createElement(Card, {
    key: p.title
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 140,
      background: 'var(--ink-700)',
      borderRadius: 'var(--radius-md)',
      marginBottom: 'var(--space-4)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-accent)',
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)'
    }
  }, p.tag), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      color: 'var(--text-primary)',
      fontSize: 18,
      fontWeight: 600,
      margin: '8px 0 0'
    }
  }, p.title)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      gap: 'var(--space-3)',
      marginTop: 'var(--space-10)'
    }
  }, [1, 2, 3, 4].map(n => /*#__PURE__*/React.createElement("span", {
    key: n,
    style: {
      width: 32,
      height: 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius-pill)',
      color: n === 1 ? 'var(--text-on-accent)' : 'var(--text-secondary)',
      background: n === 1 ? 'var(--accent)' : 'transparent',
      fontSize: 14,
      fontFamily: 'var(--font-body)'
    }
  }, n)))), Footer);
}
window.BlogListPage = BlogListPage;
Object.assign(__ds_scope, { BlogListPage });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/BlogListPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/CaseStudy.jsx
try { (() => {
/** Partner strip + case-study teaser ("How We Helped HAERO..."). */
function CaseStudy({
  Badge,
  Card
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: 'var(--space-20) var(--container-pad)',
      background: 'var(--bg-canvas-true-black)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-6)',
      flexWrap: 'wrap',
      padding: 'var(--space-6)',
      borderRadius: 'var(--radius-lg)',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      marginBottom: 'var(--space-12)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/partner-logo-dark.png",
    style: {
      height: 32,
      filter: 'invert(1) brightness(1.5)'
    },
    alt: "AI co-builder"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-secondary)',
      fontSize: 15,
      margin: 0
    }
  }, "Leveraging the latest AI-Coding technology, we speed up delivery by up to ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--accent)'
    }
  }, "40%"), ".")), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, "Case Study"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      color: 'var(--text-primary)',
      fontWeight: 700,
      fontSize: 'var(--text-display-s-size)',
      margin: 'var(--space-4) 0 var(--space-3)',
      maxWidth: 700
    }
  }, "How We Helped HAERO Make a Rare Disease Understandable With AI"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-secondary)',
      fontSize: 16,
      lineHeight: 1.6,
      maxWidth: 620,
      margin: 0
    }
  }, "HAE is a rare and lesser-known disease where data is extremely limited, and whatever exists is difficult for patients and families to understand.")));
}
window.CaseStudy = CaseStudy;
Object.assign(__ds_scope, { CaseStudy });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/CaseStudy.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/ContactPage.jsx
try { (() => {
/** Contact page — form + direct contact card, matches /contact. */
function ContactPage({
  NavBar,
  Button,
  Footer
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--bg-canvas)',
      minHeight: '100%'
    }
  }, NavBar, /*#__PURE__*/React.createElement("section", {
    style: {
      padding: 'var(--space-24) var(--container-pad)',
      maxWidth: 640,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      color: 'var(--text-primary)',
      fontWeight: 700,
      fontSize: 'var(--text-display-l-size)',
      margin: '0 0 var(--space-3)',
      textAlign: 'center'
    }
  }, "Contact Us"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-secondary)',
      textAlign: 'center',
      fontSize: 17,
      margin: '0 0 var(--space-10)'
    }
  }, "Reach out anytime \u2014 we're here to help."), /*#__PURE__*/React.createElement("form", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)'
    },
    onSubmit: e => e.preventDefault()
  }, [['Your Name*', 'text'], ['Your Company Name', 'text'], ['Work Email*', 'email'], ['Your Phone Number*', 'tel']].map(([label, type]) => /*#__PURE__*/React.createElement("label", {
    key: label,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-tertiary)',
      fontSize: 13
    }
  }, label), /*#__PURE__*/React.createElement("input", {
    type: type,
    style: {
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 14px',
      color: 'var(--text-primary)',
      fontSize: 15,
      fontFamily: 'var(--font-body)',
      outline: 'none'
    }
  }))), /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-tertiary)',
      fontSize: 13
    }
  }, "What are you trying to build?"), /*#__PURE__*/React.createElement("textarea", {
    rows: 4,
    style: {
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 14px',
      color: 'var(--text-primary)',
      fontSize: 15,
      fontFamily: 'var(--font-body)',
      outline: 'none',
      resize: 'vertical'
    }
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    style: {
      marginTop: 'var(--space-2)'
    }
  }, "Get in touch"))), Footer);
}
window.ContactPage = ContactPage;
Object.assign(__ds_scope, { ContactPage });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/ContactPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/FaqSection.jsx
try { (() => {
/** FAQ section — "Everything You Need to Know About Working With Silstone.AI" */
function FaqSection({
  FaqItem
}) {
  const faqs = [{
    q: 'Do you work with only specific industries?',
    a: 'No. We build AI solutions across biotech, finance, manufacturing, healthcare, logistics, retail, energy, and more through AI consulting and AI development services.'
  }, {
    q: 'Do you only build chatbots?',
    a: 'Not at all. We create full end-to-end AI systems including models, agents, copilots, prediction engines, and automation pipelines.'
  }, {
    q: 'Can you train AI on our internal documents or datasets?',
    a: 'Absolutely. We securely ingest, process, and train models using our AI document processing and AI software development capabilities.'
  }, {
    q: "What's the usual project timeline?",
    a: 'Prototype → 2–4 weeks. MVP → 6–10 weeks. Full system → 2–4 months.'
  }, {
    q: 'Do you provide AI strategy consulting as well?',
    a: 'Yes. We help organizations define their AI roadmap, identify high-value use cases, and implement systems that scale.'
  }, {
    q: 'What makes Silstone.AI different?',
    a: 'We focus on applied AI that works in the real world, not experiments or prototypes that sit on shelves. Everything we build is practical, secure, scalable, and built for real adoption.'
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: 'var(--space-20) var(--container-pad)',
      background: 'var(--bg-canvas)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 760,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      color: 'var(--text-primary)',
      fontWeight: 700,
      fontSize: 'var(--text-display-s-size)',
      margin: '0 0 var(--space-8)',
      textAlign: 'center'
    }
  }, "Everything You Need to Know About Working With Silstone.AI"), faqs.map(f => /*#__PURE__*/React.createElement(FaqItem, {
    key: f.q,
    question: f.q
  }, f.a))));
}
window.FaqSection = FaqSection;
Object.assign(__ds_scope, { FaqSection });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/FaqSection.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/Hero.jsx
try { (() => {
/** Hero section — full-bleed black/video background, bold emphasized headline, dual CTA. */
function Hero({
  NavBar,
  Button
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: 'relative',
      minHeight: 640,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-canvas-true-black)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("video", {
    autoPlay: true,
    muted: true,
    loop: true,
    playsInline: true,
    src: "https://videos.pexels.com/video-files/3129576/3129576-uhd_2560_1440_30fps.mp4",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      opacity: 0.35
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    }
  }, NavBar, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '0 var(--container-pad)',
      gap: 'var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-display)',
      color: 'var(--text-primary)',
      fontSize: 'var(--text-display-xl-size)',
      fontWeight: 700,
      lineHeight: 1.05,
      letterSpacing: 'var(--tracking-tight)',
      maxWidth: 900,
      margin: 0
    }
  }, "Your ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent)'
    }
  }, "On-Demand"), " AI Product Team"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      color: 'var(--text-secondary)',
      fontSize: 'var(--text-body-l-size)',
      lineHeight: 1.6,
      maxWidth: 640,
      margin: 0
    }
  }, "We partner with ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--text-primary)'
    }
  }, "founders"), ", ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--text-primary)'
    }
  }, "product leaders"), ", and ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--text-primary)'
    }
  }, "engineering teams"), " to design, build, and ship ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--text-primary)'
    }
  }, "AI-powered"), " features that ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--text-primary)'
    }
  }, "work in production"), " \u2014 fast, secure, and built for real users."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-4)',
      flexWrap: 'wrap',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg"
  }, "Book a strategy call"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "lg",
    icon: "\u2192"
  }, "Discover How We Work")))));
}
window.Hero = Hero;
Object.assign(__ds_scope, { Hero });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/Offerings.jsx
try { (() => {
/** "What we build" offerings grid — Card tiles. */
function Offerings({
  Card,
  Badge
}) {
  const items = [{
    title: 'AI Agents & Copilots',
    desc: 'Autonomous and human-in-the-loop agents embedded in your product.'
  }, {
    title: 'Prediction Engines',
    desc: 'Models that forecast, score, and rank on your real production data.'
  }, {
    title: 'AI Document Processing',
    desc: 'Securely ingest, process, and train on internal documents and datasets.'
  }, {
    title: 'Automation Pipelines',
    desc: 'End-to-end workflows that remove manual, repetitive work.'
  }, {
    title: 'AI Strategy Consulting',
    desc: 'Define your roadmap, identify high-value use cases, and scale.'
  }, {
    title: 'AI Software Development',
    desc: 'Full-stack engineering to ship AI features that work in production.'
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: 'var(--space-24) var(--container-pad)',
      background: 'var(--bg-canvas)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "accent"
  }, "What we do"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      color: 'var(--text-primary)',
      fontWeight: 700,
      fontSize: 'var(--text-display-m-size)',
      margin: 'var(--space-4) 0 var(--space-2)',
      maxWidth: 640
    }
  }, "AI Solutions That Adapt to Your Industry, Data & Vision"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: 'var(--space-6)',
      marginTop: 'var(--space-10)'
    }
  }, items.map(it => /*#__PURE__*/React.createElement(Card, {
    key: it.title
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      color: 'var(--text-primary)',
      fontSize: 19,
      fontWeight: 600,
      margin: '0 0 8px'
    }
  }, it.title), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-secondary)',
      fontSize: 15,
      lineHeight: 1.6,
      margin: 0
    }
  }, it.desc))))));
}
window.Offerings = Offerings;
Object.assign(__ds_scope, { Offerings });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/Offerings.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.FaqItem = __ds_scope.FaqItem;

__ds_ns.Footer = __ds_scope.Footer;

__ds_ns.NavBar = __ds_scope.NavBar;

__ds_ns.BlogListPage = __ds_scope.BlogListPage;

__ds_ns.CaseStudy = __ds_scope.CaseStudy;

__ds_ns.ContactPage = __ds_scope.ContactPage;

__ds_ns.FaqSection = __ds_scope.FaqSection;

__ds_ns.Hero = __ds_scope.Hero;

__ds_ns.Offerings = __ds_scope.Offerings;

})();
