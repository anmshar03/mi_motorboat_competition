import { test } from "node:test";
import assert from "node:assert/strict";
import { canAccessCompetition, safePortalPath, validSlug } from "../src/domain/access.ts";

test("roles apply only to the explicit competition and interface", () => {
  const memberships = [{ competition_id: "edition-a", role: "judge" }, { competition_id: "edition-b", role: "admin" }];
  assert.equal(canAccessCompetition(memberships, "edition-a", "judge"), true);
  assert.equal(canAccessCompetition(memberships, "edition-a", "admin"), false);
  assert.equal(canAccessCompetition(memberships, "edition-b", "judge"), false);
  assert.equal(canAccessCompetition([], "edition-b", "admin"), false);
});

test("login redirect destinations cannot escape the internal portals", () => {
  for (const path of ["https://evil.test", "//evil.test", "/admin\\evil", "/admin/%2f%2fevil", "/administrator", "/admin\n", null, "/login"]) {
    assert.equal(safePortalPath(path), "/portal");
  }
  assert.equal(safePortalPath("/admin/competitions/abc"), "/admin/competitions/abc");
  assert.equal(safePortalPath("/judge"), "/judge");
});

test("competition URLs use bounded, unambiguous slugs", () => {
  assert.equal(validSlug("boat-race-2027"), true);
  for (const value of ["", "../admin", "A Team", "-race", "race--a", "a".repeat(81)]) assert.equal(validSlug(value), false);
});
