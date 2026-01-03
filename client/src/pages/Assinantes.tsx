/**
 * Página de gerenciamento de assinantes
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Edit, Trash2, UserCheck, XCircle, Calendar, DollarSign } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import { getLoginUrl } from "@/const";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AssinaturaFormData {
  userId: string;
  planoId: string;
  status: "ativa" | "cancelada" | "expirada" | "trial";
  dataInicio: string;
  dataFim: string;
  renovacaoAutomatica: boolean;
  metodoPagamento: string;
  transacaoId: string;
  observacoes: string;
}

export default function Assinantes() {
  const { user, loading: authLoading } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editandoAssinatura, setEditandoAssinatura] = useState<any>(null);
  const [formData, setFormData] = useState<AssinaturaFormData>({
    userId: "",
    planoId: "",
    status: "ativa",
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: "",
    renovacaoAutomatica: true,
    metodoPagamento: "",
    transacaoId: "",
    observacoes: "",
  });

  const { data: assinaturas, isLoading, refetch } = trpc.assinatura.listar.useQuery();
  const { data: planos } = trpc.plano.listar.useQuery({ apenasAtivos: true });
  const { data: usuarios } = trpc.usuarios.list.useQuery({});
  const criarAssinatura = trpc.assinatura.criar.useMutation();
  const atualizarAssinatura = trpc.assinatura.atualizar.useMutation();
  const deletarAssinatura = trpc.assinatura.deletar.useMutation();
  const cancelarAssinatura = trpc.assinatura.cancelar.useMutation();

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
        userId: parseInt(formData.userId),
        planoId: parseInt(formData.planoId),
        status: formData.status,
        dataInicio: formData.dataInicio ? new Date(formData.dataInicio) : undefined,
        dataFim: formData.dataFim ? new Date(formData.dataFim) : undefined,
        renovacaoAutomatica: formData.renovacaoAutomatica,
        metodoPagamento: formData.metodoPagamento || undefined,
        transacaoId: formData.transacaoId || undefined,
        observacoes: formData.observacoes || undefined,
      };

      if (editandoAssinatura) {
        await atualizarAssinatura.mutateAsync({ id: editandoAssinatura.id, dados });
        toast.success("Assinatura atualizada com sucesso!");
      } else {
        await criarAssinatura.mutateAsync(dados);
        toast.success("Assinatura criada com sucesso!");
      }

      setDialogOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar assinatura");
    }
  };

  const handleEdit = (assinatura: any) => {
    setEditandoAssinatura(assinatura);
    setFormData({
      userId: assinatura.userId.toString(),
      planoId: assinatura.planoId.toString(),
      status: assinatura.status,
      dataInicio: assinatura.dataInicio ? new Date(assinatura.dataInicio).toISOString().split('T')[0] : "",
      dataFim: assinatura.dataFim ? new Date(assinatura.dataFim).toISOString().split('T')[0] : "",
      renovacaoAutomatica: assinatura.renovacaoAutomatica,
      metodoPagamento: assinatura.metodoPagamento || "",
      transacaoId: assinatura.transacaoId || "",
      observacoes: assinatura.observacoes || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta assinatura?")) return;

    try {
      await deletarAssinatura.mutateAsync({ id });
      toast.success("Assinatura deletada com sucesso!");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar assinatura");
    }
  };

  const handleCancelar = async (id: number) => {
    if (!confirm("Tem certeza que deseja cancelar esta assinatura?")) return;

    try {
      await cancelarAssinatura.mutateAsync({ id });
      toast.success("Assinatura cancelada com sucesso!");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao cancelar assinatura");
    }
  };

  const resetForm = () => {
    setEditandoAssinatura(null);
    setFormData({
      userId: "",
      planoId: "",
      status: "ativa",
      dataInicio: new Date().toISOString().split('T')[0],
      dataFim: "",
      renovacaoAutomatica: true,
      metodoPagamento: "",
      transacaoId: "",
      observacoes: "",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      ativa: { variant: "default", icon: UserCheck },
      trial: { variant: "secondary", icon: Calendar },
      cancelada: { variant: "destructive", icon: XCircle },
      expirada: { variant: "outline", icon: XCircle },
    };

    const config = variants[status] || variants.ativa;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatPreco = (centavos: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(centavos / 100);
  };

  const formatData = (data: Date | string | null) => {
    if (!data) return '-';
    try {
      return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return '-';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <UserCheck className="w-8 h-8 text-primary" />
              Assinantes
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie as assinaturas dos usuários
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Assinatura
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editandoAssinatura ? 'Editar Assinatura' : 'Nova Assinatura'}</DialogTitle>
                <DialogDescription>
                  {editandoAssinatura ? 'Atualize as informações da assinatura' : 'Crie uma nova assinatura para um usuário'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="userId">Usuário *</Label>
                    <Select
                      value={formData.userId}
                      onValueChange={(value) => setFormData({ ...formData, userId: value })}
                      disabled={!!editandoAssinatura}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        {usuarios?.users?.map((usuario: any) => (
                          <SelectItem key={usuario.id} value={usuario.id.toString()}>
                            {usuario.name} ({usuario.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="planoId">Plano *</Label>
                    <Select
                      value={formData.planoId}
                      onValueChange={(value) => setFormData({ ...formData, planoId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um plano" />
                      </SelectTrigger>
                      <SelectContent>
                        {planos?.map((plano: any) => (
                          <SelectItem key={plano.id} value={plano.id.toString()}>
                            {plano.nome} - {formatPreco(plano.precoMensal)}/mês
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativa">Ativa</SelectItem>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                        <SelectItem value="expirada">Expirada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="renovacaoAutomatica">Renovação Automática</Label>
                    <Select
                      value={formData.renovacaoAutomatica.toString()}
                      onValueChange={(value) => setFormData({ ...formData, renovacaoAutomatica: value === 'true' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Sim</SelectItem>
                        <SelectItem value="false">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dataInicio">Data de Início</Label>
                    <Input
                      id="dataInicio"
                      type="date"
                      value={formData.dataInicio}
                      onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="dataFim">Data de Fim</Label>
                    <Input
                      id="dataFim"
                      type="date"
                      value={formData.dataFim}
                      onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="metodoPagamento">Método de Pagamento</Label>
                    <Input
                      id="metodoPagamento"
                      value={formData.metodoPagamento}
                      onChange={(e) => setFormData({ ...formData, metodoPagamento: e.target.value })}
                      placeholder="Ex: Cartão de Crédito, PIX"
                    />
                  </div>

                  <div>
                    <Label htmlFor="transacaoId">ID da Transação</Label>
                    <Input
                      id="transacaoId"
                      value={formData.transacaoId}
                      onChange={(e) => setFormData({ ...formData, transacaoId: e.target.value })}
                      placeholder="ID externo (Stripe, etc.)"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      placeholder="Notas adicionais sobre a assinatura"
                      rows={3}
                    />
                  </div>
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
                  <Button type="submit">
                    {editandoAssinatura ? 'Atualizar' : 'Criar'} Assinatura
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
        ) : assinaturas && assinaturas.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Lista de Assinantes</CardTitle>
              <CardDescription>
                {assinaturas.length} {assinaturas.length === 1 ? 'assinatura' : 'assinaturas'} cadastrada{assinaturas.length === 1 ? '' : 's'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Fim</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assinaturas.map((assinatura: any) => (
                    <TableRow key={assinatura.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{assinatura.usuario?.name || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">{assinatura.usuario?.email || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{assinatura.plano?.nome || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(assinatura.status)}</TableCell>
                      <TableCell>{formatData(assinatura.dataInicio)}</TableCell>
                      <TableCell>{formatData(assinatura.dataFim)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">{formatPreco(assinatura.plano?.precoMensal || 0)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(assinatura)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {assinatura.status === 'ativa' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancelar(assinatura.id)}
                            >
                              <XCircle className="w-4 h-4 text-orange-500" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(assinatura.id)}
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
              <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma assinatura cadastrada</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando a primeira assinatura para um usuário
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Assinatura
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
