import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Calendar, Clock, Send, CheckCircle, XCircle, MessageSquare, Settings } from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function Followups() {
  const [activeTab, setActiveTab] = useState("pendentes");
  const [configForm, setConfigForm] = useState({
    ativo: true,
    dias_apos_candidatura: 7,
    enviar_whatsapp: true,
    enviar_email: false,
    horario_envio: "09:00",
  });

  // Queries
  const { data: config, refetch: refetchConfig } = trpc.followup.getConfig.useQuery();
  const { data: followups = [], refetch: refetchFollowups } = trpc.followup.listar.useQuery({
    status: activeTab === "todos" ? "todos" : activeTab,
  });

  // Mutations
  const saveConfig = trpc.followup.saveConfig.useMutation({
    onSuccess: () => {
      toast.success("Configurações salvas!");
      refetchConfig();
    },
    onError: () => toast.error("Erro ao salvar configurações"),
  });

  const marcarEnviado = trpc.followup.marcarEnviado.useMutation({
    onSuccess: () => {
      toast.success("Follow-up marcado como enviado!");
      refetchFollowups();
    },
    onError: () => toast.error("Erro ao marcar follow-up"),
  });

  const cancelar = trpc.followup.cancelar.useMutation({
    onSuccess: () => {
      toast.success("Follow-up cancelado!");
      refetchFollowups();
    },
    onError: () => toast.error("Erro ao cancelar follow-up"),
  });

  // Carregar configuração existente
  useState(() => {
    if (config) {
      setConfigForm({
        ativo: Boolean(config.ativo),
        dias_apos_candidatura: Number(config.dias_apos_candidatura) || 7,
        enviar_whatsapp: Boolean(config.enviar_whatsapp),
        enviar_email: Boolean(config.enviar_email),
        horario_envio: String(config.horario_envio) || "09:00",
      });
    }
  });

  const handleSaveConfig = () => {
    saveConfig.mutate(configForm);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      pendente: { variant: "secondary", icon: Clock },
      enviado: { variant: "default", icon: Send },
      respondido: { variant: "outline", icon: CheckCircle },
    };
    const config = variants[status] || variants.pendente;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <PageHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <MessageSquare className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Follow-ups Automáticos</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900/50 border border-slate-800">
            <TabsTrigger value="pendentes" key="tab-pendentes">Pendentes</TabsTrigger>
            <TabsTrigger value="enviado" key="tab-enviado">Enviados</TabsTrigger>
            <TabsTrigger value="respondido" key="tab-respondido">Respondidos</TabsTrigger>
            <TabsTrigger value="todos" key="tab-todos">Todos</TabsTrigger>
            <TabsTrigger value="config" key="tab-config">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Lista de Follow-ups */}
          {["pendentes", "enviado", "respondido", "todos"].map((tab) => (
            <TabsContent key={`content-${tab}`} value={tab} className="space-y-4">
              {followups.length === 0 ? (
                <Card className="p-8 text-center bg-slate-900/30 border-slate-800">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                  <p className="text-slate-400">Nenhum follow-up {tab === "todos" ? "encontrado" : tab}</p>
                </Card>
              ) : (
                followups.map((followup: any) => {
                  const vaga = followup.vagaData ? JSON.parse(followup.vagaData) : null;
                  return (
                    <Card key={`followup-${followup.id}`} className="p-6 bg-slate-900/30 border-slate-800 hover:border-blue-800 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {vaga?.titulo || "Vaga sem título"}
                          </h3>
                          <p className="text-sm text-slate-400 mb-2">
                            {vaga?.empresa || "Empresa não informada"}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Agendado: {formatData(followup.data_agendada)}
                            </span>
                            {followup.data_enviado && (
                              <span className="flex items-center gap-1">
                                <Send className="w-4 h-4" />
                                Enviado: {formatData(followup.data_enviado)}
                              </span>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(followup.status)}
                      </div>

                      <div className="bg-slate-950/50 p-4 rounded-lg mb-4">
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">
                          {followup.mensagem}
                        </p>
                      </div>

                      {followup.resposta_empresa && (
                        <div className="bg-green-950/30 border border-green-800 p-4 rounded-lg mb-4">
                          <p className="text-sm font-semibold text-green-400 mb-2">Resposta da Empresa:</p>
                          <p className="text-sm text-slate-300">{followup.resposta_empresa}</p>
                        </div>
                      )}

                      {followup.status === "pendente" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => marcarEnviado.mutate({ id: followup.id })}
                            disabled={marcarEnviado.isPending}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Marcar como Enviado
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelar.mutate({ id: followup.id })}
                            disabled={cancelar.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </Card>
                  );
                })
              )}
            </TabsContent>
          ))}

          {/* Configurações */}
          <TabsContent value="config">
            <Card className="p-6 bg-slate-900/30 border-slate-800">
              <h2 className="text-xl font-semibold text-white mb-6">Configurações de Follow-up Automático</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="ativo" className="text-white">Ativar Follow-ups Automáticos</Label>
                    <p className="text-sm text-slate-400">Agendar automaticamente após cada candidatura</p>
                  </div>
                  <Switch
                    id="ativo"
                    checked={configForm.ativo}
                    onCheckedChange={(checked) => setConfigForm({ ...configForm, ativo: checked })}
                  />
                </div>

                <div>
                  <Label htmlFor="dias" className="text-white">Dias após candidatura</Label>
                  <Input
                    id="dias"
                    type="number"
                    min="1"
                    max="30"
                    value={configForm.dias_apos_candidatura}
                    onChange={(e) => setConfigForm({ ...configForm, dias_apos_candidatura: parseInt(e.target.value) })}
                    className="bg-slate-950/50 border-slate-700 text-white"
                  />
                  <p className="text-sm text-slate-400 mt-1">Aguardar quantos dias antes de enviar o follow-up</p>
                </div>

                <div>
                  <Label htmlFor="horario" className="text-white">Horário de envio</Label>
                  <Input
                    id="horario"
                    type="time"
                    value={configForm.horario_envio}
                    onChange={(e) => setConfigForm({ ...configForm, horario_envio: e.target.value })}
                    className="bg-slate-950/50 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-white">Canais de envio</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="whatsapp"
                      checked={configForm.enviar_whatsapp}
                      onCheckedChange={(checked) => setConfigForm({ ...configForm, enviar_whatsapp: checked })}
                    />
                    <Label htmlFor="whatsapp" className="text-slate-300">WhatsApp</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="email"
                      checked={configForm.enviar_email}
                      onCheckedChange={(checked) => setConfigForm({ ...configForm, enviar_email: checked })}
                    />
                    <Label htmlFor="email" className="text-slate-300">Email</Label>
                  </div>
                </div>

                <Button
                  onClick={handleSaveConfig}
                  disabled={saveConfig.isPending}
                  className="w-full"
                >
                  Salvar Configurações
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
