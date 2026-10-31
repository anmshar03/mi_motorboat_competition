import { notFound } from "next/navigation";
import { LockKeyhole, Trophy, Users, Flag, ClipboardCheck, FileText, ShieldCheck } from "lucide-react";
import { requireCompetition } from "@/lib/auth";
import { PageHeading, Notice, TextField, TextArea, EmptyState, Badge } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { addTeam, addAward, addStage, addAnnouncement, saveSettings, setVisibility } from "@/app/admin/actions";
import type { Team, Award, Stage, Announcement } from "@/lib/types";

const headings: Record<string, { title: string; description: string }> = {
  teams: { title: "Teams & schools", description: "Bring this edition’s teams aboard. Publish only the profile information you want to share." },
  awards: { title: "Awards & rubrics", description: "Define this competition’s award categories. No previous-year awards are added automatically." },
  stages: { title: "Competition stages", description: "Build a clear structure for this edition, from preparation to race day." },
  announcements: { title: "Announcements", description: "Prepare updates and choose when to share them with the competition community." },
  settings: { title: "Competition settings", description: "Manage the essentials and control when competition information becomes public." },
  judges: { title: "Judges & assignments", description: "A dedicated place for your competition’s judging team." },
  scores: { title: "Score management", description: "Review evaluations and their approval status." },
  races: { title: "Race management", description: "Prepare race events and record finishing positions." },
  results: { title: "Results & publishing", description: "Review calculated standings before sharing them with the public." },
};

function PublicCheckbox({ announcement = false, checked = false }: { announcement?: boolean; checked?: boolean }) {
  return <label className="checkbox"><input name="is_public" type="checkbox" defaultChecked={checked} /><span><strong>{announcement ? "Publish this announcement" : "Make this information public"}</strong>Visible only when the competition itself is public. This does not publish scores.</span></label>;
}
function VisibilityButton({ id, section, recordId, visible }: { id: string; section: "teams" | "awards" | "stages" | "announcements"; recordId: string; visible: boolean }) {
  return <form action={setVisibility.bind(null, id, section, recordId, !visible)}><SubmitButton className="button button-outline" pendingText="Updating…">{visible ? "Unpublish" : "Publish information"}</SubmitButton></form>;
}

