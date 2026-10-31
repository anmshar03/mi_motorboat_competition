import { notFound } from "next/navigation";
import { requireCompetition } from "@/lib/auth";
import { PageHeading, EmptyState } from "@/components/ui";
export default async function JudgeSection({ params }: { params: Promise<{ id: string; section: string }> }) {
  const { id, section } = await params;
  const titles: Record<string, string> = { assignments: "My assignments", saved: "Saved evaluations", submitted: "Submitted evaluations" };
  if (!titles[section]) notFound();
  await requireCompetition(id, "judge");
  return <><PageHeading title={titles[section]} description="The judging workflow is scheduled for Phase 3." /><div className="panel"><EmptyState title="Evaluation tools are being prepared.">Assignment-specific guidelines, draft saving, and submitted evaluations will be available after the scoring workflow is implemented and verified.</EmptyState></div></>;
}
