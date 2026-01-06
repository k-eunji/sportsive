//src/components/ui/SoftButton.tsx

"use client";

import * as React from "react";
import Link from "next/link";

type SoftButtonProps =
  | ({
      as?: "button";
    } & React.ButtonHTMLAttributes<HTMLButtonElement>)
  | ({
      as: "link";
      href: string;
    } & React.AnchorHTMLAttributes<HTMLAnchorElement>);

export default function SoftButton(props: SoftButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 " +
    "rounded-full px-4 py-2 text-sm font-medium " +
    "border border-border/60 bg-background/60 " +
    "backdrop-blur supports-[backdrop-filter]:bg-background/40 " +
    "shadow-sm shadow-black/5 " +
    "transition " +
    "hover:bg-background/80 hover:border-border " +
    "active:scale-[0.99]";

  if (props.as === "link") {
    const { as, href, className, children, ...rest } = props;
    return (
      <Link href={href} className={`${base} ${className ?? ""}`} {...rest}>
        {children}
      </Link>
    );
  }

  const { as, className, children, ...rest } = props as any;

  return (
    <button className={`${base} ${className ?? ""}`} {...rest}>
      {children}
    </button>
  );
}
