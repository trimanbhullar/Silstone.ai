import { ReactNode } from 'react';

export interface FooterProps {
  logo: ReactNode;
  email?: string;
  phone?: string;
}

export function Footer(props: FooterProps): JSX.Element;
