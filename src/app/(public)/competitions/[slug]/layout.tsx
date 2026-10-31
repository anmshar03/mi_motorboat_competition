import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { PublicHeader, PublicFooter } from "@/components/public-shell";
import { Badge } from "@/components/ui";
import { publicCompetition } from "@/lib/data";
export const dynamic = "force-dynamic";
export default async function CompetitionLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const competition = await publicCompetition(slug);
  if (!competition) notFound();
  return <><PublicHeader slug={slug} /><div className="edition-banner"><div className="container"><div className="card-top"><p className="eyebrow">{competition.edition} · MODEL BOAT RACE</p><Badge tone={competition.status === "active" ? "green" : "neutral"}>{competition.status}</Badge></div><h1>{competition.title}</h1><p className="muted">{competition.description}</p><div className="edition-meta">{competition.starts_at && <span><CalendarDays size={15} />{new Intl.DateTimeFormat("en-CA", { dateStyle: "long", timeZone: competition.timezone }).format(new Date(competition.starts_at))}</span>}{competition.venue && <span><MapPin size={15} />{competition.venue}</span>}</div></div></div><main id="main-content" className="container page-content">{children}</main><PublicFooter /></>;
}
