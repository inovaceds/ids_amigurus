"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils";

export function SubmitButton({
  children,
  pendingText,
  className,
}: {
  children: React.ReactNode;
  pendingText: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-5 py-3 font-medium text-white transition hover:bg-stone-700 disabled:cursor-wait disabled:opacity-70",
        className,
      )}
    >
      {pending && <LoaderCircle size={18} className="animate-spin" />}
      {pending ? pendingText : children}
    </button>
  );
}
