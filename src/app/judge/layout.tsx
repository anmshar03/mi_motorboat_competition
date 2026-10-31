import { supabaseConfig } from "@/lib/supabase/config";
import { requireUser } from "@/lib/auth";
import { SetupNotice } from "@/components/setup-notice";
import { Brand } from "@/components/ui";
export const dynamic = "force-dynamic";
export const metadata = { title: "Judge workspace", robots: { index: false, follow: false } };
export default async function JudgeLayout({ children }: { children: React.ReactNode }) {
  if (!supabaseConfig()) return <main id="main-content" className="container page-content"><Brand /><SetupNotice /></main>;
  await requireUser();
  return children;
}
