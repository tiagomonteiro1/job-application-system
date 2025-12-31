/**
 * Página de Notificações
 * Gerenciamento de configurações WhatsApp, grupos e histórico
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Bell, MessageCircle, Users, History, Plus, Edit, Trash2, Send, CheckCircle, XCircle, Clock } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import { getLoginUrl } from "@/const";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Notificacoes() {
  const { user, loading: authLoading } = useAuth();
  const [grupoDialogOpen, setGrupoDialogOpen] = useState(false);
  const [editandoGrupo, setEditandoGrupo] = useState<any>(null);
  const [grupoForm, setGrupoForm] = useState({ nomeGrupo: "", linkGrupo: "", descricao: "" });

  // Queries
  const { data: config, refetch: refetchConfig } = trpc.notificacoes.getConfig.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: grupos, refetch: refetchGrupos } = trpc.notificacoes.listGrupos.useQuery(undefined, {
    enabled: !!user && user.role === 'admin',
  });
  const { data: historico, refetch: refetchHistorico } = trpc.notificacoes.historico.useQuery(undefined, {
    enabled: !!user,
  });

  // Mutations
  const updateConfig = trpc.notificacoes.updateConfig.useMutation();
  const addGrupo = trpc.notificacoes.addGrupo.useMutation();
  const updateGrupo = trpc.notificacoes.updateGrupo.useMutation();
  const removeGrupo = trpc.notificacoes.removeGrupo.useMutation();
  const enviarTeste = trpc.notificacoes.enviarTeste.useMutation();

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

  const handleVincularWhatsApp = async (numero: string) => {
    try {
      await updateConfig.mutateAsync({ whatsappNumero: numero });
      toast.success("WhatsApp vinculado com sucesso!");
      refetchConfig();
    } catch (error: any) {
      toast.error(error.message || "Erro ao vincular WhatsApp");
    }
  };

  const handleToggleAtivo = async (ativo: boolean) => {
    try {
      await updateConfig.mutateAsync({ notificacoesAtivadas: ativo });
      toast.success(ativo ? "Notificações ativadas!" : "Notificações desativadas!");
      refetchConfig();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar preferências");
    }
  };

  const handleAtualizarPreferencias = async (preferencias: any) => {
    try {
      await updateConfig.mutateAsync(preferencias);
      toast.success("Preferências atualizadas!");
      refetchConfig();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar preferências");
    }
  };

  const handleSalvarGrupo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editandoGrupo) {
        await updateGrupo.mutateAsync({
          grupoId: editandoGrupo.id,
          ...grupoForm,
        });
        toast.success("Grupo atualizado com sucesso!");
      } else {
        await addGrupo.mutateAsync(grupoForm);
        toast.success("Grupo criado com sucesso!");
      }
      
      setGrupoDialogOpen(false);
      setEditandoGrupo(null);
      setGrupoForm({ nomeGrupo: "", linkGrupo: "", descricao: "" });
      refetchGrupos();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar grupo");
    }
  };

  const handleEditarGrupo = (grupo: any) => {
    setEditandoGrupo(grupo);
    setGrupoForm({
      nomeGrupo: grupo.nomeGrupo,
      linkGrupo: grupo.linkGrupo,
      descricao: grupo.descricao || "",
    });
    setGrupoDialogOpen(true);
  };

  const handleDeletarGrupo = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este grupo?")) return;
    
    try {
      await removeGrupo.mutateAsync({ grupoId: id });
      toast.success("Grupo deletado com sucesso!");
      refetchGrupos();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar grupo");
    }
  };

  const handleEnviarTeste = async () => {
    if (!config?.whatsappNumero) {
      toast.error("Vincule um número WhatsApp primeiro");
      return;
    }
    
    try {
      await enviarTeste.mutateAsync({
        destinatario: config.whatsappNumero,
        mensagem: "Esta é uma notificação de teste do JobMatch AI! 🎉",
      });
      toast.success("Notificação de teste enviada!");
      refetchHistorico();
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar notificação de teste");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      enviada: { variant: "default", icon: CheckCircle, label: "Enviada" },
      falha: { variant: "destructive", icon: XCircle, label: "Falha" },
      pendente: { variant: "secondary", icon: Clock, label: "Pendente" },
    };

    const config = variants[status] || variants.pendente;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getTipoBadge = (tipo: string) => {
    const labels: Record<string, string> = {
      nova_vaga: "Nova Vaga",
      candidatura_enviada: "Candidatura Enviada",
      resposta_empresa: "Resposta da Empresa",
      lembrete: "Lembrete",
    };

    return <Badge variant="outline">{labels[tipo] || tipo}</Badge>;
  };

  const formatData = (data: Date | string) => {
    try {
      return format(new Date(data), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return "-";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Bell className="w-8 h-8 text-primary" />
              Notificações
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure notificações via WhatsApp
            </p>
          </div>
        </div>

        <Tabs defaultValue="config" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="config">
              <MessageCircle className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
            {user.role === 'admin' && (
              <TabsTrigger value="grupos">
                <Users className="w-4 h-4 mr-2" />
                Grupos
              </TabsTrigger>
            )}
            <TabsTrigger value="historico">
              <History className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* Configurações */}
          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do WhatsApp</CardTitle>
                <CardDescription>
                  Vincule seu número WhatsApp para receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Notificações WhatsApp</Label>
                      <p className="text-sm text-muted-foreground">
                        {config?.whatsappNumero 
                          ? `Número vinculado: ${config.whatsappNumero}`
                          : "Nenhum número vinculado"}
                      </p>
                    </div>
                    <Switch
                      checked={config?.notificacoesAtivadas || false}
                      onCheckedChange={handleToggleAtivo}
                      disabled={!config?.whatsappNumero}
                    />
                  </div>

                  {!config?.whatsappNumero && (
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">Número WhatsApp</Label>
                      <div className="flex gap-2">
                        <Input
                          id="whatsapp"
                          placeholder="+55 11 99999-9999"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.currentTarget;
                              handleVincularWhatsApp(input.value);
                              input.value = '';
                            }
                          }}
                        />
                        <Button
                          onClick={(e) => {
                            const input = document.getElementById('whatsapp') as HTMLInputElement;
                            if (input?.value) {
                              handleVincularWhatsApp(input.value);
                              input.value = '';
                            }
                          }}
                        >
                          Vincular
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Digite o número com código do país (ex: +55 11 99999-9999)
                      </p>
                    </div>
                  )}
                </div>

                {config?.whatsappNumero && (
                  <>
                    <div className="border-t pt-6 space-y-4">
                      <h3 className="text-lg font-semibold">Preferências de Notificação</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Novas Vagas</Label>
                            <p className="text-sm text-muted-foreground">
                              Receba notificação quando novas vagas compatíveis forem encontradas
                            </p>
                          </div>
                          <Switch
                            checked={config?.notificarNovasVagas || false}
                            onCheckedChange={(checked) => 
                              handleAtualizarPreferencias({ notificarNovasVagas: checked })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Candidaturas</Label>
                            <p className="text-sm text-muted-foreground">
                              Receba confirmação quando uma candidatura for enviada
                            </p>
                          </div>
                          <Switch
                            checked={config?.notificarStatusCandidatura || false}
                            onCheckedChange={(checked) => 
                              handleAtualizarPreferencias({ notificarStatusCandidatura: checked })
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Respostas de Empresas</Label>
                            <p className="text-sm text-muted-foreground">
                              Receba notificação quando empresas responderem suas candidaturas
                            </p>
                          </div>
                          <Switch
                            checked={config?.notificarFollowUp || false}
                            onCheckedChange={(checked) => 
                              handleAtualizarPreferencias({ notificarFollowUp: checked })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <Button onClick={handleEnviarTeste} variant="outline" className="w-full">
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Notificação de Teste
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Grupos (Admin) */}
          {user.role === 'admin' && (
            <TabsContent value="grupos" className="space-y-6">
              <div className="flex justify-end">
                <Dialog open={grupoDialogOpen} onOpenChange={(open) => {
                  setGrupoDialogOpen(open);
                    if (!open) {
                      setEditandoGrupo(null);
                      setGrupoForm({ nomeGrupo: "", linkGrupo: "", descricao: "" });
                    }
                  }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Grupo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editandoGrupo ? 'Editar Grupo' : 'Novo Grupo WhatsApp'}
                      </DialogTitle>
                      <DialogDescription>
                        Configure um grupo para envio de notificações em broadcast
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSalvarGrupo} className="space-y-4">
                      <div>
                        <Label htmlFor="nomeGrupo">Nome do Grupo *</Label>
                        <Input
                          id="nomeGrupo"
                          value={grupoForm.nomeGrupo}
                          onChange={(e) => setGrupoForm({ ...grupoForm, nomeGrupo: e.target.value })}
                          placeholder="Ex: Candidatos Premium"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="linkGrupo">Link do Grupo WhatsApp *</Label>
                        <Input
                          id="linkGrupo"
                          type="url"
                          value={grupoForm.linkGrupo}
                          onChange={(e) => setGrupoForm({ ...grupoForm, linkGrupo: e.target.value })}
                          placeholder="https://chat.whatsapp.com/..."
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Link de convite do grupo WhatsApp
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea
                          id="descricao"
                          value={grupoForm.descricao || ""}
                          onChange={(e) => setGrupoForm({ ...grupoForm, descricao: e.target.value })}
                          placeholder="Descrição opcional do grupo"
                          rows={3}
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setGrupoDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit">
                          {editandoGrupo ? 'Atualizar' : 'Criar'} Grupo
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {grupos && grupos.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Grupos WhatsApp</CardTitle>
                    <CardDescription>
                      {grupos.length} {grupos.length === 1 ? 'grupo' : 'grupos'} cadastrado{grupos.length === 1 ? '' : 's'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>ID do Grupo</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {grupos.map((grupo: any) => (
                          <TableRow key={grupo.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{grupo.nomeGrupo}</p>
                                {grupo.descricao && (
                                  <p className="text-xs text-muted-foreground">{grupo.descricao}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <a href={grupo.linkGrupo} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                                {grupo.linkGrupo}
                              </a>
                            </TableCell>
                            <TableCell>
                              <Badge variant={grupo.ativo ? "default" : "secondary"}>
                                {grupo.ativo ? "Ativo" : "Inativo"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditarGrupo(grupo)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeletarGrupo(grupo.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum grupo cadastrado</h3>
                    <p className="text-muted-foreground mb-4">
                      Crie grupos para enviar notificações em broadcast
                    </p>
                    <Button onClick={() => setGrupoDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Grupo
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

          {/* Histórico */}
          <TabsContent value="historico" className="space-y-6">
            {historico && historico.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Notificações</CardTitle>
                  <CardDescription>
                    {historico.length} {historico.length === 1 ? 'notificação' : 'notificações'} enviada{historico.length === 1 ? '' : 's'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Canal</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historico.map((notif: any) => (
                        <TableRow key={notif.id}>
                          <TableCell>{formatData(notif.createdAt)}</TableCell>
                          <TableCell>{getTipoBadge(notif.tipo)}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{notif.titulo}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {notif.mensagem}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{notif.canal}</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(notif.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma notificação enviada</h3>
                  <p className="text-muted-foreground">
                    Seu histórico de notificações aparecerá aqui
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
