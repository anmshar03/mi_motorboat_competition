export type Competition = {
  id: string; slug: string; title: string; edition: string; description: string;
  venue: string | null; starts_at: string | null; timezone: string;
  status: "draft" | "active" | "completed" | "archived"; is_public: boolean;
  created_at: string;
};
export type Team = { id: string; competition_id: string; name: string; code: string; school_name: string; bio: string; is_public: boolean };
export type Award = { id: string; competition_id: string; title: string; description: string; is_public: boolean };
export type Stage = { id: string; competition_id: string; title: string; description: string; starts_at: string | null; sort_order: number; is_public: boolean };
export type Announcement = { id: string; competition_id: string; title: string; body: string; published_at: string | null };
