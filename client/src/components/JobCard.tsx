/*
Design: Glassmorphism Profissional
- Card em vidro fosco com backdrop-filter blur
- Bordas luminosas sutis
- Glow effects em hover
- Tipografia Outfit para títulos
*/

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, MapPin, Star, ExternalLink, Send, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useState } from "react";

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

interface JobCardProps {
  vaga: Vaga;
  onEnviarCurriculo: (vagaId: number) => Promise<void>;
}

export default function JobCard({ vaga, onEnviarCurriculo }: JobCardProps) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleEnviar = async () => {
    setStatus('sending');
    try {
      await onEnviarCurriculo(vaga.id);
      setStatus('success');
    } catch (error) {
      setStatus('error');
    }
  };

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < count
            ? 'fill-accent text-accent'
            : 'fill-transparent text-muted-foreground'
        }`}
      />
    ));
  };

  const getStatusButton = () => {
    switch (status) {
      case 'sending':
        return (
          <Button disabled className="w-full glow-effect">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Enviando...
          </Button>
        );
      case 'success':
        return (
          <Button disabled className="w-full bg-green-600 hover:bg-green-600">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Enviado com Sucesso
          </Button>
        );
      case 'error':
        return (
          <Button disabled className="w-full bg-destructive hover:bg-destructive">
            <XCircle className="w-4 h-4 mr-2" />
            Erro ao Enviar
          </Button>
        );
      default:
        return (
          <Button onClick={handleEnviar} className="w-full glow-effect">
            <Send className="w-4 h-4 mr-2" />
            Enviar Currículo
          </Button>
        );
    }
  };

  return (
    <Card className="glass-card hover:glow-effect transition-all duration-300 border-border/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 text-foreground">{vaga.titulo}</CardTitle>
            <CardDescription className="text-muted-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              {vaga.empresa}
            </CardDescription>
          </div>
          {vaga.destaque && (
            <Badge className="bg-accent/20 text-accent border-accent/30 whitespace-nowrap">
              {vaga.destaque}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {vaga.localizacao}
          </div>
          <Badge variant="outline" className="border-border/50">
            {vaga.tipo}
          </Badge>
        </div>

        <div className="flex items-center gap-1 mt-3">
          {renderStars(vaga.compatibilidade)}
          <span className="ml-2 text-sm text-muted-foreground">
            Compatibilidade {vaga.compatibilidade}/5
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-2 text-foreground">Por que é compatível:</h4>
          <p className="text-sm text-muted-foreground">{vaga.motivo}</p>
        </div>

        {vaga.requisitos.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-foreground">Requisitos principais:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {vaga.requisitos.slice(0, 3).map((req, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {vaga.beneficios.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-foreground">Benefícios:</h4>
            <div className="flex flex-wrap gap-2">
              {vaga.beneficios.slice(0, 3).map((ben, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {ben}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {getStatusButton()}
        <Button
          variant="outline"
          size="icon"
          asChild
          className="shrink-0"
        >
          <a href={vaga.link_candidatura} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
