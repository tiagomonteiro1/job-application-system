import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Star, 
  TrendingUp, 
  BookOpen,
  Award,
  Lightbulb
} from "lucide-react";

interface RequisitoAtendido {
  requisito: string;
  evidencia: string;
}

interface RequisitoFaltante {
  requisito: string;
  nivel: string;
  prioridade: string;
}

interface Gap {
  area: string;
  descricao: string;
  impacto: string;
}

interface Recomendacao {
  tipo: string;
  titulo: string;
  razao: string;
}

interface CompatibilidadeAnaliseProps {
  score: number;
  requisitosAtendidos: RequisitoAtendido[];
  requisitosFaltantes: RequisitoFaltante[];
  competenciasDestacadas: string[];
  gaps: Gap[];
  recomendacoes: Recomendacao[];
  pontosFortesParaVaga: string[];
  observacoes: string;
}

export default function CompatibilidadeAnalise({
  score,
  requisitosAtendidos,
  requisitosFaltantes,
  competenciasDestacadas,
  gaps,
  recomendacoes,
  pontosFortesParaVaga,
  observacoes,
}: CompatibilidadeAnaliseProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excelente Compatibilidade";
    if (score >= 60) return "Boa Compatibilidade";
    if (score >= 40) return "Compatibilidade Moderada";
    return "Baixa Compatibilidade";
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade.toLowerCase()) {
      case "alta":
        return "bg-red-500/20 text-red-500";
      case "média":
      case "media":
        return "bg-yellow-500/20 text-yellow-500";
      case "baixa":
        return "bg-green-500/20 text-green-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Score Principal */}
      <Card className="glass-card border-2 border-primary/30">
        <CardHeader className="text-center">
          <div className="mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 glow-effect">
            <div className="text-center">
              <p className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}%</p>
              <p className="text-xs text-muted-foreground mt-1">Score</p>
            </div>
          </div>
          <CardTitle className="text-2xl">{getScoreLabel(score)}</CardTitle>
          <CardDescription>{observacoes}</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={score} className="h-3" />
        </CardContent>
      </Card>

      {/* Pontos Fortes */}
      {pontosFortesParaVaga.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Seus Pontos Fortes para Esta Vaga
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {pontosFortesParaVaga.map((ponto, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-accent mt-1 flex-shrink-0 fill-accent" />
                  <span className="text-sm text-foreground">{ponto}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Requisitos Atendidos */}
      {requisitosAtendidos.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Requisitos Atendidos ({requisitosAtendidos.length})
            </CardTitle>
            <CardDescription>Competências que você possui e atendem a vaga</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {requisitosAtendidos.map((req, index) => (
              <div key={index} className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-start gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="font-semibold text-sm text-foreground">{req.requisito}</p>
                </div>
                <p className="text-xs text-muted-foreground ml-6">{req.evidencia}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Competências Destacadas */}
      {competenciasDestacadas.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-accent" />
              Competências que Te Destacam
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {competenciasDestacadas.map((comp, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {comp}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requisitos Faltantes */}
      {requisitosFaltantes.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Requisitos Faltantes ({requisitosFaltantes.length})
            </CardTitle>
            <CardDescription>Áreas onde você pode melhorar para esta vaga</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {requisitosFaltantes.map((req, index) => (
              <div key={index} className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    <p className="font-semibold text-sm text-foreground">{req.requisito}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {req.nivel}
                    </Badge>
                    <Badge className={getPrioridadeColor(req.prioridade)}>
                      {req.prioridade}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Gaps Identificados */}
      {gaps.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Gaps de Conhecimento
            </CardTitle>
            <CardDescription>Lacunas que podem impactar sua candidatura</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {gaps.map((gap, index) => (
              <div key={index} className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-semibold text-sm text-foreground">{gap.area}</p>
                  <Badge variant="outline" className="text-xs">
                    Impacto: {gap.impacto}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{gap.descricao}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recomendações */}
      {recomendacoes.length > 0 && (
        <Card className="glass-card border-2 border-accent/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-accent" />
              Recomendações para Melhorar
            </CardTitle>
            <CardDescription>Ações práticas para aumentar sua compatibilidade</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recomendacoes.map((rec, index) => (
              <div key={index} className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    {rec.tipo === "curso" ? (
                      <BookOpen className="w-4 h-4 text-accent" />
                    ) : (
                      <Award className="w-4 h-4 text-accent" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm text-foreground">{rec.titulo}</p>
                      <Badge variant="secondary" className="text-xs">
                        {rec.tipo}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{rec.razao}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
