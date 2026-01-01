/**
 * Página de Marketing - Estratégias e Captação de Assinantes
 * Gerencia campanhas, redes sociais e tracking de conversões
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  TrendingUp,
  Users,
  Target,
  Share2,
  Plus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  BarChart3,
  Sparkles,
  CheckCircle,
  Clock,
  Pause,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function Marketing() {
  const [novaEstrategiaOpen, setNovaEstrategiaOpen] = useState(false);
  const [periodo, setPeriodo] = useState<'7dias' | '30dias' | '90dias' | 'total'>('30dias');
  const [estrategiaSelecionada, setEstrategiaSelecionada] = useState<any>(null);

  // Queries
  const { data: estrategias, refetch: refetchEstrategias } = trpc.marketing.getEstrategias.useQuery();
  const { data: estatisticas } = trpc.marketing.getEstatisticasConversao.useQuery({ periodo });
  const { data: performanceLinks } = trpc.marketing.getPerformanceLinks.useQuery();

  // Mutations
  const criarEstrategia = trpc.marketing.criarEstrategia.useMutation({
    onSuccess: () => {
      toast.success("Estratégia criada com sucesso!");
      refetchEstrategias();
      setNovaEstrategiaOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar estratégia");
    },
  });

  const atualizarEstrategia = trpc.marketing.atualizarEstrategia.useMutation({
    onSuccess: () => {
      toast.success("Estratégia atualizada!");
      refetchEstrategias();
    },
  });

  const deletarEstrategia = trpc.marketing.deletarEstrategia.useMutation({
    onSuccess: () => {
      toast.success("Estratégia removida!");
      refetchEstrategias();
    },
  });

  const gerarLink = trpc.marketing.gerarLinkCompartilhamento.useMutation({
    onSuccess: (data) => {
      navigator.clipboard.writeText(data.link);
      toast.success("Link copiado para área de transferência!");
    },
  });

  const handleCriarEstrategia = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await criarEstrategia.mutateAsync({
      nome: formData.get("nome") as string,
      descricao: formData.get("descricao") as string,
      tipo: formData.get("tipo") as any,
      objetivo: formData.get("objetivo") as string,
      metrica_alvo: Number(formData.get("metrica_alvo")) || undefined,
    });
  };

  const handleGerarLink = async (origem: string) => {
    await gerarLink.mutateAsync({
      origem: origem as any,
      campanha: `campanha_${Date.now()}`,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      ativa: { variant: "default" as const, icon: CheckCircle, label: "Ativa", color: "bg-green-500" },
      pausada: { variant: "secondary" as const, icon: Pause, label: "Pausada", color: "bg-yellow-500" },
      concluida: { variant: "outline" as const, icon: Clock, label: "Concluída", color: "bg-gray-500" },
    };

    const config = variants[status as keyof typeof variants] || variants.ativa;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getTipoBadge = (tipo: string) => {
    const colors: Record<string, string> = {
      social_media: "bg-purple-500/20 text-purple-500 border-purple-500",
      email: "bg-blue-500/20 text-blue-500 border-blue-500",
      referral: "bg-green-500/20 text-green-500 border-green-500",
      ads: "bg-red-500/20 text-red-500 border-red-500",
      content: "bg-orange-500/20 text-orange-500 border-orange-500",
      outros: "bg-gray-500/20 text-gray-500 border-gray-500",
    };

    return (
      <Badge variant="outline" className={colors[tipo] || colors.outros}>
        {tipo.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <PageHeader title="Marketing" />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-8 h-8 text-purple-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Marketing & Captação</h1>
            <p className="text-slate-400">Estratégias para atrair novos assinantes</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-900/50 border-slate-800">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="estrategias">Estratégias</TabsTrigger>
            <TabsTrigger value="links">Links de Compartilhamento</TabsTrigger>
            <TabsTrigger value="redes-sociais">Redes Sociais</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            {/* Seletor de Período */}
            <div className="flex justify-end">
              <Select value={periodo} onValueChange={(v: any) => setPeriodo(v)}>
                <SelectTrigger className="w-48 bg-slate-900/50 border-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                  <SelectItem value="30dias">Últimos 30 dias</SelectItem>
                  <SelectItem value="90dias">Últimos 90 dias</SelectItem>
                  <SelectItem value="total">Total</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Total de Assinantes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">
                    {estatisticas?.total_assinantes || 0}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Período selecionado</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400">Instagram</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-400">
                    {estatisticas?.por_origem.instagram || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400">Facebook</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">
                    {estatisticas?.por_origem.facebook || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400">LinkedIn</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-cyan-400">
                    {estatisticas?.por_origem.linkedin || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Distribuição por Origem */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Distribuição por Origem</CardTitle>
                <CardDescription className="text-slate-400">
                  De onde vêm seus assinantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {estatisticas && Object.entries(estatisticas.por_origem).map(([origem, valor]) => (
                    <div key={origem} className="flex items-center justify-between">
                      <span className="text-slate-300 capitalize">{origem}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-slate-800 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{
                              width: `${estatisticas.total_assinantes > 0 
                                ? ((valor as number) / estatisticas.total_assinantes) * 100 
                                : 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-white font-semibold w-12 text-right">{valor as number}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Estratégias */}
          <TabsContent value="estrategias" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Minhas Estratégias</h2>
              <Dialog open={novaEstrategiaOpen} onOpenChange={setNovaEstrategiaOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Estratégia
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-800 text-white">
                  <DialogHeader>
                    <DialogTitle>Criar Nova Estratégia</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Defina uma nova estratégia de marketing
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCriarEstrategia} className="space-y-4">
                    <div>
                      <Label className="text-slate-300">Nome da Estratégia</Label>
                      <Input
                        name="nome"
                        required
                        placeholder="Ex: Campanha Instagram Q1"
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Descrição</Label>
                      <Textarea
                        name="descricao"
                        required
                        placeholder="Descreva sua estratégia..."
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Tipo</Label>
                      <Select name="tipo" required>
                        <SelectTrigger className="bg-slate-800/50 border-slate-700">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="social_media">Redes Sociais</SelectItem>
                          <SelectItem value="email">Email Marketing</SelectItem>
                          <SelectItem value="referral">Programa de Indicação</SelectItem>
                          <SelectItem value="ads">Anúncios Pagos</SelectItem>
                          <SelectItem value="content">Marketing de Conteúdo</SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-slate-300">Objetivo</Label>
                      <Input
                        name="objetivo"
                        required
                        placeholder="Ex: Aumentar assinantes em 20%"
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Meta Numérica (opcional)</Label>
                      <Input
                        name="metrica_alvo"
                        type="number"
                        placeholder="Ex: 100"
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setNovaEstrategiaOpen(false)}
                        className="border-slate-700"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={criarEstrategia.isPending}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {criarEstrategia.isPending ? "Criando..." : "Criar Estratégia"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {estrategias && estrategias.length > 0 ? (
                estrategias.map((estrategia: any) => (
                  <Card key={estrategia.id} className="bg-slate-900/50 border-slate-800">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white text-lg">{estrategia.nome}</CardTitle>
                          <div className="flex gap-2 mt-2">
                            {getTipoBadge(estrategia.tipo)}
                            {getStatusBadge(estrategia.status)}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletarEstrategia.mutate({ id: estrategia.id })}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-400 text-sm mb-4">{estrategia.descricao}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Objetivo:</span>
                          <span className="text-slate-300">{estrategia.objetivo}</span>
                        </div>
                        {estrategia.metrica_alvo && (
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-slate-500">Progresso:</span>
                              <span className="text-slate-300">
                                {estrategia.metrica_atual || 0} / {estrategia.metrica_alvo}
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2">
                              <div
                                className="bg-purple-500 h-2 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    ((estrategia.metrica_atual || 0) / estrategia.metrica_alvo) * 100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="col-span-full bg-slate-900/50 border-slate-800">
                  <CardContent className="py-12 text-center">
                    <Target className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg">Nenhuma estratégia criada ainda</p>
                    <p className="text-slate-500 text-sm mt-2">
                      Clique em "Nova Estratégia" para começar
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Links de Compartilhamento */}
          <TabsContent value="links" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Gerar Links de Compartilhamento</CardTitle>
                <CardDescription className="text-slate-400">
                  Crie links rastreáveis para suas redes sociais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['instagram', 'facebook', 'linkedin', 'twitter', 'tiktok', 'youtube', 'whatsapp', 'email'].map((rede) => (
                    <Button
                      key={rede}
                      variant="outline"
                      onClick={() => handleGerarLink(rede)}
                      disabled={gerarLink.isPending}
                      className="border-slate-700 hover:bg-slate-800"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      {rede.charAt(0).toUpperCase() + rede.slice(1)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Performance dos Links</CardTitle>
                <CardDescription className="text-slate-400">
                  Acompanhe cliques e conversões
                </CardDescription>
              </CardHeader>
              <CardContent>
                {performanceLinks && performanceLinks.length > 0 ? (
                  <div className="space-y-3">
                    {performanceLinks.map((link: any) => (
                      <div
                        key={link.id}
                        className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="capitalize">
                              {link.origem}
                            </Badge>
                            {link.campanha && (
                              <span className="text-xs text-slate-500">{link.campanha}</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 font-mono">{link.codigo}</p>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <p className="text-slate-500">Cliques</p>
                            <p className="text-white font-semibold">{link.cliques}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-slate-500">Conversões</p>
                            <p className="text-green-400 font-semibold">{link.conversoes}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-slate-500">Taxa</p>
                            <p className="text-purple-400 font-semibold">{link.taxa_conversao || 0}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400">Nenhum link gerado ainda</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Redes Sociais */}
          <TabsContent value="redes-sociais">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="py-12 text-center">
                <Share2 className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                <p className="text-white text-lg mb-2">Cadastro de Redes Sociais</p>
                <p className="text-slate-400 mb-6">
                  Gerencie seus perfis de redes sociais em uma página dedicada
                </p>
                <Button
                  onClick={() => window.location.href = '/marketing/redes-sociais'}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Ir para Redes Sociais
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
