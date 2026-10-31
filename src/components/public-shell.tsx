import Link from "next/link";
import { ArrowUpRight, Waves } from "lucide-react";
import { Brand } from "./ui";
import { Navigation } from "./navigation";

export function PublicHeader({ slug }: { slug?: string }) {
  const root = slug ? `/competitions/${slug}` : "";
  const links = slug ? [{ href: root, label: "Overview" }, ...["teams", "awards", "races", "leaderboard", "stages", "announcements"].map((key) => ({ href: `${root}/${key}`, label: ({ teams: "Teams", awards: "Awards", races: "Race results", leaderboard: "Leaderboard", stages: "Stages", announcements: "Updates" } as Record<string, string>)[key] }))] : [{ href: "/", label: "Home" }, { href: "/competitions", label: "Competitions" }, { href: "/about", label: "About the competition" }];
  return <><div className="institution-bar"><span>A Marine Institute competition</span><span>Memorial University of Newfoundland</span></div><header className="public-header"><div className="container header-inner"><Brand /><Navigation links={links} /><Link className="button button-outline portal-link" href="/portal">Staff & judges <ArrowUpRight size={16} /></Link></div></header></>;
}
export function PublicFooter() {
  return <footer className="public-footer"><div className="container footer-inner"><Brand /><p>Ideas take shape. Teams make waves.</p><Link href="/about">About this competition <ArrowUpRight size={15} /></Link></div><div className="container footer-bottom"><span>Marine Institute · Memorial University of Newfoundland</span><span><Waves size={15} /> Model Boat Race Competition</span></div></footer>;
}
