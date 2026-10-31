import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { WorkspaceShell } from "@/components/workspace-shell";
import { PageHeading, TextField, TextArea, Notice } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { createCompetition } from "../actions";
export default async function NewCompetition({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { client } = await requireUser();
  const { data: organizer, error } = await client.from("platform_organizers").select("user_id").maybeSingle();
  if (error || !organizer) notFound();
  const query = await searchParams;
  return <WorkspaceShell role="admin" canCreate><PageHeading eyebrow="A NEW EDITION" title="Create a competition" description="Start with the essentials. Your new competition stays private until you choose to publish its information." />{query.error && <Notice kind="error">{query.error === "duplicate" ? "That competition URL is already in use. Choose a different slug." : "The competition could not be created. Check the required fields and your organizer access."}</Notice>}<form action={createCompetition} className="panel form-panel form-stack"><h2>Competition details</h2><TextField label="Competition title" name="title" required placeholder="Model Boat Race Competition" /><div className="form-grid"><TextField label="Edition label" name="edition" required placeholder="Enter the competition year or edition" maxLength={60} /><TextField label="URL slug" name="slug" required maxLength={80} placeholder="model-boat-race-year" hint="Lowercase letters, numbers, and single hyphens. Must be unique." /></div><TextArea label="Public introduction" name="description" hint="Use confirmed information. You can update this later." /><TextField label="Venue" name="venue" maxLength={200} /><div className="form-footer"><Link href="/admin" className="button button-outline">Cancel</Link><SubmitButton>Create private competition</SubmitButton></div></form></WorkspaceShell>;
}
