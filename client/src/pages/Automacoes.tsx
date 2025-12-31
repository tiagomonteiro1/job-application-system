/**
 * Página de Automações
 * Varredura automática de sites de vagas
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Bot, 
  Play, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ExternalLink, 
  Sparkles,
  Zap,
  Target,
  TrendingUp
} from "lucide-react";
import { getLoginUrl } from "@/const";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Automacoes() {
  const { user, loading: authLoading } = useAuth();
  const [credenciaisDialogOpen, setCredenciaisDialogOpen] = useState(false);
  const [varreduraAtiva, setVarreduraAtiva] = useState<number | null>(null);

  // Queries
  const { data: credenciais, refetch: refetchCredenciais } = trpc.automacoes.getCredenciais.useQuery(undefined, {
    enabled: !!user,
  });
  
  const { data: varreduras, refetch: refetchVarreduras } = trpc.automacoes.listarVarreduras.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: varreduraDetalhes, refetch: refetchDetalhes } = trpc.automacoes.getVarredura.useQuery(
    { varreduraId: varreduraAtiva! },
    { enabled: !!varreduraAtiva, refetchInterval: 3000 }
  );

  // Mutations
  const salvarCredenciais = trpc.automacoes.salvarCredenciais.useMutation();
  const iniciarVarredura = trpc.automacoes.iniciarVarredura.useMutation();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  const handleSalvarCredenciais = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await salvarCredenciais.mutateAsync({
        email: formData.get("email") as string,
        senha: formData.get("senha") as string,
        telefone: formData.get("telefone") as string || undefined,
      });
      
      toast.success("Credenciais salvas com sucesso!");
      setCredenciaisDialogOpen(false);
      refetchCredenciais();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar credenciais");
    }
  };

  const handleIniciarVarredura = async () => {
    try {
      const result = await iniciarVarredura.mutateAsync();
      toast.success(result.message);
      setVarreduraAtiva(result.varreduraId);
      refetchVarreduras();
    } catch (error: any) {
      toast.error(error.message || "Erro ao iniciar varredura");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string; color: string }> = {
      sucesso: { variant: "default", icon: CheckCircle2, label: "Sucesso", color: "text-green-500" },
      pendente: { variant: "secondary", icon: Clock, label: "Pendente", color: "text-yellow-500" },
      erro: { variant: "destructive", icon: XCircle, label: "Erro", color: "text-red-500" },
      em_andamento: { variant: "outline", icon: Bot, label: "Em Andamento", color: "text-blue-500" },
      concluida: { variant: "default", icon: CheckCircle2, label: "Concluída", color: "text-green-500" },
    };

    const config = variants[status] || variants.pendente;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className={`w-3 h-3 ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  const formatData = (data: Date | string) => {
    try {
      return format(new Date(data), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return "-";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Automações Inteligentes
              </h1>
              <p className="text-muted-foreground mt-1">
                Deixe o robô trabalhar por você! Varredura automática em sites de vagas.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card key="stat-total" className="border-none shadow-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total de Varreduras</p>
                  <p className="text-3xl font-bold mt-1">{varreduras?.length || 0}</p>
                </div>
                <Sparkles className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card key="stat-success" className="border-none shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Cadastros Bem-Sucedidos</p>
                  <p className="text-3xl font-bold mt-1">
                    {varreduras?.reduce((acc: number, v: any) => acc + (v.sucessos || 0), 0) || 0}
                  </p>
                </div>
                <CheckCircle2 className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card key="stat-pending" className="border-none shadow-lg bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Pendentes</p>
                  <p className="text-3xl font-bold mt-1">
                    {varreduras?.reduce((acc: number, v: any) => acc + (v.pendentes || 0), 0) || 0}
                  </p>
                </div>
                <Clock className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card key="stat-rate" className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Taxa de Sucesso</p>
                  <p className="text-3xl font-bold mt-1">
                    {varreduras && varreduras.length > 0
                      ? Math.round(
                          (varreduras.reduce((acc: number, v: any) => acc + (v.sucessos || 0), 0) /
                            varreduras.reduce((acc: number, v: any) => acc + (v.totalSites || 1), 0)) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Action Card */}
        <Card className="mb-8 border-none shadow-xl bg-gradient-to-br from-white to-violet-50 dark:from-slate-800 dark:to-purple-900/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Zap className="w-6 h-6 text-violet-600" />
                  Iniciar Varredura Automática
                </CardTitle>
                <CardDescription className="mt-2">
                  O sistema irá percorrer os principais sites de vagas e preencher cadastros automaticamente com suas credenciais
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!credenciais ? (
              <div className="text-center py-8">
                <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Configure suas credenciais primeiro</h3>
                <p className="text-muted-foreground mb-4">
                  Para iniciar a varredura automática, precisamos das suas credenciais de cadastro
                </p>
                <Dialog open={credenciaisDialogOpen} onOpenChange={setCredenciaisDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Configurar Credenciais
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Configurar Credenciais de Cadastro</DialogTitle>
                      <DialogDescription>
                        Estas credenciais serão usadas para preencher formulários automaticamente nos sites de vagas
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSalvarCredenciais} className="space-y-4">
                      <div>
                        <Label htmlFor="email">E-mail *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          defaultValue={credenciais?.email || "tiago@nostrosite.shop"}
                          placeholder="seu@email.com"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="senha">Senha *</Label>
                        <Input
                          id="senha"
                          name="senha"
                          type="password"
                          defaultValue={credenciais?.senha || ""}
                          placeholder="Sua senha padrão"
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Use uma senha padrão que você costuma usar em cadastros
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input
                          id="telefone"
                          name="telefone"
                          type="tel"
                          defaultValue={credenciais?.telefone || "35 99721-3174"}
                          placeholder="(00) 00000-0000"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCredenciaisDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit">
                          Salvar Credenciais
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Credenciais configuradas</p>
                    <p className="font-medium">{credenciais.email}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCredenciaisDialogOpen(true)}
                  >
                    Editar
                  </Button>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-lg py-6"
                  onClick={handleIniciarVarredura}
                  disabled={iniciarVarredura.isPending}
                >
                  {iniciarVarredura.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Iniciando...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Iniciar Varredura Automática
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  A varredura pode levar alguns minutos. Você será notificado quando concluir.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Varredura Ativa */}
        {varreduraDetalhes && varreduraDetalhes.status === 'em_andamento' && (
          <Card className="mb-8 border-violet-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="animate-pulse w-3 h-3 bg-violet-600 rounded-full" />
                Varredura em Andamento
              </CardTitle>
              <CardDescription>
                Processando sites de vagas... {varreduraDetalhes.resultados?.length || 0} de {varreduraDetalhes.totalSites || 8} sites processados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {varreduraDetalhes.resultados?.map((resultado: any) => (
                  <div
                    key={resultado.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusBadge(resultado.status)}
                      <div>
                        <p className="font-medium">{resultado.siteName}</p>
                        <p className="text-xs text-muted-foreground">{resultado.mensagem}</p>
                      </div>
                    </div>
                    {resultado.linkContinuar && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={resultado.linkContinuar} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Histórico de Varreduras */}
        {varreduras && varreduras.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Varreduras</CardTitle>
              <CardDescription>
                {varreduras.length} {varreduras.length === 1 ? 'varredura realizada' : 'varreduras realizadas'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {varreduras.map((varredura: any) => (
                  <div
                    key={varredura.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setVarreduraAtiva(varredura.id)}
                  >
                    <div className="flex items-center gap-4">
                      {getStatusBadge(varredura.status)}
                      <div>
                        <p className="font-medium">
                          {formatData(varredura.dataInicio)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {varredura.totalSites} sites • {varredura.sucessos} sucessos • {varredura.pendentes} pendentes • {varredura.erros} erros
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
