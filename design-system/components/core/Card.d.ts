import { ReactNode, CSSProperties } from 'react';

export interface CardProps {
  children: ReactNode;
  /** Whether the border highlights teal on hover. Default true. */
  hoverable?: boolean;
  style?: CSSProperties;
}

export function Card(props: CardProps): JSX.Element;
