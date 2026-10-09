"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const supabase = createClient();
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });

    if (loginError || !data.user) {
      setError("El correo o la contraseña no son correctos.");
      setIsLoading(false);
      return;
    }

    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (roleError || userRole?.role !== "admin") {
      await supabase.auth.signOut();
      setError("Esta cuenta no tiene permisos de administración.");
      setIsLoading(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <Card className="border-stone-200 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Acceso administrativo</CardTitle>
        <CardDescription>Ingresa con una cuenta autorizada para administrar Amigurus.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="admin-email">Correo electrónico</Label>
            <Input id="admin-email" type="email" autoComplete="email" placeholder="nombre@correo.com" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-password">Contraseña</Label>
            <Input id="admin-password" type="password" autoComplete="current-password" placeholder="Ingresa tu contraseña" required value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <LoaderCircle className="animate-spin" />}
            {isLoading ? "Verificando…" : "Entrar al panel"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
