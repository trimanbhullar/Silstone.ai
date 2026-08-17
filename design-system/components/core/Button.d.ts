import { ReactNode, ElementType } from 'react';

export interface ButtonProps {
  children: ReactNode;
  /** Visual style. Primary = solid teal pill (main CTA). Secondary = outlined. Ghost = text link with arrow. */
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  /** Optional trailing icon/arrow node, e.g. an arrow glyph. */
  icon?: ReactNode;
  /** Render as a different element, e.g. 'a' for link-styled CTAs. */
  as?: ElementType;
}

export function Button(props: ButtonProps): JSX.Element;
