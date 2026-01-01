/**
 * Página de Cadastro de Redes Sociais
 * Gerencia perfis de redes sociais para captação de assinantes
 */

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Music,
  Youtube,
  MessageCircle,
  Globe,
  Save,
  ExternalLink,
  Share2,
  Copy,
  CheckCircle,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function RedesSociais() {
  const [formData, setFormData] = useState({
    instagram: "",
    facebook: "",
    linkedin: "",
    twitter: "",
    tiktok: "",
    youtube: "",
    whatsapp: "",
    site: "",
  });

  const [linksCopied, setLinksCopied] = useState<Record<string, boolean>>({});

  // Queries
  const { data: redesSociais, refetch } = trpc.marketing.getRedesSociais.useQuery();

  // Mutations
  const salvarRedes = trpc.marketing.salvarRedesSociais.useMutation({
    onSuccess: () => {
      toast.success("Redes sociais atualizadas com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao salvar redes sociais");
    },
  });

  const gerarLink = trpc.marketing.gerarLinkCompartilhamento.useMutation({
    onSuccess: (data, variables) => {
      navigator.clipboard.writeText(data.link);
      setLinksCopied(prev => ({ ...prev, [variables.origem]: true }));
      toast.success(`Link do ${variables.origem} copiado!`);
      setTimeout(() => {
        setLinksCopied(prev => ({ ...prev, [variables.origem]: false }));
      }, 3000);
    },
  });

  // Carregar dados existentes
  useEffect(() => {
    if (redesSociais) {
      setFormData({
        instagram: redesSociais.instagram || "",
        facebook: redesSociais.facebook || "",
        linkedin: redesSociais.linkedin || "",
        twitter: redesSociais.twitter || "",
        tiktok: redesSociais.tiktok || "",
        youtube: redesSociais.youtube || "",
        whatsapp: redesSociais.whatsapp || "",
        site: redesSociais.site || "",
      });
    }
  }, [redesSociais]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await salvarRedes.mutateAsync(formData);
  };

  const handleGerarLink = async (origem: string) => {
    await gerarLink.mutateAsync({
      origem: origem as any,
      campanha: `${origem}_share_${Date.now()}`,
    });
  };

  const redesConfig = [
    {
      name: "instagram",
      label: "Instagram",
      icon: Instagram,
      placeholder: "@seuusuario ou https://instagram.com/seuusuario",
      color: "from-purple-600 to-pink-600",
      textColor: "text-purple-400",
    },
    {
      name: "facebook",
      label: "Facebook",
      icon: Facebook,
      placeholder: "https://facebook.com/seuperfil",
      color: "from-blue-600 to-blue-800",
      textColor: "text-blue-400",
    },
    {
      name: "linkedin",
      label: "LinkedIn",
      icon: Linkedin,
      placeholder: "https://linkedin.com/in/seuperfil",
      color: "from-blue-500 to-cyan-600",
      textColor: "text-cyan-400",
    },
    {
      name: "twitter",
      label: "Twitter / X",
      icon: Twitter,
      placeholder: "@seuusuario ou https://twitter.com/seuusuario",
      color: "from-sky-500 to-blue-600",
      textColor: "text-sky-400",
    },
    {
      name: "tiktok",
      label: "TikTok",
      icon: Music,
      placeholder: "@seuusuario ou https://tiktok.com/@seuusuario",
      color: "from-black to-pink-600",
      textColor: "text-pink-400",
    },
    {
      name: "youtube",
      label: "YouTube",
      icon: Youtube,
      placeholder: "https://youtube.com/@seucanal",
      color: "from-red-600 to-red-800",
      textColor: "text-red-400",
    },
    {
      name: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      placeholder: "+55 11 99999-9999",
      color: "from-green-600 to-green-800",
      textColor: "text-green-400",
    },
    {
      name: "site",
      label: "Website",
      icon: Globe,
      placeholder: "https://seusite.com",
      color: "from-gray-600 to-gray-800",
      textColor: "text-gray-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <PageHeader title="Redes Sociais" />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Share2 className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Redes Sociais</h1>
            <p className="text-slate-400">Cadastre seus perfis para atrair novos assinantes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Cadastrar Redes Sociais</CardTitle>
                <CardDescription className="text-slate-400">
                  Adicione seus perfis para divulgar a plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {redesConfig.map((rede) => {
                    const Icon = rede.icon;
                    return (
                      <div key={rede.name} className="space-y-2">
                        <Label className={`flex items-center gap-2 ${rede.textColor}`}>
                          <Icon className="w-5 h-5" />
                          {rede.label}
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            value={formData[rede.name as keyof typeof formData]}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, [rede.name]: e.target.value }))
                            }
                            placeholder={rede.placeholder}
                            className="bg-slate-800/50 border-slate-700 text-white flex-1"
                          />
                          {formData[rede.name as keyof typeof formData] && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                window.open(formData[rede.name as keyof typeof formData], "_blank")
                              }
                              className="border-slate-700 hover:bg-slate-800"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  <Button
                    type="submit"
                    disabled={salvarRedes.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {salvarRedes.isPending ? "Salvando..." : "Salvar Redes Sociais"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Links de Compartilhamento */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Links Rastreáveis
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Gere links para suas redes sociais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {redesConfig.slice(0, 6).map((rede) => {
                  const Icon = rede.icon;
                  const isCopied = linksCopied[rede.name];
                  return (
                    <Button
                      key={rede.name}
                      variant="outline"
                      onClick={() => handleGerarLink(rede.name)}
                      disabled={gerarLink.isPending || isCopied}
                      className="w-full border-slate-700 hover:bg-slate-800 justify-start"
                    >
                      {isCopied ? (
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      ) : (
                        <Icon className={`w-4 h-4 mr-2 ${rede.textColor}`} />
                      )}
                      {isCopied ? "Link Copiado!" : `Gerar Link ${rede.label}`}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-sm">💡 Dica</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm">
                  Use os links rastreáveis em suas bio das redes sociais para saber de onde vêm
                  seus assinantes e otimizar suas estratégias de marketing.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-sm">📊 Como Funciona</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-400">
                <p>1. Cadastre seus perfis de redes sociais</p>
                <p>2. Gere links rastreáveis para cada rede</p>
                <p>3. Compartilhe os links em suas bio/posts</p>
                <p>4. Acompanhe conversões no painel de Marketing</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview dos Perfis Cadastrados */}
        {redesSociais && (
          <Card className="mt-6 bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Perfis Cadastrados</CardTitle>
              <CardDescription className="text-slate-400">
                Seus perfis ativos para compartilhamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {redesConfig.map((rede) => {
                  const Icon = rede.icon;
                  const valor = redesSociais[rede.name as keyof typeof redesSociais];
                  if (!valor) return null;

                  return (
                    <div
                      key={rede.name}
                      className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${rede.color}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500">{rede.label}</p>
                        <p className="text-sm text-white truncate">{valor}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
