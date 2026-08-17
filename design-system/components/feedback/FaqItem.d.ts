import { ReactNode } from 'react';

export interface FaqItemProps {
  question: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function FaqItem(props: FaqItemProps): JSX.Element;
