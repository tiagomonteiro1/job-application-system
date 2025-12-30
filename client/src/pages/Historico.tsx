import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Briefcase, Calendar, Clock, ExternalLink, FileText, History, Loader2, MapPin, Star } from "lucide-react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

export default function Historico() {
  const { user, isAuthenticated } = useAuth();
  const { data: candidaturas, isLoading } = trpc.candidatura.historico.useQuery();
  const atualizarStatusMutation = trpc.candidatura.atualizarStatus.useMutation();
  const utils = trpc.useUtils();

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
    <div className="min-h-screen">
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
            <Card className="glass-card p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{candidaturas.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </Card>
            <Card className="glass-card p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-500">
                  {candidaturas.filter((c) => c.status === "pending").length}
                </p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </Card>
            <Card className="glass-card p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-500">
                  {candidaturas.filter((c) => c.status === "sent").length}
                </p>
                <p className="text-sm text-muted-foreground">Enviados</p>
              </div>
            </Card>
            <Card className="glass-card p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-500">
                  {candidaturas.filter((c) => c.status === "viewed").length}
                </p>
                <p className="text-sm text-muted-foreground">Visualizados</p>
              </div>
            </Card>
            <Card className="glass-card p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">
                  {candidaturas.filter((c) => c.status === "accepted").length}
                </p>
                <p className="text-sm text-muted-foreground">Aceitos</p>
              </div>
            </Card>
          </div>
        )}

        {/* Lista de Candidaturas */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            </div>
          ) : candidaturas && candidaturas.length > 0 ? (
            candidaturas.map((candidatura) => {
              const vaga = candidatura.vagaData as any;
              
              return (
                <Card key={candidatura.id} className="glass-card hover:glow-effect transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{vaga.titulo}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          {vaga.empresa}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(candidatura.status)}>
                        {getStatusLabel(candidatura.status)}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {vaga.localizacao}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Candidatura: {new Date(candidatura.createdAt).toLocaleDateString("pt-BR")}
                      </div>
                      {candidatura.dataEnvio && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Enviado: {new Date(candidatura.dataEnvio).toLocaleDateString("pt-BR")}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: vaga.compatibilidade }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-accent text-accent" />
                        ))}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Carta de Apresentação */}
                    {candidatura.cartaApresentacao && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full">
                            <FileText className="w-4 h-4 mr-2" />
                            Ver Carta de Apresentação
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Carta de Apresentação</DialogTitle>
                            <DialogDescription>
                              Gerada automaticamente pela IA para {vaga.empresa}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <Streamdown>{candidatura.cartaApresentacao}</Streamdown>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {/* Ações */}
                    <div className="flex gap-2">
                      <Select
                        value={candidatura.status}
                        onValueChange={(value) => handleAtualizarStatus(candidatura.id, value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="sent">Enviado</SelectItem>
                          <SelectItem value="viewed">Visualizado</SelectItem>
                          <SelectItem value="rejected">Rejeitado</SelectItem>
                          <SelectItem value="accepted">Aceito</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button variant="outline" size="icon" asChild>
                        <a href={vaga.link_candidatura} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="glass-card p-12 text-center">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhuma candidatura enviada
              </h3>
              <p className="text-sm text-muted-foreground">
                Suas candidaturas aparecerão aqui após o envio
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
