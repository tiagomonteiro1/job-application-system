/**
 * Página de Integrações
 * Gerenciamento de APIs de sites de vagas
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
  Plug, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ExternalLink,
  Sparkles,
  Zap,
  Globe
} from "lucide-react";
import { getLoginUrl } from "@/const";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Integracoes() {
  const { user, loading: authLoading } = useAuth();
  const [integracaoDialogOpen, setIntegracaoDialogOpen] = useState(false);
  const [editandoIntegracao, setEditandoIntegracao] = useState<any>(null);
  const [integracaoForm, setIntegracaoForm] = useState({
    nome: "",
    siteUrl: "",
    apiUrl: "",
    apiKey: "",
    apiDocUrl: "",
    tipoAutenticacao: "nenhuma" as any,
    formatoDados: "json" as any,
  });

  // Queries
  const { data: integracoes, refetch: refetchIntegracoes } = trpc.integracoes.listar.useQuery(undefined, {
    enabled: !!user && user.role === 'admin',
  });

  // Mutations
  const criarIntegracao = trpc.integracoes.criar.useMutation();
  const atualizarIntegracao = trpc.integracoes.atualizar.useMutation();
  const deletarIntegracao = trpc.integracoes.deletar.useMutation();
  const descobrirApi = trpc.integracoes.descobrirApi.useMutation();
  const testarIntegracao = trpc.integracoes.testar.useMutation();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    window.location.href = getLoginUrl();
    return null;
  }

  const handleSalvarIntegracao = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editandoIntegracao) {
        await atualizarIntegracao.mutateAsync({
          id: editandoIntegracao.id,
          ...integracaoForm,
        });
        toast.success("Integração atualizada com sucesso!");
      } else {
        await criarIntegracao.mutateAsync(integracaoForm);
        toast.success("Integração criada com sucesso!");
      }
      
      setIntegracaoDialogOpen(false);
      setEditandoIntegracao(null);
      resetForm();
      refetchIntegracoes();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar integração");
    }
  };

  const handleEditarIntegracao = (integracao: any) => {
    setEditandoIntegracao(integracao);
    setIntegracaoForm({
      nome: integracao.nome,
      siteUrl: integracao.siteUrl,
      apiUrl: integracao.apiUrl || "",
      apiKey: integracao.apiKey || "",
      apiDocUrl: integracao.apiDocUrl || "",
      tipoAutenticacao: integracao.tipoAutenticacao || "nenhuma",
      formatoDados: integracao.formatoDados || "json",
    });
    setIntegracaoDialogOpen(true);
  };

  const handleDeletarIntegracao = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta integração?")) return;
    
    try {
      await deletarIntegracao.mutateAsync({ id });
      toast.success("Integração deletada com sucesso!");
      refetchIntegracoes();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar integração");
    }
  };

  const handleDescobrir = async (id: number) => {
    try {
      const result = await descobrirApi.mutateAsync({ id });
      toast.success(result.message);
      refetchIntegracoes();
    } catch (error: any) {
      toast.error(error.message || "Erro ao descobrir API");
    }
  };

  const handleTestar = async (id: number) => {
    try {
      const result = await testarIntegracao.mutateAsync({ id });
      toast.success(result.message);
      refetchIntegracoes();
    } catch (error: any) {
      toast.error(error.message || "Erro ao testar integração");
    }
  };

  const resetForm = () => {
    setIntegracaoForm({
      nome: "",
      siteUrl: "",
      apiUrl: "",
      apiKey: "",
      apiDocUrl: "",
      tipoAutenticacao: "nenhuma",
      formatoDados: "json",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string; color: string }> = {
      ativa: { variant: "default", icon: CheckCircle2, label: "Ativa", color: "text-green-500" },
      inativa: { variant: "destructive", icon: XCircle, label: "Inativa", color: "text-red-500" },
      descobrindo: { variant: "secondary", icon: Clock, label: "Descobrindo", color: "text-yellow-500" },
    };

    const config = variants[status] || variants.inativa;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className={`w-3 h-3 ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-slate-900">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg">
                <Plug className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  Integrações com APIs
                </h1>
                <p className="text-muted-foreground mt-1">
                  Conecte-se automaticamente com sites de vagas via API
                </p>
              </div>
            </div>

            <Dialog open={integracaoDialogOpen} onOpenChange={(open) => {
              setIntegracaoDialogOpen(open);
              if (!open) {
                setEditandoIntegracao(null);
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Integração
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editandoIntegracao ? 'Editar Integração' : 'Nova Integração com API'}
                  </DialogTitle>
                  <DialogDescription>
                    Configure a conexão com um site de vagas que oferece API pública
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSalvarIntegracao} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="nome">Nome do Site *</Label>
                      <Input
                        id="nome"
                        value={integracaoForm.nome}
                        onChange={(e) => setIntegracaoForm({ ...integracaoForm, nome: e.target.value })}
                        placeholder="Ex: LinkedIn Jobs API"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="siteUrl">URL do Site *</Label>
                      <Input
                        id="siteUrl"
                        type="url"
                        value={integracaoForm.siteUrl}
                        onChange={(e) => setIntegracaoForm({ ...integracaoForm, siteUrl: e.target.value })}
                        placeholder="https://www.exemplo.com"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="apiUrl">URL da API</Label>
                      <Input
                        id="apiUrl"
                        type="url"
                        value={integracaoForm.apiUrl}
                        onChange={(e) => setIntegracaoForm({ ...integracaoForm, apiUrl: e.target.value })}
                        placeholder="https://api.exemplo.com/v1/jobs"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Deixe em branco para descoberta automática
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="tipoAutenticacao">Tipo de Autenticação</Label>
                      <Select
                        value={integracaoForm.tipoAutenticacao}
                        onValueChange={(value) => setIntegracaoForm({ ...integracaoForm, tipoAutenticacao: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nenhuma">Nenhuma</SelectItem>
                          <SelectItem value="api_key">API Key</SelectItem>
                          <SelectItem value="bearer">Bearer Token</SelectItem>
                          <SelectItem value="oauth">OAuth 2.0</SelectItem>
                          <SelectItem value="basic">Basic Auth</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="formatoDados">Formato de Dados</Label>
                      <Select
                        value={integracaoForm.formatoDados}
                        onValueChange={(value) => setIntegracaoForm({ ...integracaoForm, formatoDados: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="form-data">Form Data</SelectItem>
                          <SelectItem value="xml">XML</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {integracaoForm.tipoAutenticacao !== 'nenhuma' && (
                      <div className="col-span-2">
                        <Label htmlFor="apiKey">API Key / Token</Label>
                        <Input
                          id="apiKey"
                          type="password"
                          value={integracaoForm.apiKey}
                          onChange={(e) => setIntegracaoForm({ ...integracaoForm, apiKey: e.target.value })}
                          placeholder="Sua chave de API"
                        />
                      </div>
                    )}

                    <div className="col-span-2">
                      <Label htmlFor="apiDocUrl">URL da Documentação</Label>
                      <Input
                        id="apiDocUrl"
                        type="url"
                        value={integracaoForm.apiDocUrl}
                        onChange={(e) => setIntegracaoForm({ ...integracaoForm, apiDocUrl: e.target.value })}
                        placeholder="https://docs.exemplo.com/api"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      key="btn-cancel"
                      type="button"
                      variant="outline"
                      onClick={() => setIntegracaoDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button key="btn-submit" type="submit">
                      {editandoIntegracao ? 'Atualizar' : 'Criar'} Integração
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card key="stat-active" className="border-none shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Integrações Ativas</p>
                  <p className="text-3xl font-bold mt-1">
                    {integracoes?.filter((i: any) => i.status === 'ativa').length || 0}
                  </p>
                </div>
                <CheckCircle2 className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card key="stat-total" className="border-none shadow-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total de Integrações</p>
                  <p className="text-3xl font-bold mt-1">{integracoes?.length || 0}</p>
                </div>
                <Plug className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card key="stat-sent" className="border-none shadow-lg bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Currículos Enviados</p>
                  <p className="text-3xl font-bold mt-1">
                    {integracoes?.reduce((acc: number, i: any) => acc + (i.totalEnvios || 0), 0) || 0}
                  </p>
                </div>
                <Zap className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Integrações */}
        {integracoes && integracoes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integracoes.map((integracao: any) => (
              <Card key={integracao.id} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{integracao.nome}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {integracao.totalEnvios} envios realizados
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    {getStatusBadge(integracao.status)}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <a 
                        href={integracao.siteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate"
                      >
                        {integracao.siteUrl}
                      </a>
                    </div>

                    {integracao.apiUrl && (
                      <div className="flex items-center gap-2 text-sm">
                        <Plug className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground truncate">{integracao.apiUrl}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="text-xs">
                        {integracao.tipoAutenticacao}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {integracao.formatoDados}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    {!integracao.apiUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDescobrir(integracao.id)}
                      >
                        <Search className="w-4 h-4 mr-1" />
                        Descobrir
                      </Button>
                    )}
                    
                    {integracao.apiUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleTestar(integracao.id)}
                      >
                        <Sparkles className="w-4 h-4 mr-1" />
                        Testar
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditarIntegracao(integracao)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletarIntegracao(integracao.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>

                  {integracao.apiDocUrl && (
                    <Button variant="link" size="sm" className="w-full p-0 h-auto" asChild>
                      <a href={integracao.apiDocUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Ver Documentação
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-none shadow-xl">
            <CardContent className="py-16 text-center">
              <Plug className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma integração cadastrada</h3>
              <p className="text-muted-foreground mb-6">
                Adicione sites de vagas que oferecem APIs públicas para envio automatizado de currículos
              </p>
              <Button 
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                onClick={() => setIntegracaoDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Integração
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
