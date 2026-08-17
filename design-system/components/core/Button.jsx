import React from 'react';

/**
 * Primary CTA / secondary / ghost button matching the silstone.ai marketing site.
 * Primary buttons are solid teal with black text (high-contrast on the dark canvas);
 * secondary buttons are outlined; ghost buttons are text-only with an arrow, used for
 * links like "Discover How We Work →".
 */
export function Button({
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
    lg: '16px 32px',
  }[size];
  const sizeText = {
    sm: 'var(--text-body-s-size)',
    md: 'var(--text-body-m-size)',
    lg: 'var(--text-body-l-size)',
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
    whiteSpace: 'nowrap',
  };

  const variants = {
    primary: {
      background: 'var(--accent)',
      color: 'var(--text-on-accent)',
      boxShadow: 'var(--shadow-sm)',
    },
    secondary: {
      background: 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-default)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-accent)',
      padding: '4px 0',
      borderRadius: 0,
    },
  };

  const style = { ...base, ...variants[variant] };

  return (
    <Tag
      style={style}
      onMouseEnter={(e) => {
        if (variant === 'primary') e.currentTarget.style.background = 'var(--accent-hover)';
        if (variant === 'secondary') { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }
        if (variant === 'ghost') e.currentTarget.style.color = 'var(--accent-hover)';
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary') e.currentTarget.style.background = 'var(--accent)';
        if (variant === 'secondary') { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-primary)'; }
        if (variant === 'ghost') e.currentTarget.style.color = 'var(--text-accent)';
      }}
      {...rest}
    >
      {children}
      {icon}
    </Tag>
  );
}
