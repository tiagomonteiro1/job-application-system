/**
 * Página de gerenciamento de planos de assinatura
 * Apenas administradores podem acessar
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, DollarSign, Users, CheckCircle, XCircle, Package } from "lucide-react";
import { getLoginUrl } from "@/const";

// Módulos disponíveis no sistema
const MODULOS_DISPONIVEIS = [
  { id: "vagas", nome: "Vagas Automatizadas", descricao: "Busca automática de vagas compatíveis" },
  { id: "curriculo", nome: "Currículo", descricao: "Upload e análise de currículo com IA" },
  { id: "historico", nome: "Histórico", descricao: "Histórico de candidaturas" },
  { id: "notificacoes", nome: "Notificações", descricao: "Notificações via WhatsApp" },
  { id: "compatibilidade", nome: "Análise de Compatibilidade", descricao: "Análise de compatibilidade vaga vs currículo" },
  { id: "carta", nome: "Carta de Apresentação", descricao: "Geração automática de carta personalizada" },
  { id: "pdf_premium", nome: "PDF Premium", descricao: "Geração de currículo em PDF premium" },
];

interface PlanoFormData {
  nome: string;
  descricao: string;
  precoMensal: string;
  precoAnual: string;
  limiteCurriculos: string;
  limiteCandidaturas: string;
  modulosPermitidos: string[];
  ativo: boolean;
  ordem: string;
}

export default function Planos() {
  const { user, loading: authLoading } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editandoPlano, setEditandoPlano] = useState<any>(null);
  const [formData, setFormData] = useState<PlanoFormData>({
    nome: "",
    descricao: "",
    precoMensal: "",
    precoAnual: "",
    limiteCurriculos: "10",
    limiteCandidaturas: "50",
    modulosPermitidos: [],
    ativo: true,
    ordem: "0",
  });

  const { data: planos, isLoading, refetch } = trpc.plano.listar.useQuery({ apenasAtivos: false });
  const criarPlano = trpc.plano.criar.useMutation();
  const atualizarPlano = trpc.plano.atualizar.useMutation();
  const deletarPlano = trpc.plano.deletar.useMutation();
  const ativarDesativarPlano = trpc.plano.ativarDesativar.useMutation();

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

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>Apenas administradores podem acessar esta página.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const dados = {
        nome: formData.nome,
        descricao: formData.descricao,
        precoMensal: parseInt(formData.precoMensal) * 100, // Converter para centavos
        precoAnual: formData.precoAnual ? parseInt(formData.precoAnual) * 100 : undefined,
        limiteCurriculos: parseInt(formData.limiteCurriculos),
        limiteCandidaturas: parseInt(formData.limiteCandidaturas),
        modulosPermitidos: formData.modulosPermitidos,
        ativo: formData.ativo,
        ordem: parseInt(formData.ordem),
      };

      if (editandoPlano) {
        await atualizarPlano.mutateAsync({ id: editandoPlano.id, dados });
        toast.success("Plano atualizado com sucesso!");
      } else {
        await criarPlano.mutateAsync(dados);
        toast.success("Plano criado com sucesso!");
      }

      setDialogOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar plano");
    }
  };

  const handleEdit = (plano: any) => {
    setEditandoPlano(plano);
    
    let modulos: string[] = [];
    try {
      modulos = typeof plano.modulosPermitidos === 'string' 
        ? JSON.parse(plano.modulosPermitidos) 
        : plano.modulosPermitidos;
    } catch (e) {
      modulos = [];
    }

    setFormData({
      nome: plano.nome,
      descricao: plano.descricao || "",
      precoMensal: (plano.precoMensal / 100).toString(),
      precoAnual: plano.precoAnual ? (plano.precoAnual / 100).toString() : "",
      limiteCurriculos: plano.limiteCurriculos?.toString() || "10",
      limiteCandidaturas: plano.limiteCandidaturas?.toString() || "50",
      modulosPermitidos: modulos,
      ativo: plano.ativo,
      ordem: plano.ordem?.toString() || "0",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este plano?")) return;

    try {
      await deletarPlano.mutateAsync({ id });
      toast.success("Plano deletado com sucesso!");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar plano");
    }
  };

  const handleToggleAtivo = async (id: number, ativo: boolean) => {
    try {
      await ativarDesativarPlano.mutateAsync({ id, ativo: !ativo });
      toast.success(`Plano ${!ativo ? 'ativado' : 'desativado'} com sucesso!`);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar plano");
    }
  };

  const resetForm = () => {
    setEditandoPlano(null);
    setFormData({
      nome: "",
      descricao: "",
      precoMensal: "",
      precoAnual: "",
      limiteCurriculos: "10",
      limiteCandidaturas: "50",
      modulosPermitidos: [],
      ativo: true,
      ordem: "0",
    });
  };

  const handleModuloToggle = (moduloId: string) => {
    setFormData(prev => ({
      ...prev,
      modulosPermitidos: prev.modulosPermitidos.includes(moduloId)
        ? prev.modulosPermitidos.filter(m => m !== moduloId)
        : [...prev.modulosPermitidos, moduloId]
    }));
  };

  const formatPreco = (centavos: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(centavos / 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Package className="w-8 h-8 text-primary" />
              Planos de Assinatura
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os planos disponíveis e seus módulos
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Plano
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editandoPlano ? 'Editar Plano' : 'Novo Plano'}</DialogTitle>
                <DialogDescription>
                  {editandoPlano ? 'Atualize as informações do plano' : 'Crie um novo plano de assinatura'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="nome">Nome do Plano *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Básico, Premium, Enterprise"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Descreva os benefícios do plano"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="precoMensal">Preço Mensal (R$) *</Label>
                    <Input
                      id="precoMensal"
                      type="number"
                      value={formData.precoMensal}
                      onChange={(e) => setFormData({ ...formData, precoMensal: e.target.value })}
                      placeholder="99.00"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <Label htmlFor="precoAnual">Preço Anual (R$)</Label>
                    <Input
                      id="precoAnual"
                      type="number"
                      value={formData.precoAnual}
                      onChange={(e) => setFormData({ ...formData, precoAnual: e.target.value })}
                      placeholder="990.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <Label htmlFor="limiteCurriculos">Limite de Currículos/mês *</Label>
                    <Input
                      id="limiteCurriculos"
                      type="number"
                      value={formData.limiteCurriculos}
                      onChange={(e) => setFormData({ ...formData, limiteCurriculos: e.target.value })}
                      required
                      min="1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="limiteCandidaturas">Limite de Candidaturas/mês *</Label>
                    <Input
                      id="limiteCandidaturas"
                      type="number"
                      value={formData.limiteCandidaturas}
                      onChange={(e) => setFormData({ ...formData, limiteCandidaturas: e.target.value })}
                      required
                      min="1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ordem">Ordem de Exibição</Label>
                    <Input
                      id="ordem"
                      type="number"
                      value={formData.ordem}
                      onChange={(e) => setFormData({ ...formData, ordem: e.target.value })}
                      min="0"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ativo"
                      checked={formData.ativo}
                      onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked as boolean })}
                    />
                    <Label htmlFor="ativo" className="cursor-pointer">Plano Ativo</Label>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Módulos Permitidos *</Label>
                  <div className="grid grid-cols-1 gap-3 p-4 border rounded-lg bg-muted/50">
                    {MODULOS_DISPONIVEIS.map((modulo) => (
                      <div key={modulo.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={`modulo-${modulo.id}`}
                          checked={formData.modulosPermitidos.includes(modulo.id)}
                          onCheckedChange={() => handleModuloToggle(modulo.id)}
                        />
                        <div className="flex-1">
                          <Label htmlFor={`modulo-${modulo.id}`} className="cursor-pointer font-medium">
                            {modulo.nome}
                          </Label>
                          <p className="text-xs text-muted-foreground">{modulo.descricao}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {formData.modulosPermitidos.length === 0 && (
                    <p className="text-xs text-destructive">Selecione pelo menos um módulo</p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={formData.modulosPermitidos.length === 0}>
                    {editandoPlano ? 'Atualizar' : 'Criar'} Plano
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : planos && planos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planos.map((plano: any) => {
              let modulos: string[] = [];
              try {
                modulos = typeof plano.modulosPermitidos === 'string' 
                  ? JSON.parse(plano.modulosPermitidos) 
                  : plano.modulosPermitidos;
              } catch (e) {
                modulos = [];
              }

              return (
                <Card key={plano.id} className={`relative ${!plano.ativo ? 'opacity-60' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {plano.nome}
                          {plano.ativo ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">{plano.descricao}</CardDescription>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-primary">
                          {formatPreco(plano.precoMensal)}
                        </span>
                        <span className="text-muted-foreground">/mês</span>
                      </div>
                      {plano.precoAnual && (
                        <p className="text-sm text-muted-foreground mt-1">
                          ou {formatPreco(plano.precoAnual)}/ano
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{plano.limiteCurriculos} currículos/mês</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span>{plano.limiteCandidaturas} candidaturas/mês</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Módulos Inclusos:</Label>
                      <div className="flex flex-wrap gap-1">
                        {modulos.map((moduloId: string) => {
                          const modulo = MODULOS_DISPONIVEIS.find(m => m.id === moduloId);
                          return modulo ? (
                            <Badge key={moduloId} variant="secondary" className="text-xs">
                              {modulo.nome}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(plano)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleAtivo(plano.id, plano.ativo)}
                      >
                        {plano.ativo ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(plano.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum plano cadastrado</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando seu primeiro plano de assinatura
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Plano
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
