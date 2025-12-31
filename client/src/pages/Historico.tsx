import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Briefcase, Calendar, CheckCircle2, Clock, ExternalLink, FileText, History, Link2, Loader2, MapPin, Star, XCircle } from "lucide-react";
import { useState } from "react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

export default function Historico() {
  const { user, isAuthenticated } = useAuth();
  const { data: candidaturas, isLoading } = trpc.candidatura.historico.useQuery();
  const atualizarStatusMutation = trpc.candidatura.atualizarStatus.useMutation();
  const confirmarEntregaMutation = trpc.candidatura.confirmarEntrega.useMutation();
  const marcarNaoEntregueMutation = trpc.candidatura.marcarNaoEntregue.useMutation();
  const atualizarLinkMutation = trpc.candidatura.atualizarLinkValidacao.useMutation();
  const utils = trpc.useUtils();

  const [linkValidacao, setLinkValidacao] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [candidaturaAtual, setCandidaturaAtual] = useState<number | null>(null);
  const [showConfirmarDialog, setShowConfirmarDialog] = useState(false);
  const [showNaoEntregueDialog, setShowNaoEntregueDialog] = useState(false);

  const handleAtualizarStatus = async (candidaturaId: number, status: string) => {
    try {
      await atualizarStatusMutation.mutateAsync({
        candidaturaId,
        status: status as any,
      });
      toast.success("Status atualizado!");
      utils.candidatura.historico.invalidate();
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleConfirmarEntrega = async () => {
    if (!candidaturaAtual) return;

    try {
      await confirmarEntregaMutation.mutateAsync({
        candidaturaId: candidaturaAtual,
        linkValidacao: linkValidacao || undefined,
        observacoes: observacoes || undefined,
      });
      toast.success("Entrega confirmada!");
      utils.candidatura.historico.invalidate();
      setShowConfirmarDialog(false);
      setLinkValidacao("");
      setObservacoes("");
      setCandidaturaAtual(null);
    } catch (error) {
      toast.error("Erro ao confirmar entrega");
    }
  };

  const handleMarcarNaoEntregue = async () => {
    if (!candidaturaAtual) return;

    try {
      await marcarNaoEntregueMutation.mutateAsync({
        candidaturaId: candidaturaAtual,
        observacoes: observacoes || undefined,
      });
      toast.success("Marcado como não entregue");
      utils.candidatura.historico.invalidate();
      setShowNaoEntregueDialog(false);
      setObservacoes("");
      setCandidaturaAtual(null);
    } catch (error) {
      toast.error("Erro ao marcar como não entregue");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-500";
      case "sent":
        return "bg-blue-500/20 text-blue-500";
      case "viewed":
        return "bg-purple-500/20 text-purple-500";
      case "rejected":
        return "bg-red-500/20 text-red-500";
      case "accepted":
        return "bg-green-500/20 text-green-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "sent":
        return "Enviado";
      case "viewed":
        return "Visualizado";
      case "rejected":
        return "Rejeitado";
      case "accepted":
        return "Aceito";
      default:
        return status;
    }
  };

  const getStatusEntregaColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "bg-gray-500/20 text-gray-500";
      case "confirmado":
        return "bg-green-500/20 text-green-500";
      case "nao_entregue":
        return "bg-red-500/20 text-red-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  const getStatusEntregaLabel = (status: string) => {
    switch (status) {
      case "pendente":
        return "Pendente";
      case "confirmado":
        return "Confirmado";
      case "nao_entregue":
        return "Não Entregue";
      default:
        return status;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass-card max-w-md">
          <CardHeader>
            <CardTitle>Autenticação Necessária</CardTitle>
            <CardDescription>Faça login para acessar esta página</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-purple-950 to-slate-950">
      {/* Header */}
      <header className="glass-card border-b border-border/50 sticky top-0 z-50 backdrop-blur-xl">
        <div className="container py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center glow-effect">
              <History className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Histórico de Candidaturas</h1>
              <p className="text-sm text-muted-foreground">
                Acompanhe todas as suas candidaturas enviadas
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Estatísticas */}
        {candidaturas && candidaturas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card key="stat-total" className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{candidaturas.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card key="stat-confirmed" className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Confirmadas</p>
                    <p className="text-2xl font-bold">
                      {candidaturas.filter((c: any) => c.statusEntrega === "confirmado").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card key="stat-pending" className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pendentes</p>
                    <p className="text-2xl font-bold">
                      {candidaturas.filter((c: any) => c.statusEntrega === "pendente").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card key="stat-failed" className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Não Entregues</p>
                    <p className="text-2xl font-bold">
                      {candidaturas.filter((c: any) => c.statusEntrega === "nao_entregue").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card key="stat-accepted" className="glass-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Aceitas</p>
                    <p className="text-2xl font-bold">
                      {candidaturas.filter((c: any) => c.status === "accepted").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de Candidaturas */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !candidaturas || candidaturas.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Nenhuma candidatura encontrada</p>
              <p className="text-muted-foreground">
                Comece enviando seu currículo para as vagas disponíveis
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {candidaturas.map((candidatura: any) => {
              const vaga = candidatura.vagaData;
              return (
                <Card key={candidatura.id} className="glass-card hover:border-primary/50 transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Informações da Vaga */}
                      <div className="flex-1 space-y-4">
                        <div>
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="text-xl font-bold text-foreground">{vaga.titulo}</h3>
                            <div className="flex gap-2">
                              <Badge className={getStatusColor(candidatura.status)}>
                                {getStatusLabel(candidatura.status)}
                              </Badge>
                              <Badge className={getStatusEntregaColor(candidatura.statusEntrega)}>
                                {getStatusEntregaLabel(candidatura.statusEntrega)}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4" />
                              {vaga.empresa}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {vaga.localizacao}
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(candidatura.createdAt).toLocaleDateString("pt-BR")}
                            </div>
                            {candidatura.dataConfirmacao && (
                              <div className="flex items-center gap-2 text-green-400">
                                <CheckCircle2 className="w-4 h-4" />
                                Confirmado em {new Date(candidatura.dataConfirmacao).toLocaleDateString("pt-BR")}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Observações de Entrega */}
                        {candidatura.observacoesEntrega && (
                          <div className="bg-muted/30 rounded-lg p-4">
                            <p className="text-sm font-medium mb-1">Observações:</p>
                            <p className="text-sm text-muted-foreground">{candidatura.observacoesEntrega}</p>
                          </div>
                        )}

                        {/* Ações */}
                        <div className="flex flex-wrap gap-2">
                          {/* Link para vaga original */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(vaga.link_candidatura, "_blank")}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Ver Vaga
                          </Button>

                          {/* Link de validação (se existir) */}
                          {candidatura.linkValidacao && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-green-500/10 border-green-500/50 hover:bg-green-500/20"
                              onClick={() => window.open(candidatura.linkValidacao, "_blank")}
                            >
                              <Link2 className="w-4 h-4 mr-2" />
                              Acessar Cadastro
                            </Button>
                          )}

                          {/* Botão para conferir entrega via payload */}
                          {candidatura.payloadPagina && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-blue-500/10 border-blue-500/50 hover:bg-blue-500/20"
                              onClick={() => window.open(candidatura.payloadPagina, "_blank")}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Conferir Entrega
                            </Button>
                          )}

                          {/* Botão Confirmar Entrega */}
                          {candidatura.statusEntrega === "pendente" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-green-500/10 border-green-500/50 hover:bg-green-500/20"
                              onClick={() => {
                                setCandidaturaAtual(candidatura.id);
                                setLinkValidacao(candidatura.linkValidacao || "");
                                setObservacoes(candidatura.observacoesEntrega || "");
                                setShowConfirmarDialog(true);
                              }}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Confirmar Entrega
                            </Button>
                          )}

                          {/* Botão Não Entregue */}
                          {candidatura.statusEntrega === "pendente" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-red-500/10 border-red-500/50 hover:bg-red-500/20"
                              onClick={() => {
                                setCandidaturaAtual(candidatura.id);
                                setObservacoes(candidatura.observacoesEntrega || "");
                                setShowNaoEntregueDialog(true);
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Não Entregue
                            </Button>
                          )}

                          {/* Ver Carta de Apresentação */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <FileText className="w-4 h-4 mr-2" />
                                Ver Carta
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Carta de Apresentação</DialogTitle>
                                <DialogDescription>
                                  {vaga.empresa} - {vaga.titulo}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="prose prose-invert max-w-none">
                                <Streamdown>{candidatura.cartaApresentacao}</Streamdown>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {/* Atualizar Status */}
                          <Select
                            value={candidatura.status}
                            onValueChange={(value) => handleAtualizarStatus(candidatura.id, value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Atualizar status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="sent">Enviado</SelectItem>
                              <SelectItem value="viewed">Visualizado</SelectItem>
                              <SelectItem value="rejected">Rejeitado</SelectItem>
                              <SelectItem value="accepted">Aceito</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialog Confirmar Entrega */}
      <Dialog open={showConfirmarDialog} onOpenChange={setShowConfirmarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Entrega de Currículo</DialogTitle>
            <DialogDescription>
              Adicione o link do seu cadastro no site da empresa e observações sobre o envio
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="link">Link do Cadastro (opcional)</Label>
              <Input
                id="link"
                placeholder="https://empresa.com/meu-cadastro"
                value={linkValidacao}
                onChange={(e) => setLinkValidacao(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Cole aqui o link para acessar seu cadastro no site da empresa
              </p>
            </div>
            <div>
              <Label htmlFor="obs">Observações (opcional)</Label>
              <Textarea
                id="obs"
                placeholder="Ex: Protocolo #12345, Enviado em 31/12/2024 às 14:30"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowConfirmarDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmarEntrega}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Confirmar Entrega
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Não Entregue */}
      <Dialog open={showNaoEntregueDialog} onOpenChange={setShowNaoEntregueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar como Não Entregue</DialogTitle>
            <DialogDescription>
              Adicione observações sobre por que o currículo não foi entregue
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="obs-nao-entregue">Observações (opcional)</Label>
              <Textarea
                id="obs-nao-entregue"
                placeholder="Ex: Site fora do ar, Vaga já preenchida, Requisitos não atendidos"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowNaoEntregueDialog(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleMarcarNaoEntregue}>
                <XCircle className="w-4 h-4 mr-2" />
                Marcar como Não Entregue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
