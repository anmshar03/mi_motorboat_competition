import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, ArrowUpRight, Trophy, Flag, Users, Megaphone, CalendarDays } from "lucide-react";
import { publicCompetition, publicDetails } from "@/lib/data";
import { EmptyState, PageHeading } from "@/components/ui";
const sections: Record<string, { title: string; description: string }> = {
  teams: { title: "Meet the teams", description: "The ideas, people, and schools behind the boats." },
  awards: { title: "Competition awards", description: "Explore the awards configured for this edition." },
  races: { title: "Race results", description: "Approved race results will appear here after publication." },
  leaderboard: { title: "Published standings", description: "Only results approved and published by the organizers appear here." },
  stages: { title: "Competition stages", description: "Follow the competition from preparation to the finish line." },
  announcements: { title: "Competition updates", description: "The latest published information from the organizers." },
  about: { title: "About this edition", description: "Competition information from the organizers." },
};
export default async function PublicSection({ params }: { params: Promise<{ slug: string; section: string }> }) {
  const { slug, section } = await params;
  if (!sections[section]) notFound();
  const competition = await publicCompetition(slug);
  if (!competition) notFound();
  const data = await publicDetails(competition.id);
  const heading = sections[section];
  return <><PageHeading title={heading.title} description={heading.description} />{section === "teams" && (data.teams.length ? <div className="competition-grid">{data.teams.map((t) => <Link className="competition-card" href={`/competitions/${slug}/teams/${t.id}`} key={t.id}><span className="team-initial">{t.code.slice(0, 3)}</span><h2>{t.name}</h2><p>{t.school_name}</p><span className="text-link">Team profile <ArrowUpRight size={16} /></span></Link>)}</div> : <div className="panel"><EmptyState title="Teams will be announced soon." icon={<Users size={25} />}>Participating teams will appear when their profiles are published.</EmptyState></div>)}{section === "awards" && (data.awards.length ? <div className="competition-grid">{data.awards.map((a) => <article className="panel info-card" key={a.id}><Trophy size={24} /><h2>{a.title}</h2><p className="prose">{a.description}</p><p className="muted" style={{ marginTop: 20 }}>Standings have not been published.</p></article>)}</div> : <div className="panel"><EmptyState title="Award details are being prepared." icon={<Trophy size={25} />}>This edition’s award descriptions will appear after organizers publish them.</EmptyState></div>)}{section === "stages" && (data.stages.length ? <div className="panel">{data.stages.map((s) => <article className="list-row" key={s.id}><h3>{s.title}</h3><p>{s.description}</p>{s.starts_at && <small>{new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short", timeZone: competition.timezone }).format(new Date(s.starts_at))}</small>}</article>)}</div> : <div className="panel"><EmptyState title="The schedule is taking shape." icon={<CalendarDays size={25} />}>Published stages and event times will appear here.</EmptyState></div>)}{section === "announcements" && (data.announcements.length ? <div className="panel">{data.announcements.map((a) => <article className="list-row" key={a.id}><small>{new Intl.DateTimeFormat("en-CA", { dateStyle: "long", timeZone: competition.timezone }).format(new Date(a.published_at!))}</small><h3>{a.title}</h3><p>{a.body}</p></article>)}</div> : <div className="panel"><EmptyState title="No announcements yet." icon={<Megaphone size={25} />}>Updates from the organizers will appear here.</EmptyState></div>)}{["races", "leaderboard"].includes(section) && <div className="panel"><EmptyState title="Results haven’t been published." icon={section === "races" ? <Flag size={25} /> : <Trophy size={25} />}>Check back after the organizers approve and publish the results for this edition.</EmptyState><div className="publication-note"><ShieldCheck size={16} />Private evaluations and unpublished scores are never shown here.</div></div>}{section === "about" && <article className="panel form-panel"><p className="prose">{competition.description || "The organizers haven’t added an introduction yet."}</p></article>}</>;
}
