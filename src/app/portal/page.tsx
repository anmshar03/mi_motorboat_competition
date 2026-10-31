import Link from "next/link";
import { ArrowUpRight, ShieldCheck, ClipboardList, LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { supabaseConfig } from "@/lib/supabase/config";
import { SetupNotice } from "@/components/setup-notice";
import { PageHeading, EmptyState } from "@/components/ui";
import { PublicHeader, PublicFooter } from "@/components/public-shell";
import { signOut } from "../auth/actions";
export const dynamic = "force-dynamic";
export default async function Portal() {
  if (!supabaseConfig()) return <><PublicHeader /><main id="main-content" className="container page-content"><SetupNotice /></main><PublicFooter /></>;
  const { memberships, client } = await requireUser();
  const { data: organizer, error } = await client.from("platform_organizers").select("user_id").maybeSingle();
  if (error) throw new Error("Unable to verify organizer access.");
  const admin = !!organizer || memberships.some((m) => m.role === "admin");
  const judge = memberships.some((m) => m.role === "judge");
  return <><PublicHeader /><main id="main-content" className="container page-content"><PageHeading eyebrow="YOUR WORKSPACE" title="Welcome aboard." description="Choose a workspace to manage or judge your competitions." action={<form action={signOut}><button className="button button-outline"><LogOut size={15} />Sign out</button></form>} /><div className="competition-grid">{admin && <Link href="/admin" className="competition-card"><ShieldCheck size={26} /><h2>Organizer portal</h2><p>Set up competitions, manage teams, and prepare public information.</p><span className="text-link">Open workspace <ArrowUpRight size={16} /></span></Link>}{judge && <Link href="/judge" className="competition-card"><ClipboardList size={26} /><h2>Judge portal</h2><p>Access your competition workspace and assigned evaluations.</p><span className="text-link">Open workspace <ArrowUpRight size={16} /></span></Link>}</div>{!admin && !judge && <div className="panel"><EmptyState title="Your account is ready. Access comes next.">An organizer needs to assign you a competition role before you can enter a workspace.</EmptyState></div>}</main><PublicFooter /></>;
}
