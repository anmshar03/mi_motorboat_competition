"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main id="main-content" className="container page-content"><div className="empty-state"><h1>We couldn’t load this page.</h1><p>Your changes may still be saved. Please try again before re-entering information.</p><button className="button button-primary" onClick={reset}>Try again</button><Link href="/" className="text-link">Return home</Link></div></main>;
}
