import Link from "next/link";
import { Database, ArrowUpRight } from "lucide-react";
import { PageHeading, Step } from "./ui";

export function SetupNotice() {
  return <div className="setup-page"><div className="empty-icon"><Database size={26} /></div><PageHeading eyebrow="PLATFORM FOUNDATION" title="Connect your competition workspace." description="The application is ready for its database connection. An organizer needs to complete the local or hosted Supabase setup before staff can sign in." /><div className="panel"><Step number="01" title="Configure Supabase">Follow docs/setup.md, apply the foundation migration, and copy the project URL and publishable key into .env.local.</Step><Step number="02" title="Provision the first organizer">Create an Auth user and a platform organizer record using the documented SQL. There is no public administrator signup.</Step><Step number="03" title="Create your competition">Sign in to set up an edition, teams, awards, stages, and public information.</Step></div><Link href="/" className="text-link">Return to the public website <ArrowUpRight size={16} /></Link></div>;
}
