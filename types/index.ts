import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface NavbarItemModel {
  label: string;
  href: string;
  isExternal?: boolean;
}
