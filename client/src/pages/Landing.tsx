import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Target, TrendingUp, Shield, Clock, Star, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  const planos = [
    {
      nome: "Básico",
      preco: "R$ 49,90",
      periodo: "/mês",
      descricao: "Ideal para quem está começando",
      recursos: [
        "20 candidaturas por mês",
        "10 currículos",
        "Análise de compatibilidade",
        "Carta de apresentação IA",
        "Suporte por email"
      ],
      destaque: false
    },
    {
      nome: "Pro",
      preco: "R$ 99,90",
      periodo: "/mês",
      descricao: "Para profissionais ativos",
      recursos: [
        "50 candidaturas por mês",
        "20 currículos",
        "Análise de compatibilidade",
        "Carta de apresentação IA",
        "Automação de varredura",
        "Notificações WhatsApp",
        "Suporte prioritário"
      ],
      destaque: true
    },
    {
      nome: "Premium",
      preco: "R$ 199,90",
      periodo: "/mês",
      descricao: "Solução completa para sua carreira",
      recursos: [
        "Candidaturas ilimitadas",
        "Currículos ilimitados",
        "Análise de compatibilidade",
        "Carta de apresentação IA",
        "Automação de varredura",
        "Notificações WhatsApp",
        "Integração com APIs",
        "Follow-up automático",
        "Suporte VIP 24/7"
      ],
      destaque: false
    }
  ];

  const depoimentos = [
    {
      nome: "Maria Silva",
      cargo: "Desenvolvedora Full Stack",
      foto: "https://i.pravatar.cc/150?img=1",
      texto: "Consegui 3 entrevistas na primeira semana! O sistema de automação é incrível."
    },
    {
      nome: "João Santos",
      cargo: "Engenheiro de Software",
      foto: "https://i.pravatar.cc/150?img=2",
      texto: "A análise de compatibilidade me ajudou a focar nas vagas certas. Recomendo!"
    },
    {
      nome: "Ana Costa",
      cargo: "Product Manager",
      foto: "https://i.pravatar.cc/150?img=3",
      texto: "Economizei horas de trabalho manual. O ROI foi imediato!"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
        
        <div className="container relative z-10 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-purple-600/20 border-purple-400/30 text-purple-300">
              <Sparkles className="w-3 h-3 mr-1" />
              Sistema Inteligente de Candidaturas
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Encontre seu{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Emprego dos Sonhos
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto">
              Automatize suas candidaturas, analise compatibilidade com IA e receba notificações em tempo real. 
              Economize tempo e aumente suas chances de sucesso!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/login">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-6">
                  Começar Agora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-purple-400/30 hover:bg-purple-600/10">
                Ver Demonstração
              </Button>
            </div>
            
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>7 dias grátis</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Cancele quando quiser</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recursos */}
      <section className="py-20 bg-slate-900/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Por que escolher o JobMatch AI?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Tecnologia de ponta para turbinar sua busca por emprego
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card key="recurso-1" className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">Automação Inteligente</CardTitle>
                <CardDescription>
                  Varredura automática em centenas de sites de vagas, preenchimento de formulários e envio de currículos
                </CardDescription>
              </CardHeader>
            </Card>

            <Card key="recurso-2" className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-pink-600/20 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-pink-400" />
                </div>
                <CardTitle className="text-white">Análise de Compatibilidade</CardTitle>
                <CardDescription>
                  IA analisa seu perfil e calcula compatibilidade com cada vaga, priorizando as melhores oportunidades
                </CardDescription>
              </CardHeader>
            </Card>

            <Card key="recurso-3" className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <CardTitle className="text-white">Cartas Personalizadas</CardTitle>
                <CardDescription>
                  Geração automática de cartas de apresentação personalizadas para cada vaga usando IA avançada
                </CardDescription>
              </CardHeader>
            </Card>

            <Card key="recurso-4" className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <CardTitle className="text-white">Notificações em Tempo Real</CardTitle>
                <CardDescription>
                  Receba alertas via WhatsApp sobre novas vagas compatíveis e status de candidaturas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card key="recurso-5" className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-yellow-600/20 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
                <CardTitle className="text-white">Histórico Completo</CardTitle>
                <CardDescription>
                  Acompanhe todas as candidaturas, confirme entregas e gerencie follow-ups em um só lugar
                </CardDescription>
              </CardHeader>
            </Card>

            <Card key="recurso-6" className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-red-600/20 flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-red-400" />
                </div>
                <CardTitle className="text-white">Integração com APIs</CardTitle>
                <CardDescription>
                  Conecte-se diretamente com APIs de sites de vagas para envios ainda mais rápidos e eficientes
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Escolha seu Plano
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Invista na sua carreira com o plano ideal para você
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {planos.map((plano, index) => (
              <Card 
                key={`plano-${index}`}
                className={`relative ${
                  plano.destaque 
                    ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-400/50 scale-105' 
                    : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                {plano.destaque && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 border-0">
                      MAIS POPULAR
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-2xl text-white">{plano.nome}</CardTitle>
                  <CardDescription className="text-gray-400">{plano.descricao}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">{plano.preco}</span>
                    <span className="text-gray-400">{plano.periodo}</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plano.recursos.map((recurso, idx) => (
                      <li key={`recurso-${index}-${idx}`} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{recurso}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href="/auth/login">
                    <Button 
                      className={`w-full ${
                        plano.destaque
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      Começar Agora
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-20 bg-slate-900/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              O que nossos usuários dizem
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Histórias reais de profissionais que transformaram suas carreiras
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {depoimentos.map((depoimento, index) => (
              <Card key={`depoimento-${index}`} className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src={depoimento.foto} 
                      alt={depoimento.nome}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h4 className="font-semibold text-white">{depoimento.nome}</h4>
                      <p className="text-sm text-gray-400">{depoimento.cargo}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 italic">"{depoimento.texto}"</p>
                  <div className="flex gap-1 mt-4">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={`star-${index}-${star}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20">
        <div className="container">
          <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-400/50">
            <CardContent className="py-16 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Pronto para acelerar sua carreira?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Junte-se a milhares de profissionais que já encontraram seu emprego dos sonhos
              </p>
              <Link href="/auth/login">
                <Button size="lg" className="bg-white text-purple-900 hover:bg-gray-100 text-lg px-8 py-6">
                  Começar Gratuitamente
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800">
        <div className="container text-center text-gray-400">
          <p>© 2025 JobMatch AI. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
