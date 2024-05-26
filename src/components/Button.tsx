// src/components/Button.tsx
import { ReactNode } from "react";
import Link from "next/link";

interface ButtonProps {
  href: string;
  children: ReactNode;
  className?: string;
}

const Button = ({ href, children, className = "" }: ButtonProps) => {
  return (
    <Link href={href} className={`px-4 py-2 rounded font ${className}`}>
      {/* <a className={`px-4 py-2 rounded ${className}`}> */}
      {children}
      {/* </a> */}
    </Link>
  );
};

export default Button;