export default async function AdminSection({ params, searchParams }: { params: Promise<{ id: string; section: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { id, section } = await params;
  const query = await searchParams;
  const heading = headings[section];
  if (!heading) notFound();
  const { client, competition } = await requireCompetition(id, "admin");
  const core = ["teams", "awards", "stages", "announcements"].includes(section);
  const response = core ? await client.from(section).select("*").eq("competition_id", id).order(section === "stages" ? "sort_order" : "created_at", { ascending: section === "stages" }) : { data: [], error: null };
  if (response.error) throw new Error("Unable to load competition records.");
  const items = response.data ?? [];
  return <><PageHeading eyebrow={competition.edition} title={heading.title} description={heading.description} />{query.saved && <Notice kind="success">Your changes have been saved.</Notice>}{query.error && <Notice kind="error">{query.error === "duplicate" ? "That code or URL is already in use. Choose a unique value." : query.error === "validation" ? "Check the required fields and input limits, then try again." : "Your change could not be saved. Refresh the page and try again."}</Notice>}{!competition.is_public && core && <Notice>Competition information is private. Published records will appear publicly after you enable the competition in Settings.</Notice>}
  {section === "settings" && <form className="panel form-panel form-stack" action={saveSettings.bind(null, id)}><h2>Competition details</h2><TextField name="title" label="Competition title" required defaultValue={competition.title} /><div className="form-grid"><TextField name="edition" label="Edition label" required maxLength={60} defaultValue={competition.edition} /><TextField name="slug" label="URL slug" required maxLength={80} defaultValue={competition.slug} hint="Changing this URL will change public links to the competition." /></div><TextArea name="description" label="Public introduction" defaultValue={competition.description} /><TextField name="venue" label="Venue" defaultValue={competition.venue ?? ""} maxLength={200} /><label className="field"><span>Competition status</span><select name="status" defaultValue={competition.status}><option value="draft">Draft</option><option value="active">Active</option><option value="completed">Completed</option><option value="archived">Archived</option></select></label><PublicCheckbox checked={competition.is_public} /><div className="form-footer"><SubmitButton>Save competition settings</SubmitButton></div></form>}
  {core && <div className="two-columns"><section className="panel"><div className="panel-heading"><h2>{section === "teams" ? "Participating teams" : section === "awards" ? "Award categories" : section === "stages" ? "Event structure" : "Competition updates"}</h2><Badge>{items.length} {items.length === 1 ? "record" : "records"}</Badge></div>{items.length === 0 ? <EmptyState title={section === "teams" ? "Your teams start here." : section === "awards" ? "Every award has a purpose." : section === "stages" ? "Give your edition a structure." : "Keep everyone in the loop."} icon={section === "teams" ? <Users size={25} /> : section === "awards" ? <Trophy size={25} /> : <FileText size={25} />}>Use the form to add your first record. New information is private unless you explicitly publish it.</EmptyState> : items.map((record) => {
    const row = record as Team & Award & Stage & Announcement;
    const visible = section === "announcements" ? !!row.published_at : row.is_public;
    return <article key={row.id} className="list-row"><div className="list-row-top"><h3>{section === "teams" ? row.name : row.title}</h3><Badge tone={visible ? "green" : "amber"}>{visible ? "Published" : "Private"}</Badge></div>{section === "teams" && <small>{row.code} · {row.school_name}</small>}<p>{section === "teams" ? row.bio : section === "announcements" ? row.body : row.description}</p><div className="list-actions"><VisibilityButton id={id} section={section as "teams" | "awards" | "stages" | "announcements"} recordId={row.id} visible={visible} /></div></article>;
  })}</section><div className="stack">
  {section === "teams" && <form className="panel form-panel form-stack" action={addTeam.bind(null, id)}><h2>Add a team</h2><TextField name="name" label="Team name" required /><TextField name="code" label="Team code" required maxLength={24} hint="A unique code using letters, numbers, underscores, or hyphens." /><TextField name="school_name" label="School / organization display name" required maxLength={200} hint="Public display text only. Do not enter private contact information." /><TextArea name="bio" label="Public team profile" /><PublicCheckbox /><SubmitButton>Add team</SubmitButton></form>}
  {section === "awards" && <><form className="panel form-panel form-stack" action={addAward.bind(null, id)}><h2>Add an award</h2><TextField name="title" label="Award title" required /><TextArea name="description" label="Award description" /><PublicCheckbox /><SubmitButton>Add award category</SubmitButton></form><Notice>Rubric sections, criteria, scoring scales, and weights are planned for Phase 2. Adding an award here does not configure a calculation.</Notice></>}
  {section === "stages" && <form className="panel form-panel form-stack" action={addStage.bind(null, id)}><h2>Add a stage</h2><TextField name="title" label="Stage title" required /><TextArea name="description" label="Stage description" /><TextField name="sort_order" label="Display order" type="number" required defaultValue="0" hint="A whole number from 0 to 9999. Lower values appear first." /><PublicCheckbox /><SubmitButton>Add stage</SubmitButton></form>}
  {section === "announcements" && <form className="panel form-panel form-stack" action={addAnnouncement.bind(null, id)}><h2>Write an announcement</h2><TextField name="title" label="Announcement title" required /><TextArea name="body" label="Message" hint="Required. Up to 5,000 characters; displayed as plain text." /><PublicCheckbox announcement /><SubmitButton>Save announcement</SubmitButton></form>}
  </div></div>}
  {["judges", "scores", "races", "results"].includes(section) && <div className="panel"><EmptyState title={section === "judges" ? "Judging tools are the next stage." : section === "races" ? "Race tools are coming in Phase 3." : section === "results" ? "Publishing starts with verified calculations." : "Score entry is coming in Phase 3."} icon={section === "results" ? <ShieldCheck size={26} /> : section === "races" ? <Flag size={26} /> : <ClipboardCheck size={26} />}>{section === "results" ? "Calculation runs, approvals, public previews, and result publication will be implemented in Phase 4. No scores or standings can be published in this foundation release." : section === "judges" ? "Accounts and competition roles are supported by the foundation. Invitations, team and award assignments, and evaluation forms will be added in Phase 3." : "The foundation is in place. Scoring configuration and verified calculation methods need to be implemented before this workflow is available."}</EmptyState><div className="publication-note"><LockKeyhole size={15} />No historical scores or competition rules have been imported.</div></div>}
  </>;
}
