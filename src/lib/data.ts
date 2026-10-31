import "server-only";
import { createClient } from "./supabase/server";
import { supabaseConfig } from "./supabase/config";
import type { Competition, Team, Award, Stage, Announcement } from "./types";

export async function publicCompetitions(): Promise<Competition[]> {
  if (!supabaseConfig()) return [];
  const client = await createClient();
  const { data, error } = await client.from("competitions").select("*").eq("is_public", true).order("created_at", { ascending: false });
  if (error) throw new Error("Competition information is temporarily unavailable.");
  return data ?? [];
}

export async function publicCompetition(slug: string) {
  if (!supabaseConfig()) return null;
  const client = await createClient();
  const { data, error } = await client.from("competitions").select("*").eq("slug", slug).eq("is_public", true).maybeSingle();
  if (error) throw new Error("Competition information is temporarily unavailable.");
  return data as Competition | null;
}

export async function publicDetails(id: string) {
  const client = await createClient();
  const responses = await Promise.all([
    client.from("teams").select("*").eq("competition_id", id).eq("is_public", true).order("name"),
    client.from("awards").select("*").eq("competition_id", id).eq("is_public", true).order("title"),
    client.from("stages").select("*").eq("competition_id", id).eq("is_public", true).order("sort_order"),
    client.from("announcements").select("*").eq("competition_id", id).not("published_at", "is", null).lte("published_at", new Date().toISOString()).order("published_at", { ascending: false }),
  ]);
  if (responses.some((r) => r.error)) throw new Error("Competition details are temporarily unavailable.");
  return { teams: (responses[0].data ?? []) as Team[], awards: (responses[1].data ?? []) as Award[], stages: (responses[2].data ?? []) as Stage[], announcements: (responses[3].data ?? []) as Announcement[] };
}
