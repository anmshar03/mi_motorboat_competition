import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, ArrowUpRight } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { WorkspaceShell } from "@/components/workspace-shell";
import { PageHeading, EmptyState, Badge, Notice } from "@/components/ui";
import type { Competition } from "@/lib/types";
export default async function AdminHome() {
  const { client, memberships } = await requireUser();
  const ids = memberships.filter((m) => m.role === "admin").map((m) => m.competition_id);
  const { data: organizer, error: organizerError } = await client.from("platform_organizers").select("user_id").maybeSingle();
  if (organizerError) throw new Error("Unable to verify competition creation access.");
  if (!organizer && ids.length === 0) notFound();
  const result = ids.length ? await client.from("competitions").select("*").in("id", ids).order("created_at", { ascending: false }) : { data: [], error: null };
  if (result.error) throw new Error("Unable to load your competitions.");
  const competitions = (result.data ?? []) as Competition[];
  return <WorkspaceShell role="admin" canCreate={!!organizer}><PageHeading eyebrow="ORGANIZER PORTAL" title="Your competitions" description="A dedicated workspace for every edition. Teams, configuration, and results stay together." action={organizer ? <Link href="/admin/new" className="button button-primary"><Plus size={16} />Create competition</Link> : undefined} />{competitions.length ? <div className="competition-grid">{competitions.map((c) => <Link href={`/admin/competitions/${c.id}`} className="competition-card" key={c.id}><div className="card-top"><p className="eyebrow">{c.edition}</p><Badge tone={c.is_public ? "green" : "amber"}>{c.is_public ? "Public information" : "Private setup"}</Badge></div><h2>{c.title}</h2><p>{c.description || "Configure your competition and prepare for race day."}</p><span className="text-link">Manage competition <ArrowUpRight size={16} /></span></Link>)}</div> : <div className="panel"><EmptyState title="A new competition starts here." action={<Link href="/admin/new" className="button button-primary"><Plus size={16} />Create your first competition</Link>}>Create an edition, then add this year’s teams, awards, and stages. Everything starts private.</EmptyState></div>}<Notice>Foundation release: competition information management is available. Judge scoring, rubric calculations, and result publishing will be added in the next phases.</Notice></WorkspaceShell>;
}
