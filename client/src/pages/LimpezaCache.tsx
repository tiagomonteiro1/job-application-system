import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function LimpezaCache() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const utils = trpc.useUtils();

  const limparCache = trpc.compatibilidade.limparCache.useMutation({
    onSuccess: () => {
      toast.success("Cache limpo com sucesso!");
      utils.compatibilidade.invalidate();
      setDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Erro ao limpar cache: ${error.message}`);
    },
  });

  const handleLimparCache = () => {
    limparCache.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Limpeza de Cache
          </h1>
          <p className="text-muted-foreground">
            Remova dados temporários e vagas encontradas do sistema
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Card de Vagas Encontradas */}
          <Card className="border-red-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                Vagas Encontradas
              </CardTitle>
              <CardDescription>
                Deletar todas as vagas encontradas e análises de compatibilidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-100">Atenção!</p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      Esta ação irá deletar permanentemente todas as vagas encontradas e suas análises.
                      Esta operação não pode ser desfeita.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                variant="destructive"
                size="lg"
                className="w-full"
                onClick={() => setDialogOpen(true)}
                disabled={limparCache.isPending}
              >
                {limparCache.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Limpando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar Cache de Vagas
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Card de Informações */}
          <Card className="border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                O que será removido?
              </CardTitle>
              <CardDescription>
                Dados que serão deletados permanentemente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2" />
                  <div>
                    <p className="font-medium">Vagas Encontradas</p>
                    <p className="text-sm text-muted-foreground">
                      Todas as vagas salvas no sistema
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2" />
                  <div>
                    <p className="font-medium">Análises de Compatibilidade</p>
                    <p className="text-sm text-muted-foreground">
                      Scores e análises de IA geradas
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2" />
                  <div>
                    <p className="font-medium">Dados Preservados</p>
                    <p className="text-sm text-muted-foreground">
                      Currículos, candidaturas e histórico não serão afetados
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Dialog de Confirmação */}
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Limpeza de Cache</AlertDialogTitle>
              <AlertDialogDescription>
                Você tem certeza que deseja deletar todas as vagas encontradas?
                Esta ação é permanente e não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLimparCache}
                className="bg-red-600 hover:bg-red-700"
              >
                Sim, Limpar Cache
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
