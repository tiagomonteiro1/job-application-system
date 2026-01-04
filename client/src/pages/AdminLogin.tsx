import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Credenciais fixas de admin
    const ADMIN_EMAIL = "tfmlink@gmail.com";
    const ADMIN_PASSWORD = "JobMatch@2024";

    // Simular delay de autenticação
    await new Promise(resolve => setTimeout(resolve, 500));

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Salvar sessão admin no localStorage
      localStorage.setItem("admin_session", "true");
      localStorage.setItem("admin_email", email);
      
      toast.success("Login realizado com sucesso!");
      setLocation("/");
    } else {
      setError("E-mail ou senha incorretos");
      toast.error("Credenciais inválidas");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md border-purple-500/20 bg-slate-900/90 backdrop-blur">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Área Administrativa
          </CardTitle>
          <CardDescription className="text-slate-400">
            Acesso restrito para administradores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold"
            >
              {loading ? "Entrando..." : "Entrar como Admin"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-300 font-medium mb-2">📋 Credenciais de Acesso:</p>
            <p className="text-xs text-slate-400">
              <span className="text-slate-300 font-mono">E-mail:</span> tfmlink@gmail.com<br />
              <span className="text-slate-300 font-mono">Senha:</span> JobMatch@2024
            </p>
          </div>

          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="text-slate-400 hover:text-white"
            >
              Voltar para Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
