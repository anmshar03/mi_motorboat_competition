// Liveness only: the public site can run before Supabase is configured.
// Never include environment values, identity, or database details here.
export function GET() {
  return Response.json({ status: "ok", service: "model-boat-race" }, {
    headers: { "Cache-Control": "no-store" },
  });
}
