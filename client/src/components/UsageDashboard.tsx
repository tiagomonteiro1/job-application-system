/**
 * Dashboard de Uso do Plano
 * Mostra consumo mensal em tempo real com barras de progresso
 */

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, FileText, Send, BarChart3, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function UsageDashboard() {
  const { data: uso, isLoading } = trpc.usage.getUsoMensal.useQuery();

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Uso do Plano
          </CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!uso) {
    return null;
  }

  // Calcular porcentagens
  const curriculosPercent = uso.limite_curriculos > 0 
    ? Math.round((uso.curriculos_enviados / uso.limite_curriculos) * 100) 
    : 0;
  
  const candidaturasPercent = uso.limite_candidaturas > 0 
    ? Math.round((uso.candidaturas_enviadas / uso.limite_candidaturas) * 100) 
    : 0;
  
  const analisesPercent = uso.limite_analises > 0 
    ? Math.round((uso.analises_realizadas / uso.limite_analises) * 100) 
    : 0;

  // Determinar cor da barra baseado na porcentagem
  const getProgressColor = (percent: number) => {
    if (percent >= 90) return "bg-red-500";
    if (percent >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Uso do Plano
            </CardTitle>
            <CardDescription className="mt-1">
              Plano {uso.plano_nome} • R$ {uso.plano_preco.toFixed(2)}/mês
            </CardDescription>
          </div>
          {uso.pode_upgrade && (
            <Link href="/planos">
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Currículos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-foreground">Currículos Enviados</span>
            </div>
            <span className="text-muted-foreground">
              {uso.curriculos_enviados} / {uso.limite_curriculos}
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={curriculosPercent} 
              className="h-2"
            />
            <div 
              className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(curriculosPercent)}`}
              style={{ width: `${curriculosPercent}%` }}
            />
          </div>
          {curriculosPercent >= 90 && (
            <p className="text-xs text-red-500 font-medium">
              ⚠️ Você está próximo do limite mensal
            </p>
          )}
        </div>

        {/* Candidaturas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-green-500" />
              <span className="font-medium text-foreground">Candidaturas Enviadas</span>
            </div>
            <span className="text-muted-foreground">
              {uso.candidaturas_enviadas} / {uso.limite_candidaturas}
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={candidaturasPercent} 
              className="h-2"
            />
            <div 
              className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(candidaturasPercent)}`}
              style={{ width: `${candidaturasPercent}%` }}
            />
          </div>
          {candidaturasPercent >= 90 && (
            <p className="text-xs text-red-500 font-medium">
              ⚠️ Você está próximo do limite mensal
            </p>
          )}
        </div>

        {/* Análises */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="font-medium text-foreground">Análises Realizadas</span>
            </div>
            <span className="text-muted-foreground">
              {uso.analises_realizadas} / {uso.limite_analises}
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={analisesPercent} 
              className="h-2"
            />
            <div 
              className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(analisesPercent)}`}
              style={{ width: `${analisesPercent}%` }}
            />
          </div>
          {analisesPercent >= 90 && (
            <p className="text-xs text-red-500 font-medium">
              ⚠️ Você está próximo do limite mensal
            </p>
          )}
        </div>

        {/* Mensagem de incentivo */}
        {(curriculosPercent >= 80 || candidaturasPercent >= 80 || analisesPercent >= 80) && uso.pode_upgrade && (
          <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <p className="text-sm text-foreground font-medium mb-2">
              💡 Precisa de mais recursos?
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Faça upgrade do seu plano e tenha acesso a limites maiores e recursos exclusivos!
            </p>
            <Link href="/planos">
              <Button 
                size="sm" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Ver Planos Disponíveis
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
