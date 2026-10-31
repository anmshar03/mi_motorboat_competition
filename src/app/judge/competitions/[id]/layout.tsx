import { WorkspaceShell } from "@/components/workspace-shell";
import { requireCompetition } from "@/lib/auth";
export default async function JudgeCompetitionLayout({ params, children }: { params: Promise<{ id: string }>; children: React.ReactNode }) {
  const { id } = await params;
  const { competition } = await requireCompetition(id, "judge");
  return <WorkspaceShell role="judge" competitionId={id} title={competition.title}>{children}</WorkspaceShell>;
}
