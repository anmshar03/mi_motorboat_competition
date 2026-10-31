"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfig } from "@/lib/supabase/config";
import { safePortalPath } from "@/domain/access";

export async function signIn(form: FormData) {
  if (!supabaseConfig()) redirect("/login?error=setup");
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const next = safePortalPath(form.get("next"));
  if (!email || !password || email.length > 254 || password.length > 256) redirect("/login?error=credentials");
  const client = await createClient();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) redirect("/login?error=credentials");
  redirect(next);
}

export async function signOut() {
  const client = await createClient();
  const { error } = await client.auth.signOut();
  if (error) throw new Error("We couldn’t sign you out. Please try again.");
  redirect("/login");
}
