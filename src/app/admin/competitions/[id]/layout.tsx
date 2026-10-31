import { WorkspaceShell } from "@/components/workspace-shell";
import { requireCompetition } from "@/lib/auth";
export default async function CompetitionAdminLayout({ params, children }: { params: Promise<{ id: string }>; children: React.ReactNode }) {
  const { id } = await params;
  const { competition, user } = await requireCompetition(id, "admin");
  return <WorkspaceShell role="admin" competitionId={id} title={competition.title} initial={(user.email ?? "MI").slice(0, 2).toUpperCase()}>{children}</WorkspaceShell>;
}
