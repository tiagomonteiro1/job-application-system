import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { FileText, Upload, Sparkles, CheckCircle2, Loader2, Download, Eye } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import { useState } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import CurriculoPreview from "@/components/CurriculoPreview";

export default function Curriculo() {
  const { user, isAuthenticated } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHTML, setPreviewHTML] = useState("");
  const [currentCurriculoId, setCurrentCurriculoId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: curriculos, isLoading } = trpc.curriculo.list.useQuery();
  const uploadMutation = trpc.curriculo.upload.useMutation();
  const analisarMutation = trpc.curriculo.analisar.useMutation();
  const aplicarSugestoesMutation = trpc.curriculo.aplicarSugestoes.useMutation();
  const gerarPDFMutation = trpc.curriculo.gerarPDFPremium.useMutation();
  const [loadingPreview, setLoadingPreview] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Apenas arquivos PDF são permitidos");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Arquivo muito grande. Máximo 5MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // Converter para base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      
      reader.onload = async () => {
        const base64 = reader.result?.toString().split(",")[1];
        if (!base64) throw new Error("Erro ao converter arquivo");

        await uploadMutation.mutateAsync({
          fileBase64: base64,
          fileName: selectedFile.name,
        });

        toast.success("Currículo enviado com sucesso!");
        setSelectedFile(null);
        utils.curriculo.list.invalidate();
      };

      reader.onerror = () => {
        throw new Error("Erro ao ler arquivo");
      };
    } catch (error) {
      toast.error("Erro ao enviar currículo");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleAnalisar = async (curriculoId: number) => {
    try {
      const result = await analisarMutation.mutateAsync({ curriculoId });
      toast.success("Análise concluída!");
      utils.curriculo.list.invalidate();
    } catch (error) {
      toast.error("Erro ao analisar currículo");
      console.error(error);
    }
  };

  const handleAplicarSugestoes = async (curriculoId: number) => {
    try {
      const result = await aplicarSugestoesMutation.mutateAsync({ curriculoId });
      toast.success("Sugestões aplicadas com sucesso!");
      utils.curriculo.list.invalidate();
    } catch (error) {
      toast.error("Erro ao aplicar sugestões");
      console.error(error);
    }
  };

  const handleDownloadPDF = async (markdown: string, curriculoId: number) => {
    try {
      // Criar elemento temporário para download
      const element = document.createElement('a');
      const file = new Blob([markdown], { type: 'text/markdown' });
      element.href = URL.createObjectURL(file);
      element.download = `curriculo_refatorado_${curriculoId}.md`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      toast.success("Currículo baixado em Markdown!");
    } catch (error) {
      toast.error("Erro ao baixar currículo");
      console.error(error);
    }
  };

  const handleVisualizarPreview = async (curriculoId: number) => {
    setLoadingPreview(true);
    try {
      toast.info("Carregando preview...");
      
      // Fazer requisição direta usando utils
      const result = await utils.curriculo.gerarPreview.fetch({ curriculoId });
      
      if (result) {
        setPreviewHTML(result.html);
        setCurrentCurriculoId(curriculoId);
        setPreviewOpen(true);
        toast.success("✅ Preview carregado!");
      }
    } catch (error) {
      toast.error("Erro ao carregar preview");
      console.error(error);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleGerarPDFPremium = async (curriculoId: number) => {
    try {
      toast.info("Gerando PDF premium... Isso pode levar alguns segundos.");
      const result = await gerarPDFMutation.mutateAsync({ curriculoId });
      
      // Abrir PDF em nova aba
      window.open(result.pdfUrl, '_blank');
      
      toast.success("✅ PDF Premium gerado com sucesso! Design elegante e profissional.");
      setPreviewOpen(false); // Fechar preview após gerar PDF
      utils.curriculo.list.invalidate();
    } catch (error) {
      toast.error("Erro ao gerar PDF premium");
      console.error(error);
    }
  };

  // Autenticação é tratada pelo tRPC protectedProcedure

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-card border-b border-border/50 sticky top-0 z-50 backdrop-blur-xl">
        <div className="container py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center glow-effect">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Meu Currículo</h1>
              <p className="text-sm text-muted-foreground">Upload e análise inteligente com IA</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8 max-w-4xl">
        {/* Upload Section */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload de Currículo
            </CardTitle>
            <CardDescription>
              Envie seu currículo em PDF para análise e refatoração profissional
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">
                      {selectedFile ? selectedFile.name : "Clique para selecionar"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      PDF até 5MB
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {selectedFile && (
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full glow-effect"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Enviar Currículo
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Currículos List */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">Meus Currículos</h2>

          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            </div>
          ) : curriculos && curriculos.length > 0 ? (
            curriculos.map((curriculo) => (
              <Card key={curriculo.id} className="glass-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Currículo #{curriculo.id}
                      </CardTitle>
                      <CardDescription>
                        Enviado em {new Date(curriculo.createdAt).toLocaleDateString("pt-BR")}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {curriculo.status === "analyzed" && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                      <span className="text-sm px-3 py-1 rounded-full bg-primary/20 text-primary">
                        {curriculo.status === "uploaded" && "Enviado"}
                        {curriculo.status === "analyzing" && "Analisando..."}
                        {curriculo.status === "analyzed" && "Analisado"}
                        {curriculo.status === "error" && "Erro"}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {curriculo.status === "uploaded" && (
                    <Button
                      onClick={() => handleAnalisar(curriculo.id)}
                      disabled={analisarMutation.isPending}
                      className="w-full glow-effect"
                    >
                      {analisarMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analisando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Analisar com IA
                        </>
                      )}
                    </Button>
                  )}

                  {curriculo.status === "analyzed" && curriculo.analiseIA && (
                    <Button
                      onClick={() => handleAplicarSugestoes(curriculo.id)}
                      disabled={aplicarSugestoesMutation.isPending}
                      variant="outline"
                      className="w-full"
                    >
                      {aplicarSugestoesMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Aplicando Sugestões...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Aplicar Sugestões
                        </>
                      )}
                    </Button>
                  )}

                  {curriculo.status === "analyzed" && (
                    <>
                      {curriculo.analiseIA && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-accent" />
                            Análise da IA
                          </h4>
                          <div className="p-4 rounded-lg bg-background/50 text-sm">
                            <Streamdown>{curriculo.analiseIA}</Streamdown>
                          </div>
                        </div>
                      )}

                      {curriculo.curriculoRefatorado && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <FileText className="w-4 h-4 text-accent" />
                            Currículo Refatorado
                          </h4>
                          <div className="p-4 rounded-lg bg-background/50 text-sm">
                            <Streamdown>{curriculo.curriculoRefatorado}</Streamdown>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button
                              onClick={() => handleDownloadPDF(curriculo.curriculoRefatorado || "", curriculo.id)}
                              variant="outline"
                              className="flex-1"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Baixar Markdown
                            </Button>
                            <Button
                              onClick={() => handleVisualizarPreview(curriculo.id)}
                              disabled={loadingPreview}
                              className="flex-1 glow-effect bg-gradient-to-r from-primary to-accent"
                            >
                              {loadingPreview ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Carregando...
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Visualizar Preview
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" asChild>
                          <a href={curriculo.originalPdfUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-2" />
                            PDF Original
                          </a>
                        </Button>
                        {curriculo.refatoradoPdfUrl && (
                          <Button variant="outline" className="flex-1" asChild>
                            <a href={curriculo.refatoradoPdfUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4 mr-2" />
                              PDF Refatorado
                            </a>
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="glass-card p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhum currículo enviado
              </h3>
              <p className="text-sm text-muted-foreground">
                Faça upload do seu currículo para começar
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <CurriculoPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        htmlContent={previewHTML}
        onGerarPDF={() => currentCurriculoId && handleGerarPDFPremium(currentCurriculoId)}
        isGeneratingPDF={gerarPDFMutation.isPending}
      />
    </div>
  );
}
