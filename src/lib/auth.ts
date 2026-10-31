import "server-only";
import { redirect, notFound } from "next/navigation";
import { createClient } from "./supabase/server";
import { canAccessCompetition, type Membership, type CompetitionRole } from "@/domain/access";

export async function requireUser() {
  const client = await createClient();
  // getUser also checks the current session against Auth, including revocation.
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) redirect("/login");
  const { data: memberships, error: membershipError } = await client.from("competition_memberships").select("competition_id, role").eq("user_id", user.id);
  if (membershipError) throw new Error("Unable to verify competition access. Please try again.");
  return { client, user, memberships: (memberships ?? []) as Membership[] };
}

export async function requireCompetition(id: string, role: CompetitionRole) {
  const context = await requireUser();
  if (!canAccessCompetition(context.memberships, id, role)) notFound();
  const { data: competition, error } = await context.client.from("competitions").select("*").eq("id", id).single();
  if (error || !competition) notFound();
  return { ...context, competition };
}
