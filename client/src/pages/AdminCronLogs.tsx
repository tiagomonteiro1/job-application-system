/**
 * Painel de Administração - Logs do Cron Job
 * Visualização completa do histórico de execuções com filtros e estatísticas
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  Mail, 
  MessageSquare,
  Filter,
  RefreshCw,
  Eye,
  Calendar,
  BarChart3
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminCronLogs() {
  const [filtros, setFiltros] = useState({
    status: 'todos' as 'todos' | 'enviado' | 'falhou',
    dataInicio: '',
    dataFim: '',
    limit: 50,
    offset: 0,
  });

  const [periodo, setPeriodo] = useState<'hoje' | 'semana' | 'mes' | 'total'>('mes');
  const [logSelecionado, setLogSelecionado] = useState<any>(null);
  const [showDetalheDialog, setShowDetalheDialog] = useState(false);

  // Queries
  const { data: historico, isLoading, refetch } = trpc.cronLogs.getHistorico.useQuery(filtros);
  const { data: estatisticas } = trpc.cronLogs.getEstatisticas.useQuery({ periodo });
  const { data: detalhe } = trpc.cronLogs.getDetalhe.useQuery(
    { id: logSelecionado?.id },
    { enabled: !!logSelecionado }
  );

  // Mutations
  const reenviarMutation = trpc.cronLogs.reenviar.useMutation({
    onSuccess: () => {
      toast.success("Follow-up reenviado com sucesso!");
      refetch();
      setShowDetalheDialog(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao reenviar follow-up");
    },
  });

  const handleVerDetalhes = (log: any) => {
    setLogSelecionado(log);
    setShowDetalheDialog(true);
  };

  const handleReenviar = () => {
    if (logSelecionado) {
      reenviarMutation.mutate({ logId: logSelecionado.id });
    }
  };

  const handleLimparFiltros = () => {
    setFiltros({
      status: 'todos',
      dataInicio: '',
      dataFim: '',
      limit: 50,
      offset: 0,
    });
  };

  const handleProximaPagina = () => {
    setFiltros(prev => ({ ...prev, offset: prev.offset + prev.limit }));
  };

  const handlePaginaAnterior = () => {
    setFiltros(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }));
  };

  const formatarData = (data: string) => {
    try {
      return format(new Date(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return data;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <PageHeader title="Logs do Cron Job" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Activity className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Painel de Administração</h1>
            <p className="text-slate-400">Histórico de execuções do cron job de follow-ups</p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Estatísticas</h2>
            <Select value={periodo} onValueChange={(v: any) => setPeriodo(v)}>
              <SelectTrigger className="w-40 bg-slate-900/50 border-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="semana">Última Semana</SelectItem>
                <SelectItem value="mes">Último Mês</SelectItem>
                <SelectItem value="total">Total</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total de Envios */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Total de Envios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {estatisticas?.total_envios || 0}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  WhatsApp: {estatisticas?.total_whatsapp || 0} • Email: {estatisticas?.total_email || 0}
                </p>
              </CardContent>
            </Card>

            {/* Sucesso */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Enviados com Sucesso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  {estatisticas?.total_sucesso || 0}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Taxa: {estatisticas?.taxa_sucesso || 0}%
                </p>
              </CardContent>
            </Card>

            {/* Falhas */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Falhas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">
                  {estatisticas?.total_falhas || 0}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {estatisticas?.total_envios ? 
                    `${((estatisticas.total_falhas / estatisticas.total_envios) * 100).toFixed(1)}% do total` 
                    : '0% do total'}
                </p>
              </CardContent>
            </Card>

            {/* Taxa de Sucesso */}
            <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Taxa de Sucesso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {estatisticas?.taxa_sucesso || 0}%
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {estatisticas?.taxa_sucesso && estatisticas.taxa_sucesso >= 90 
                    ? '✅ Excelente desempenho' 
                    : estatisticas?.taxa_sucesso && estatisticas.taxa_sucesso >= 70
                    ? '⚠️ Bom desempenho'
                    : '❌ Requer atenção'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filtros */}
        <Card className="bg-slate-900/50 border-slate-800 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Status</Label>
                <Select 
                  value={filtros.status} 
                  onValueChange={(v: any) => setFiltros(prev => ({ ...prev, status: v, offset: 0 }))}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="enviado">Enviados</SelectItem>
                    <SelectItem value="falhou">Falhas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Data Início</Label>
                <Input
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value, offset: 0 }))}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Data Fim</Label>
                <Input
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value, offset: 0 }))}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2 flex items-end">
                <Button 
                  variant="outline" 
                  onClick={handleLimparFiltros}
                  className="w-full border-slate-700 hover:bg-slate-800"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Logs */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Histórico de Execuções</CardTitle>
                <CardDescription className="text-slate-400">
                  {historico?.total || 0} registros encontrados
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refetch()}
                className="border-slate-700 hover:bg-slate-800"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-slate-400 mt-4">Carregando logs...</p>
              </div>
            ) : historico?.logs && historico.logs.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800">
                        <TableHead className="text-slate-300">Data/Hora</TableHead>
                        <TableHead className="text-slate-300">Tipo</TableHead>
                        <TableHead className="text-slate-300">Destinatário</TableHead>
                        <TableHead className="text-slate-300">Título</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300 text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historico.logs.map((log: any) => (
                        <TableRow key={log.id} className="border-slate-800 hover:bg-slate-800/50">
                          <TableCell className="text-slate-300">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-500" />
                              {formatarData(log.data_envio)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {log.tipo === 'whatsapp' ? (
                              <Badge variant="outline" className="border-green-500 text-green-500">
                                <MessageSquare className="w-3 h-3 mr-1" />
                                WhatsApp
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-blue-500 text-blue-500">
                                <Mail className="w-3 h-3 mr-1" />
                                Email
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-300">{log.destinatario}</TableCell>
                          <TableCell className="text-slate-300 max-w-xs truncate">{log.titulo}</TableCell>
                          <TableCell>
                            {log.status_envio === 'enviado' ? (
                              <Badge className="bg-green-500/20 text-green-500 border-green-500">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Enviado
                              </Badge>
                            ) : (
                              <Badge className="bg-red-500/20 text-red-500 border-red-500">
                                <XCircle className="w-3 h-3 mr-1" />
                                Falhou
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVerDetalhes(log)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Ver Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginação */}
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-slate-400">
                    Mostrando {filtros.offset + 1} a {Math.min(filtros.offset + filtros.limit, historico.total)} de {historico.total}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePaginaAnterior}
                      disabled={filtros.offset === 0}
                      className="border-slate-700 hover:bg-slate-800"
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleProximaPagina}
                      disabled={!historico.hasMore}
                      className="border-slate-700 hover:bg-slate-800"
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">Nenhum log encontrado</p>
                <p className="text-slate-500 text-sm mt-2">
                  Ajuste os filtros ou aguarde as próximas execuções do cron job
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Detalhes */}
        <Dialog open={showDetalheDialog} onOpenChange={setShowDetalheDialog}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Log</DialogTitle>
              <DialogDescription className="text-slate-400">
                Informações completas sobre a execução
              </DialogDescription>
            </DialogHeader>
            
            {detalhe && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-400">Data/Hora</Label>
                    <p className="text-white mt-1">{formatarData(detalhe.data_envio)}</p>
                  </div>
                  <div>
                    <Label className="text-slate-400">Status</Label>
                    <div className="mt-1">
                      {detalhe.status_envio === 'enviado' ? (
                        <Badge className="bg-green-500/20 text-green-500 border-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Enviado
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-500 border-red-500">
                          <XCircle className="w-3 h-3 mr-1" />
                          Falhou
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-400">Tipo</Label>
                    <p className="text-white mt-1 capitalize">{detalhe.tipo}</p>
                  </div>
                  <div>
                    <Label className="text-slate-400">Destinatário</Label>
                    <p className="text-white mt-1">{detalhe.destinatario}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-400">Título</Label>
                  <p className="text-white mt-1">{detalhe.titulo}</p>
                </div>

                <div>
                  <Label className="text-slate-400">Mensagem</Label>
                  <div className="mt-1 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-white whitespace-pre-wrap">{detalhe.mensagem}</p>
                  </div>
                </div>

                {detalhe.erro_mensagem && (
                  <div>
                    <Label className="text-red-400">Mensagem de Erro</Label>
                    <div className="mt-1 p-3 bg-red-500/10 rounded-lg border border-red-500/50">
                      <p className="text-red-400">{detalhe.erro_mensagem}</p>
                    </div>
                  </div>
                )}

                {detalhe.status_envio === 'falhou' && (
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowDetalheDialog(false)}
                      className="border-slate-700"
                    >
                      Fechar
                    </Button>
                    <Button
                      onClick={handleReenviar}
                      disabled={reenviarMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {reenviarMutation.isPending ? 'Reenviando...' : 'Reenviar'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
