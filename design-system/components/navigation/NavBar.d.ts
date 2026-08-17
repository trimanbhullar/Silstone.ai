import { ReactNode } from 'react';

export interface NavLink {
  label: string;
  href: string;
}
export interface NavBarProps {
  logo: ReactNode;
  links?: NavLink[];
  cta?: ReactNode;
}

export function NavBar(props: NavBarProps): JSX.Element;
