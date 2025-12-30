/*
Design: Glassmorphism Profissional
- Layout assimétrico com sidebar de filtros
- Cards flutuantes em vidro fosco
- Animações suaves e fluidas
- Tipografia Outfit + Inter
*/

import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CompatibilidadeAnalise from "@/components/CompatibilidadeAnalise";
import { toast } from "sonner";
import JobCard from "@/components/JobCard";
import { Briefcase, Filter, Search, Star, TrendingUp, Award, Zap, FileText, History, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

interface Vaga {
  id: number;
  titulo: string;
  empresa: string;
  localizacao: string;
  tipo: string;
  link_candidatura: string;
  requisitos: string[];
  beneficios: string[];
  compatibilidade: number;
  motivo: string;
  destaque: string;
  area: string;
}

interface Curriculo {
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
  linkedin: string;
  github: string;
}

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading: authLoading, error, isAuthenticated, logout } = useAuth();

  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [vagasFiltradas, setVagasFiltradas] = useState<Vaga[]>([]);
  const [curriculo, setCurriculo] = useState<Curriculo | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [areaFilter, setAreaFilter] = useState("todas");
  const [compatibilidadeFilter, setCompatibilidadeFilter] = useState("todas");
  const [ordenacao, setOrdenacao] = useState("compatibilidade");

  useEffect(() => {
    // Carregar vagas e currículo
    Promise.all([
      fetch('/vagas.json').then(res => res.json()),
      fetch('/curriculo.json').then(res => res.json())
    ])
      .then(([vagasData, curriculoData]) => {
        setVagas(vagasData);
        setVagasFiltradas(vagasData);
        setCurriculo(curriculoData);
        setDataLoading(false);
      })
      .catch(error => {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar vagas');
        setDataLoading(false);
      });
  }, []);

  useEffect(() => {
    let resultado = [...vagas];

    // Filtro de busca
    if (searchTerm) {
      resultado = resultado.filter(vaga =>
        vaga.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vaga.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vaga.area.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de área
    if (areaFilter !== "todas") {
      resultado = resultado.filter(vaga => vaga.area.includes(areaFilter));
    }

    // Filtro de compatibilidade
    if (compatibilidadeFilter !== "todas") {
      const minComp = parseInt(compatibilidadeFilter);
      resultado = resultado.filter(vaga => vaga.compatibilidade >= minComp);
    }

    // Ordenação
    switch (ordenacao) {
      case "compatibilidade":
        resultado.sort((a, b) => b.compatibilidade - a.compatibilidade);
        break;
      case "empresa":
        resultado.sort((a, b) => a.empresa.localeCompare(b.empresa));
        break;
      case "area":
        resultado.sort((a, b) => a.area.localeCompare(b.area));
        break;
    }

    setVagasFiltradas(resultado);
  }, [searchTerm, areaFilter, compatibilidadeFilter, ordenacao, vagas]);

  const [selectedVaga, setSelectedVaga] = useState<Vaga | null>(null);
  const [showCandidaturaDialog, setShowCandidaturaDialog] = useState(false);
  const [showCompatibilidadeDialog, setShowCompatibilidadeDialog] = useState(false);
  const [analiseCompatibilidade, setAnaliseCompatibilidade] = useState<any>(null);

  const { data: curriculos } = trpc.curriculo.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const criarCandidaturaMutation = trpc.candidatura.criar.useMutation();
  const enviarCandidaturaMutation = trpc.candidatura.enviar.useMutation();
  const analisarCompatibilidadeMutation = trpc.compatibilidade.analisar.useMutation();

  const curriculoAnalisado = curriculos?.find(c => c.status === "analyzed");

  const handleEnviarCurriculo = async (vagaId: number) => {
    const vaga = vagas.find(v => v.id === vagaId);
    if (!vaga) return;

    if (!isAuthenticated) {
      toast.error("Faça login para enviar candidaturas");
      return;
    }

    if (!curriculoAnalisado) {
      toast.error("Você precisa fazer upload e analisar um currículo primeiro", {
        description: "Acesse a página 'Meu Currículo' para começar"
      });
      return;
    }

    setSelectedVaga(vaga);
    setShowCandidaturaDialog(true);

    try {
      // Criar candidatura com carta de apresentação
      const candidatura = await criarCandidaturaMutation.mutateAsync({
        curriculoId: curriculoAnalisado.id,
        vaga: {
          id: vaga.id,
          titulo: vaga.titulo,
          empresa: vaga.empresa,
          localizacao: vaga.localizacao,
          tipo: vaga.tipo,
          link_candidatura: vaga.link_candidatura,
          area: vaga.area,
          compatibilidade: vaga.compatibilidade,
          requisitos: vaga.requisitos,
          motivo: vaga.motivo,
        },
      });

      // Marcar como enviada
      await enviarCandidaturaMutation.mutateAsync({
        candidaturaId: candidatura.id,
      });

      toast.success(`Candidatura enviada para ${vaga.empresa}!`, {
        description: `Carta de apresentação gerada automaticamente`
      });

      setShowCandidaturaDialog(false);
    } catch (error) {
      toast.error("Erro ao enviar candidatura");
      console.error(error);
      setShowCandidaturaDialog(false);
    }
  };

  const handleAnalisarCompatibilidade = async (vagaId: number) => {
    const vaga = vagas.find(v => v.id === vagaId);
    if (!vaga) return;

    if (!isAuthenticated) {
      toast.error("Faça login para analisar compatibilidade");
      return;
    }

    if (!curriculoAnalisado) {
      toast.error("Você precisa fazer upload e analisar um currículo primeiro", {
        description: "Acesse a página 'Meu Currículo' para começar"
      });
      return;
    }

    try {
      const analise = await analisarCompatibilidadeMutation.mutateAsync({
        curriculoId: curriculoAnalisado.id,
        vaga: {
          id: vaga.id,
          titulo: vaga.titulo,
          empresa: vaga.empresa,
          area: vaga.area,
          requisitos: vaga.requisitos,
          beneficios: vaga.beneficios,
          motivo: vaga.motivo,
        },
      });

      setAnaliseCompatibilidade(analise);
      setSelectedVaga(vaga);
      setShowCompatibilidadeDialog(true);
    } catch (error) {
      toast.error("Erro ao analisar compatibilidade");
      console.error(error);
    }
  };

  const estatisticas = {
    total: vagas.length,
    altaCompatibilidade: vagas.filter(v => v.compatibilidade >= 4).length,
    destaques: vagas.filter(v => v.destaque).length,
    areas: Array.from(new Set(vagas.map(v => v.area))).length
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando vagas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header com efeito de vidro */}
      <header className="glass-card border-b border-border/50 sticky top-0 z-50 backdrop-blur-xl">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center glow-effect">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">JobMatch AI</h1>
                <p className="text-sm text-muted-foreground">Sistema Inteligente de Candidaturas</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Vagas
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/curriculo">
                    <FileText className="w-4 h-4 mr-2" />
                    Meu Currículo
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/historico">
                    <History className="w-4 h-4 mr-2" />
                    Histórico
                  </Link>
                </Button>
              </nav>
              {curriculo && (
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-medium text-foreground">{curriculo.nome}</p>
                  <p className="text-xs text-muted-foreground">{curriculo.cargo}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{estatisticas.total}</p>
                <p className="text-sm text-muted-foreground">Vagas Encontradas</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{estatisticas.altaCompatibilidade}</p>
                <p className="text-sm text-muted-foreground">Alta Compatibilidade</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{estatisticas.destaques}</p>
                <p className="text-sm text-muted-foreground">Destaques</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{estatisticas.areas}</p>
                <p className="text-sm text-muted-foreground">Áreas Diferentes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar de Filtros */}
          <aside className="lg:col-span-1">
            <div className="glass-card p-6 rounded-xl sticky top-24 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Filtros</h2>
              </div>

              {/* Busca */}
              <div className="space-y-2">
                <Label htmlFor="search" className="text-foreground">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Empresa, cargo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-background/50"
                  />
                </div>
              </div>

              {/* Área */}
              <div className="space-y-2">
                <Label className="text-foreground">Área de Atuação</Label>
                <RadioGroup value={areaFilter} onValueChange={setAreaFilter}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="todas" id="todas" />
                    <Label htmlFor="todas" className="text-sm cursor-pointer">Todas as áreas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="PHP Sênior" id="php" />
                    <Label htmlFor="php" className="text-sm cursor-pointer">PHP Sênior</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Pentester" id="pentester" />
                    <Label htmlFor="pentester" className="text-sm cursor-pointer">Pentester</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Segurança" id="seguranca" />
                    <Label htmlFor="seguranca" className="text-sm cursor-pointer">Segurança</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Automação" id="automacao" />
                    <Label htmlFor="automacao" className="text-sm cursor-pointer">Automação/IA</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Compatibilidade */}
              <div className="space-y-2">
                <Label className="text-foreground">Compatibilidade Mínima</Label>
                <RadioGroup value={compatibilidadeFilter} onValueChange={setCompatibilidadeFilter}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="todas" id="comp-todas" />
                    <Label htmlFor="comp-todas" className="text-sm cursor-pointer">Todas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="5" id="comp-5" />
                    <Label htmlFor="comp-5" className="text-sm cursor-pointer flex items-center gap-1">
                      <Star className="w-3 h-3 fill-accent text-accent" /> 5 estrelas
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="4" id="comp-4" />
                    <Label htmlFor="comp-4" className="text-sm cursor-pointer flex items-center gap-1">
                      <Star className="w-3 h-3 fill-accent text-accent" /> 4+ estrelas
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="comp-3" />
                    <Label htmlFor="comp-3" className="text-sm cursor-pointer flex items-center gap-1">
                      <Star className="w-3 h-3 fill-accent text-accent" /> 3+ estrelas
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Ordenação */}
              <div className="space-y-2">
                <Label htmlFor="ordenacao" className="text-foreground">Ordenar por</Label>
                <Select value={ordenacao} onValueChange={setOrdenacao}>
                  <SelectTrigger id="ordenacao" className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compatibilidade">Compatibilidade</SelectItem>
                    <SelectItem value="empresa">Empresa</SelectItem>
                    <SelectItem value="area">Área</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchTerm("");
                  setAreaFilter("todas");
                  setCompatibilidadeFilter("todas");
                  setOrdenacao("compatibilidade");
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </aside>

          {/* Lista de Vagas */}
          <main className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  {vagasFiltradas.length} {vagasFiltradas.length === 1 ? 'Vaga Encontrada' : 'Vagas Encontradas'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Oportunidades compatíveis com seu perfil profissional
                </p>
              </div>
            </div>

            {vagasFiltradas.length === 0 ? (
              <div className="glass-card p-12 rounded-xl text-center">
                <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhuma vaga encontrada
                </h3>
                <p className="text-sm text-muted-foreground">
                  Tente ajustar os filtros para ver mais resultados
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {vagasFiltradas.map((vaga) => (
                  <JobCard
                    key={vaga.id}
                    vaga={vaga}
                    onEnviarCurriculo={handleEnviarCurriculo}
                    onAnalisarCompatibilidade={handleAnalisarCompatibilidade}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Dialog de Análise de Compatibilidade */}
      <Dialog open={showCompatibilidadeDialog} onOpenChange={setShowCompatibilidadeDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Análise de Compatibilidade
            </DialogTitle>
            <DialogDescription>
              {selectedVaga && `${selectedVaga.titulo} - ${selectedVaga.empresa}`}
            </DialogDescription>
          </DialogHeader>
          {analiseCompatibilidade && (
            <CompatibilidadeAnalise
              score={analiseCompatibilidade.score}
              requisitosAtendidos={analiseCompatibilidade.requisitosAtendidos}
              requisitosFaltantes={analiseCompatibilidade.requisitosFaltantes}
              competenciasDestacadas={analiseCompatibilidade.competenciasDestacadas}
              gaps={analiseCompatibilidade.gaps}
              recomendacoes={analiseCompatibilidade.recomendacoes}
              pontosFortesParaVaga={analiseCompatibilidade.pontosFortesParaVaga}
              observacoes={analiseCompatibilidade.observacoes}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
