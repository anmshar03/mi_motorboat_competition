import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { WorkspaceShell } from "@/components/workspace-shell";
import { PageHeading, EmptyState, Badge } from "@/components/ui";
import type { Competition } from "@/lib/types";
export default async function JudgeHome() {
  const { client, memberships } = await requireUser();
  const ids = memberships.filter((m) => m.role === "judge").map((m) => m.competition_id);
  const response = ids.length ? await client.from("competitions").select("*").in("id", ids).order("created_at", { ascending: false }) : { data: [], error: null };
  if (response.error) throw new Error("Unable to load judge memberships.");
  const competitions = (response.data ?? []) as Competition[];
  return <WorkspaceShell role="judge"><PageHeading eyebrow="JUDGE PORTAL" title="Your competition workspace" description="Each edition has its own judging team and guidelines. Choose a competition to continue." />{competitions.length ? <div className="competition-grid">{competitions.map((c) => <Link className="competition-card" href={`/judge/competitions/${c.id}`} key={c.id}><div className="card-top"><p className="eyebrow">{c.edition}</p><Badge tone="blue">Judge access</Badge></div><h2>{c.title}</h2><p>{c.description}</p><span className="text-link">Open workspace <ArrowUpRight size={16} /></span></Link>)}</div> : <div className="panel"><EmptyState title="You haven’t been assigned a competition.">Contact an organizer to receive judge access for the appropriate edition.</EmptyState></div>}</WorkspaceShell>;
}
