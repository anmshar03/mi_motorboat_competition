"use server";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser, requireCompetition } from "@/lib/auth";
import { validSlug } from "@/domain/access";

const boundedText = (max: number) => z.string().trim().min(1).max(max);
const detailsSchema = z.object({ title: boundedText(160), slug: boundedText(80).refine(validSlug), edition: boundedText(60), description: z.string().trim().max(5000), venue: z.string().trim().max(200) });
function fields(form: FormData, keys: string[]) { return Object.fromEntries(keys.map((key) => [key, String(form.get(key) ?? "")])); }
const base = (id: string) => `/admin/competitions/${id}`;
function finish(id: string, section: string, error?: string): never {
  revalidatePath("/", "layout");
  redirect(`${base(id)}/${section}?${error ? `error=${error}` : "saved=1"}`);
}

export async function createCompetition(form: FormData) {
  const { client } = await requireUser();
  const input = detailsSchema.safeParse(fields(form, ["title", "slug", "edition", "description", "venue"]));
  if (!input.success) redirect("/admin/new?error=validation");
  const { data, error } = await client.rpc("create_competition", { p_title: input.data.title, p_slug: input.data.slug, p_edition: input.data.edition, p_description: input.data.description, p_venue: input.data.venue || null });
  if (error || !data) redirect(`/admin/new?error=${error?.code === "23505" ? "duplicate" : "save"}`);
  revalidatePath("/admin");
  redirect(base(String(data)));
}

export async function saveSettings(id: string, form: FormData) {
  const { client } = await requireCompetition(id, "admin");
  const input = detailsSchema.safeParse(fields(form, ["title", "slug", "edition", "description", "venue"]));
  if (!input.success) finish(id, "settings", "validation");
  const status = z.enum(["draft", "active", "completed", "archived"]).safeParse(form.get("status"));
  if (!status.success) finish(id, "settings", "validation");
  const { data, error } = await client.from("competitions").update({ ...input.data, venue: input.data.venue || null, status: status.data, is_public: form.get("is_public") === "on" }).eq("id", id).select("id").single();
  finish(id, "settings", error || !data ? (error?.code === "23505" ? "duplicate" : "save") : undefined);
}

export async function addTeam(id: string, form: FormData) {
  const { client } = await requireCompetition(id, "admin");
  const input = z.object({ name: boundedText(160), code: boundedText(24).regex(/^[A-Za-z0-9_-]+$/), school_name: boundedText(200), bio: z.string().trim().max(5000) }).safeParse(fields(form, ["name", "code", "school_name", "bio"]));
  if (!input.success) finish(id, "teams", "validation");
  const { error } = await client.from("teams").insert({ ...input.data, competition_id: id, is_public: form.get("is_public") === "on" });
  finish(id, "teams", error ? (error.code === "23505" ? "duplicate" : "save") : undefined);
}

export async function addAward(id: string, form: FormData) {
  const { client } = await requireCompetition(id, "admin");
  const input = z.object({ title: boundedText(160), description: z.string().trim().max(5000) }).safeParse(fields(form, ["title", "description"]));
  if (!input.success) finish(id, "awards", "validation");
  const { error } = await client.from("awards").insert({ ...input.data, competition_id: id, is_public: form.get("is_public") === "on" });
  finish(id, "awards", error ? "save" : undefined);
}

export async function addStage(id: string, form: FormData) {
  const { client } = await requireCompetition(id, "admin");
  const input = z.object({ title: boundedText(160), description: z.string().trim().max(5000), sort_order: z.coerce.number().int().min(0).max(9999) }).safeParse(fields(form, ["title", "description", "sort_order"]));
  if (!input.success) finish(id, "stages", "validation");
  const { error } = await client.from("stages").insert({ ...input.data, competition_id: id, is_public: form.get("is_public") === "on" });
  finish(id, "stages", error ? "save" : undefined);
}

export async function addAnnouncement(id: string, form: FormData) {
  const { client } = await requireCompetition(id, "admin");
  const input = z.object({ title: boundedText(160), body: boundedText(5000) }).safeParse(fields(form, ["title", "body"]));
  if (!input.success) finish(id, "announcements", "validation");
  const { error } = await client.from("announcements").insert({ ...input.data, competition_id: id, published_at: form.get("is_public") === "on" ? new Date().toISOString() : null });
  finish(id, "announcements", error ? "save" : undefined);
}

export async function setVisibility(id: string, section: "teams" | "awards" | "stages" | "announcements", recordId: string, visible: boolean) {
  const { client } = await requireCompetition(id, "admin");
  const allowed = ["teams", "awards", "stages", "announcements"];
  if (!allowed.includes(section)) throw new Error("Invalid content type.");
  const update = section === "announcements" ? { published_at: visible ? new Date().toISOString() : null } : { is_public: visible };
  const { data, error } = await client.from(section).update(update).eq("competition_id", id).eq("id", recordId).select("id").single();
  finish(id, section, error || !data ? "save" : undefined);
}
