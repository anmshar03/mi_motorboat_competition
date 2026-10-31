"use client";
import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";
export function SubmitButton({ children, pendingText = "Saving…", className = "button button-primary" }: { children: React.ReactNode; pendingText?: string; className?: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" className={className} disabled={pending}>{pending && <LoaderCircle size={16} className="spin" />}{pending ? pendingText : children}</button>;
}
