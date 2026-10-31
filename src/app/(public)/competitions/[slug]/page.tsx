import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Users, Flag, Trophy, Megaphone } from "lucide-react";
import { publicCompetition, publicDetails } from "@/lib/data";
import { EmptyState, SectionTitle } from "@/components/ui";
export default async function CompetitionOverview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const competition = await publicCompetition(slug);
  if (!competition) notFound();
  const details = await publicDetails(competition.id);
  return <><div className="three-columns">{[{ icon: Users, title: "Meet the teams", path: "teams", text: "Discover the teams bringing their boats to the starting line." }, { icon: Flag, title: "Follow the races", path: "races", text: "Find published race results and finishing positions." }, { icon: Trophy, title: "Award standings", path: "awards", text: "Explore this edition’s awards and published standings." }].map((item) => <Link key={item.path} href={`/competitions/${slug}/${item.path}`} className="panel info-card"><item.icon size={25} /><h2>{item.title}</h2><p className="muted">{item.text}</p><span className="text-link" style={{ marginTop: 18 }}>Explore <ArrowUpRight size={16} /></span></Link>)}</div><section className="section-space"><SectionTitle title="Latest announcements" href={`/competitions/${slug}/announcements`} />{details.announcements.length ? <div className="panel">{details.announcements.slice(0, 3).map((a) => <article className="list-row" key={a.id}><h3>{a.title}</h3><p>{a.body}</p></article>)}</div> : <div className="panel"><EmptyState title="You’re up to date." icon={<Megaphone size={25} />}>Published announcements will appear here as the competition approaches.</EmptyState></div>}</section></>;
}
