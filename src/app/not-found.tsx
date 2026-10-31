import Link from "next/link";
import { PublicHeader, PublicFooter } from "@/components/public-shell";
import { EmptyState } from "@/components/ui";
export default function NotFound() {
  return <><PublicHeader /><main id="main-content" className="container page-content"><EmptyState title="This page isn’t available." action={<Link href="/" className="button button-primary">Return home</Link>}>The page may have moved, may not be published, or may require competition access.</EmptyState></main><PublicFooter /></>;
}
