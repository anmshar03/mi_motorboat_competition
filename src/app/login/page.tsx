import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Brand, Notice } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { SetupNotice } from "@/components/setup-notice";
import { supabaseConfig } from "@/lib/supabase/config";
import { safePortalPath } from "@/domain/access";
import { signIn } from "../auth/actions";
export const dynamic = "force-dynamic";
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const query = await searchParams;
  if (!supabaseConfig()) return <main id="main-content" className="container page-content"><Brand /><SetupNotice /></main>;
  return <div className="auth-page"><aside className="auth-aside"><Brand light /><div><p className="eyebrow" style={{ color: "#9ec6d6" }}>THE COMPETITION WORKSPACE</p><h1>Great competition.<br />Thoughtfully managed.</h1><p>One place for organizers and judges to keep the competition moving.</p></div><small>Marine Institute · Memorial University of Newfoundland</small></aside><main id="main-content" className="auth-main"><div className="auth-box"><ShieldCheck size={27} color="#176c86" /><h2>Welcome back.</h2><p className="muted">Sign in to your competition workspace.</p>{query.error && <Notice kind="error">We couldn’t sign you in. Check your email and password, or contact your competition organizer.</Notice>}<form action={signIn}><input type="hidden" name="next" value={safePortalPath(query.next)} /><label className="field"><span>Email address</span><input name="email" type="email" autoComplete="username" required maxLength={254} placeholder="you@example.ca" /></label><label className="field"><span>Password</span><input name="password" type="password" autoComplete="current-password" required maxLength={256} /></label><SubmitButton pendingText="Signing in…">Sign in to your workspace</SubmitButton></form><p className="auth-help">Accounts are provided by the competition organizers. If you need access or a password reset, contact your organizer.</p><Link href="/" className="text-link"><ArrowLeft size={15} /> Back to the competition</Link></div></main></div>;
}
