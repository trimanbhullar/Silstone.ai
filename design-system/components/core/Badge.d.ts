import { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  tone?: 'accent' | 'neutral';
}

export function Badge(props: BadgeProps): JSX.Element;
