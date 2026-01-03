/**
 * Página de Administração
 * Acesso exclusivo para administradores
 */

import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, Upload, Image as ImageIcon, Settings, Database, Users } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import { getLoginUrl } from "@/const";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  // Verificar se é admin
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

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <Shield className="w-6 h-6" />
              Acesso Negado
            </CardTitle>
            <CardDescription>
              Esta área é restrita apenas para administradores do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = "/"} className="w-full">
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor, selecione uma imagem válida");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5MB");
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadLogo = async () => {
    if (!logoFile) {
      toast.error("Selecione uma imagem primeiro");
      return;
    }

    setUploading(true);
    try {
      // TODO: Implementar upload real para S3
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Logotipo atualizado com sucesso!");
      setLogoFile(null);
      setLogoPreview("");
    } catch (error) {
      toast.error("Erro ao fazer upload do logotipo");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
                <p className="text-sm text-gray-400">Acesso exclusivo para administradores</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => window.location.href = "/"}>
                Voltar para Home
              </Button>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card key="admin-stat-users" className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Gerenciar Usuários</p>
                  <p className="text-lg font-semibold mt-1">Controle total</p>
                </div>
                <Users className="w-10 h-10 opacity-80" />
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-4 w-full"
                onClick={() => window.location.href = "/usuarios"}
              >
                Acessar
              </Button>
            </CardContent>
          </Card>

          <Card key="admin-stat-db" className="border-none shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Banco de Dados</p>
                  <p className="text-lg font-semibold mt-1">Gerenciar dados</p>
                </div>
                <Database className="w-10 h-10 opacity-80" />
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-4 w-full"
                onClick={() => toast.info("Acesse o painel de Database na UI")}
              >
                Acessar
              </Button>
            </CardContent>
          </Card>

          <Card key="admin-stat-settings" className="border-none shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Configurações</p>
                  <p className="text-lg font-semibold mt-1">Sistema</p>
                </div>
                <Settings className="w-10 h-10 opacity-80" />
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-4 w-full"
                onClick={() => toast.info("Acesse Settings na UI")}
              >
                Acessar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Logo Management */}
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-purple-500" />
              Gerenciamento de Logotipo
            </CardTitle>
            <CardDescription>
              Faça upload do logotipo do sistema (PNG, JPG ou SVG - máx. 5MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload Section */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="logo">Selecionar Imagem</Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="mt-2"
                  />
                </div>

                {logoPreview && (
                  <div className="space-y-2">
                    <Label>Pré-visualização</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center bg-white">
                      <img 
                        src={logoPreview} 
                        alt="Preview" 
                        className="max-h-32 object-contain"
                      />
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleUploadLogo}
                  disabled={!logoFile || uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Atualizar Logotipo
                    </>
                  )}
                </Button>
              </div>

              {/* Current Logo Section */}
              <div className="space-y-4">
                <div>
                  <Label>Logotipo Atual</Label>
                  <div className="mt-2 border-2 border-gray-200 rounded-lg p-8 flex items-center justify-center bg-gray-50 min-h-[200px]">
                    <div className="text-center">
                      <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Nenhum logotipo configurado</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Dica:</strong> O logotipo será exibido no cabeçalho do sistema. 
                Recomendamos usar uma imagem com fundo transparente (PNG) e dimensões de 200x50 pixels para melhor resultado.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
