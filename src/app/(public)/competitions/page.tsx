import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PublicHeader, PublicFooter } from "@/components/public-shell";
import { PageHeading, EmptyState, Badge } from "@/components/ui";
import { publicCompetitions } from "@/lib/data";
export const dynamic = "force-dynamic";
export default async function Competitions() {
  const competitions = await publicCompetitions();
  return <><PublicHeader /><main id="main-content" className="container page-content"><PageHeading eyebrow="ON THE WATER" title="The competition, year by year." description="Explore each edition’s teams, stages, announcements, and published results." />{competitions.length ? <div className="competition-grid">{competitions.map((c) => <Link href={`/competitions/${c.slug}`} className="competition-card" key={c.id}><div className="card-top"><span className="eyebrow">{c.edition}</span><Badge tone="blue">{c.status}</Badge></div><h2>{c.title}</h2><p>{c.description}</p><span className="text-link">Explore edition <ArrowUpRight size={16} /></span></Link>)}</div> : <div className="panel"><EmptyState title="Competition details are on their way.">Organizers haven’t published an edition yet. Check back for competition information and participating teams.</EmptyState></div>}</main><PublicFooter /></>;
}
