import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Users, Shield, UserX, ChevronLeft, LogOut, Crown, User as UserIcon } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import LogoutButton from "@/components/LogoutButton";

export default function AdminUsuarios() {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newRole, setNewRole] = useState<"user" | "admin">("user");

  const { data: usuarios, isLoading, refetch } = trpc.usuarios.list.useQuery({});
  const updateRole = trpc.usuarios.update.useMutation({
    onSuccess: () => {
      toast.success("Função do usuário atualizada!");
      refetch();
      setSelectedUserId(null);
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleUpdateRole = () => {
    if (selectedUserId) {
      updateRole.mutate({ id: selectedUserId, role: newRole });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Gerenciamento de Usuários</h1>
                  <p className="text-sm text-gray-400">Administre permissões e funções</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <Badge variant="outline" className="bg-purple-600/20 border-purple-400/30 text-purple-300">
                    <Crown className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                </div>
              )}
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Usuários do Sistema</h2>
                <p className="text-gray-400">Total: {usuarios?.total || 0} usuários</p>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <p className="text-gray-400 mt-4">Carregando usuários...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-gray-300">ID</TableHead>
                      <TableHead className="text-gray-300">Nome</TableHead>
                      <TableHead className="text-gray-300">Email</TableHead>
                      <TableHead className="text-gray-300">Função</TableHead>
                      <TableHead className="text-gray-300">Método de Login</TableHead>
                      <TableHead className="text-gray-300">Último Acesso</TableHead>
                      <TableHead className="text-gray-300 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios?.users?.map((usuario: any) => (
                      <TableRow key={usuario.id} className="border-white/10">
                        <TableCell className="text-white font-mono">{usuario.id}</TableCell>
                        <TableCell className="text-white font-medium">{usuario.name || "—"}</TableCell>
                        <TableCell className="text-gray-400">{usuario.email || "—"}</TableCell>
                        <TableCell>
                          {usuario.role === "admin" ? (
                            <Badge className="bg-purple-600/20 border-purple-400/30 text-purple-300">
                              <Crown className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-blue-600/20 border-blue-400/30 text-blue-300">
                              <UserIcon className="w-3 h-3 mr-1" />
                              Usuário
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-400">{usuario.loginMethod || "—"}</TableCell>
                        <TableCell className="text-gray-400">
                          {usuario.lastSignedIn ? new Date(usuario.lastSignedIn).toLocaleString("pt-BR") : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUserId(usuario.id);
                                  setNewRole(usuario.role);
                                }}
                              >
                                <Shield className="w-4 h-4 mr-2" />
                                Alterar Função
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-900 border-white/10">
                              <DialogHeader>
                                <DialogTitle className="text-white">Alterar Função do Usuário</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                  Altere a função de {usuario.name} no sistema
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm text-gray-400 mb-2 block">Nova Função</label>
                                  <Select value={newRole} onValueChange={(value: "user" | "admin") => setNewRole(value)}>
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-white/10">
                                      <SelectItem value="user">
                                        <div className="flex items-center">
                                          <UserIcon className="w-4 h-4 mr-2" />
                                          Usuário
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="admin">
                                        <div className="flex items-center">
                                          <Crown className="w-4 h-4 mr-2" />
                                          Admin
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button
                                  onClick={handleUpdateRole}
                                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                  disabled={updateRole.isPending}
                                >
                                  {updateRole.isPending ? "Salvando..." : "Salvar Alteração"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
