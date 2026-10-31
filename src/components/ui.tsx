import Link from "next/link";
import { ArrowUpRight, Anchor, Waves, CircleCheck, CircleDashed, Info } from "lucide-react";
import type { ReactNode } from "react";

export function Brand({ light = false }: { light?: boolean }) {
  return <Link href="/" className={`brand ${light ? "brand-light" : ""}`} aria-label="Model Boat Race home"><span className="brand-icon"><Waves size={25} strokeWidth={1.6} /></span><span>MODEL BOAT RACE<small>MARINE INSTITUTE · MEMORIAL UNIVERSITY</small></span></Link>;
}
export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "amber" | "blue" }) {
  return <span className={`badge badge-${tone}`}><span className="badge-dot" />{children}</span>;
}
export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1><p className="muted">{description}</p></div>{action}</div>;
}
export function EmptyState({ title, children, icon = <Anchor size={26} />, action }: { title: string; children: ReactNode; icon?: ReactNode; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon">{icon}</div><h3>{title}</h3><p>{children}</p>{action}</div>;
}
export function Notice({ children, kind = "info" }: { children: ReactNode; kind?: "info" | "success" | "error" }) {
  return <div className={`notice notice-${kind}`} role={kind === "error" ? "alert" : "status"}><Info size={18} /><div>{children}</div></div>;
}
export function TextField({ label, name, type = "text", required = false, placeholder, defaultValue, hint, maxLength = 160 }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string; defaultValue?: string; hint?: string; maxLength?: number }) {
  return <label className="field"><span>{label}{required && <span className="required"> *</span>}</span><input name={name} type={type} required={required} placeholder={placeholder} defaultValue={defaultValue} maxLength={maxLength} aria-describedby={hint ? `${name}-hint` : undefined} />{hint && <small id={`${name}-hint`}>{hint}</small>}</label>;
}
export function TextArea({ label, name, defaultValue, hint }: { label: string; name: string; defaultValue?: string; hint?: string }) {
  return <label className="field"><span>{label}</span><textarea name={name} rows={4} defaultValue={defaultValue} maxLength={5000} aria-describedby={hint ? `${name}-hint` : undefined} />{hint && <small id={`${name}-hint`}>{hint}</small>}</label>;
}
export function SectionTitle({ title, href, linkText = "View all" }: { title: string; href?: string; linkText?: string }) {
  return <div className="section-title"><h2>{title}</h2>{href && <Link href={href} className="text-link">{linkText}<ArrowUpRight size={15} /></Link>}</div>;
}
export function Step({ number, title, children, done = false }: { number: string; title: string; children: ReactNode; done?: boolean }) {
  return <div className="step"><span className={done ? "step-number done" : "step-number"}>{done ? <CircleCheck size={18} /> : number}</span><div><h3>{title}</h3><p>{children}</p></div>{!done && <CircleDashed className="muted" size={18} />}</div>;
}
