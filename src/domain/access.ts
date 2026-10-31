export type CompetitionRole = "admin" | "judge";
export type Membership = { competition_id: string; role: CompetitionRole };

export function canAccessCompetition(memberships: Membership[], competitionId: string, role: CompetitionRole) {
  return memberships.some((m) => m.competition_id === competitionId && m.role === role);
}

export function safePortalPath(value: unknown, fallback = "/portal") {
  if (typeof value !== "string") return fallback;
  // Allow only internal portal paths. Reject protocol-relative URLs, encodings,
  // backslashes and control characters before constructing any redirects.
  if (!/^\/(admin|judge|portal)(\/|$|\?)/.test(value) || /[\\%\u0000-\u0020\u007f]/.test(value)) return fallback;
  return value;
}

export function validSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 80;
}
