
"use client";

import React, { useState } from "react";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Lock, User as UserIcon } from "lucide-react";

export function Login() {
  const auth = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Convertimos el nombre de usuario en un formato de email para Firebase Auth
    const fakeEmail = `${username.trim().toLowerCase()}@contactvault.local`;

    try {
      await signInWithEmailAndPassword(auth, fakeEmail, password);
    } catch (err: any) {
      console.error("Login error:", err.code);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("Usuario o contraseña incorrectos.");
      } else {
        setError("Ocurrió un error al intentar ingresar.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl border-border/40">
        <CardHeader className="space-y-1 flex flex-col items-center pb-8">
          <div className="p-4 bg-primary/10 rounded-full mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline text-center font-bold text-primary">Acceso Privado</CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            Ingresá tus credenciales de ContactVault.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive font-medium text-center">{error}</p>
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 h-11 text-lg font-medium shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading ? "Verificando..." : "Entrar"}
            </Button>
            <p className="text-xs text-center text-muted-foreground pt-2">
              Nota: El usuario debe estar registrado previamente en el sistema.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
