import { ClipboardList, LockKeyhole } from "lucide-react";
import { requireCompetition } from "@/lib/auth";
import { PageHeading, EmptyState, Notice } from "@/components/ui";
export default async function JudgeDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { competition } = await requireCompetition(id, "judge");
  return <><PageHeading eyebrow={competition.edition} title="Welcome to your judge workspace." description="Your access is scoped to this competition. Evaluation tools are being prepared for the next development phase." /><Notice>Foundation release: authentication and competition roles are available. Team/award assignments and score entry are not yet implemented.</Notice><div className="panel"><EmptyState title="Your judging journey starts here." icon={<ClipboardList size={27} />}>Once the assignment workflow is implemented, this dashboard will show only the teams and awards assigned to you.</EmptyState><div className="publication-note"><LockKeyhole size={15} />No evaluation scores or other judges’ submissions are accessible here.</div></div></>;
}
