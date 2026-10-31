import Link from "next/link";
import { notFound } from "next/navigation";
import { publicCompetition, publicDetails } from "@/lib/data";
import { PageHeading, EmptyState } from "@/components/ui";
export default async function TeamProfile({ params }: { params: Promise<{ slug: string; teamId: string }> }) {
  const { slug, teamId } = await params;
  const competition = await publicCompetition(slug);
  if (!competition) notFound();
  const { teams } = await publicDetails(competition.id);
  const team = teams.find((t) => t.id === teamId);
  if (!team) notFound();
  return <><PageHeading eyebrow={team.code} title={team.name} description={team.school_name} /><div className="panel form-panel"><h2>Meet the team</h2><p className="prose">{team.bio || "This team hasn’t published a profile yet."}</p></div><div className="panel" style={{ marginTop: 25 }}><EmptyState title="A competition journey in the making.">Published results for this team will be available as the competition progresses.</EmptyState></div><Link className="text-link" href={`/competitions/${slug}/teams`} style={{ marginTop: 25 }}>Back to all teams</Link></>;
}
