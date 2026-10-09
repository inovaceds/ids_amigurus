"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function LogoutButton({ redirectTo = "/auth/login", className }: { redirectTo?: string; className?: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const logout = async () => {
    setIsLoading(true);
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
      router.push(redirectTo);
      router.refresh();
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={logout} variant="outline" size="sm" className={cn(className)} disabled={isLoading}>
      {isLoading && <LoaderCircle className="animate-spin" />}
      {isLoading ? "Cerrando…" : "Cerrar sesión"}
    </Button>
  );
}
