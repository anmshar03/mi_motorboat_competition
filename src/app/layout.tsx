import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Model Boat Race | Marine Institute", template: "%s | Model Boat Race" },
  description: "The Model Boat Race Competition at the Marine Institute, Memorial University. Discover the teams, competition stages, and published results.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a href="#main-content" className="skip-link">Skip to content</a>{children}</body></html>;
}
