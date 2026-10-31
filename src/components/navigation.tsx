"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navigation({ links, className = "", label = "Main navigation" }: { links: { href: string; label: string }[]; className?: string; label?: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return <div className={`navigation ${className}`}><button className="mobile-menu icon-button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls={`${label.replaceAll(" ", "-")}-menu`} onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button><nav id={`${label.replaceAll(" ", "-")}-menu`} aria-label={label} className={open ? "nav-links open" : "nav-links"}>{links.map((link) => {
    const active = path === link.href;
    return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={active ? "active" : ""} onClick={() => setOpen(false)}>{link.label}</Link>;
  })}</nav></div>;
}
