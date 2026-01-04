import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Search,
  UserPlus,
  Edit2,
  Trash2,
  Shield,
  User,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type UserFormData = {
  id?: number;
  openId: string;
  name: string;
  email: string;
  role: "user" | "admin";
};

export default function Usuarios() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserFormData | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    openId: "",
    name: "",
    email: "",
    role: "user",
  });

  const utils = trpc.useUtils();

  // Query para listar usuários
  const { data, isLoading } = trpc.admin.usuarios.list.useQuery({
    page,
    pageSize: 20,
    search,
    role: roleFilter,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Mutations
  const createMutation = trpc.admin.usuarios.create.useMutation({
    onSuccess: () => {
      toast.success("Usuário criado com sucesso!");
      setIsCreateModalOpen(false);
      resetForm();
      utils.admin.usuarios.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.admin.usuarios.update.useMutation({
    onSuccess: () => {
      toast.success("Usuário atualizado com sucesso!");
      setIsEditModalOpen(false);
      resetForm();
      utils.admin.usuarios.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.admin.usuarios.delete.useMutation({
    onSuccess: () => {
      toast.success("Usuário deletado com sucesso!");
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      utils.admin.usuarios.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const changeRoleMutation = trpc.admin.usuarios.changeRole.useMutation({
    onSuccess: () => {
      toast.success("Role alterada com sucesso!");
      utils.admin.usuarios.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      openId: "",
      name: "",
      email: "",
      role: "user",
    });
    setSelectedUser(null);
  };

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (!selectedUser?.id) return;
    updateMutation.mutate({
      id: selectedUser.id,
      name: formData.name,
      email: formData.email,
      role: formData.role,
    });
  };

  const handleDelete = () => {
    if (!selectedUser?.id) return;
    deleteMutation.mutate({ id: selectedUser.id });
  };

  const handleToggleRole = (userId: number, currentRole: "user" | "admin") => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    changeRoleMutation.mutate({ id: userId, role: newRole });
  };

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setFormData({
      id: user.id,
      openId: user.openId,
      name: user.name || "",
      email: user.email || "",
      role: user.role,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: any) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Gestão de Usuários</h1>
          <p className="text-slate-400">Gerencie usuários e permissões do sistema</p>
        </div>

        {/* Filtros e Ações */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Busca */}
            <div className="flex-1">
              <Label htmlFor="search" className="text-slate-300 mb-2 block">
                Buscar usuário
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="search"
                  placeholder="Nome ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
            </div>

            {/* Filtro de Role */}
            <div className="w-full md:w-48">
              <Label htmlFor="role-filter" className="text-slate-300 mb-2 block">
                Filtrar por role
              </Label>
              <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="user">Usuários</SelectItem>
                  <SelectItem value="admin">Administradores</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botão Criar */}
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-slate-800/50">
                    <TableHead className="text-slate-300">Nome</TableHead>
                    <TableHead className="text-slate-300">Email</TableHead>
                    <TableHead className="text-slate-300">Role</TableHead>
                    <TableHead className="text-slate-300">Último Login</TableHead>
                    <TableHead className="text-slate-300 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.users.map((user) => (
                    <TableRow
                      key={user.id}
                      className="border-slate-800 hover:bg-slate-800/30"
                    >
                      <TableCell className="text-white font-medium">
                        {user.name || "Sem nome"}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {user.email || "Sem email"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.role === "admin" ? (
                            <>
                              <Shield className="w-4 h-4 text-purple-400" />
                              <span className="text-purple-400 font-medium">Admin</span>
                            </>
                          ) : (
                            <>
                              <User className="w-4 h-4 text-blue-400" />
                              <span className="text-blue-400 font-medium">Usuário</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {new Date(user.lastSignedIn).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleRole(user.id, user.role)}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                          >
                            {user.role === "admin" ? "Remover Admin" : "Tornar Admin"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(user)}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDeleteModal(user)}
                            className="border-red-800 text-red-400 hover:bg-red-950/50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginação */}
              {data && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-slate-800">
                  <p className="text-slate-400 text-sm">
                    Página {data.pagination.page} de {data.pagination.totalPages} ({data.pagination.total} usuários)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="border-slate-700 text-slate-300"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= data.pagination.totalPages}
                      className="border-slate-700 text-slate-300"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Criar Usuário */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
            <DialogDescription className="text-slate-400">
              Preencha os dados do novo usuário
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="openId">OpenID *</Label>
              <Input
                id="openId"
                value={formData.openId}
                onChange={(e) => setFormData({ ...formData, openId: e.target.value })}
                className="bg-slate-800 border-slate-700"
                placeholder="ex: user_123abc"
              />
            </div>
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "user" | "admin") =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetForm();
              }}
              className="border-slate-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Usuário */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription className="text-slate-400">
              Atualize os dados do usuário
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "user" | "admin") =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                resetForm();
              }}
              className="border-slate-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Deletar Usuário */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Deletar Usuário</DialogTitle>
            <DialogDescription className="text-slate-400">
              Tem certeza que deseja deletar o usuário{" "}
              <span className="font-bold text-white">{selectedUser?.name}</span>? Esta ação não
              pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedUser(null);
              }}
              className="border-slate-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
