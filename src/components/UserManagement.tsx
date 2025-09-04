import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreateUser } from "@/components/CreateUser";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit2, Users, Shield, Crown, Save, X, Sparkles, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";

type Profile = Database['public']['Tables']['profiles']['Row'];

export const UserManagement = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [deletingUser, setDeletingUser] = useState<Profile | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    address: "",
    age: "",
    phone: "",
    role: "user" as "user" | "leader_trainee" | "leader"
  });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("profiles").select("*");
    if (error) {
      toast({ title: "Erro ao buscar usuários", description: error.message, variant: "destructive" });
    } else {
      setUsers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditUser = (user: Profile) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      address: user.address || "",
      age: user.age?.toString() || "",
      phone: user.phone || "",
      role: user.role
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    setEditLoading(true);
    
    const { error } = await supabase
      .from("profiles")
      .update({
        name: editFormData.name,
        email: editFormData.email,
        address: editFormData.address || null,
        age: editFormData.age ? parseInt(editFormData.age) : null,
        phone: editFormData.phone || null,
        role: editFormData.role
      })
      .eq("id", editingUser.id);

    if (error) {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Usuário atualizado com sucesso!",
        description: `${editFormData.name} foi atualizado no sistema.`
      });
      setIsEditModalOpen(false);
      setEditingUser(null);
      fetchUsers(); // Refresh the list
    }
    
    setEditLoading(false);
  };
  
  const roleMapping = {
    user: 'Usuário',
    leader_trainee: 'Líder em Treinamento',
    leader: 'Líder'
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "leader": return <Crown className="w-4 h-4 text-white" />;
      case "leader_trainee": return <Shield className="w-4 h-4 text-white" />;
      default: return <Users className="w-4 h-4 text-white" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "leader": return "default";
      case "leader_trainee": return "secondary";
      default: return "outline";
    }
  };

  const handleDeleteUser = (user: Profile) => {
    setDeletingUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!deletingUser) return;
    
    setDeleteLoading(true);
    
    try {
      // Primeiro, deletar o usuário da autenticação do Supabase
      const { error: authError } = await supabase.auth.admin.deleteUser(deletingUser.user_id);
      
      if (authError) {
        // Se não conseguir deletar da auth (pode ser que não tenha permissão), 
        // pelo menos deletar o perfil
        console.warn('Não foi possível deletar da autenticação:', authError.message);
      }
      
      // Deletar o perfil da tabela profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", deletingUser.id);

      if (profileError) {
        throw profileError;
      }

      toast({
        title: "Usuário deletado com sucesso!",
        description: `${deletingUser.name} foi removido do sistema.`
      });
      
      setIsDeleteModalOpen(false);
      setDeletingUser(null);
      fetchUsers(); // Refresh the list
      
    } catch (error: any) {
      toast({
        title: "Erro ao deletar usuário",
        description: error.message,
        variant: "destructive"
      });
    }
    
    setDeleteLoading(false);
  };

  const handleUserCreated = () => {
    fetchUsers();
    setIsCreateModalOpen(false);
    toast({ title: "Usuário criado com sucesso! ✨" });
  };

  return (
    <div className="space-y-6">
      {/* Header com botão de adicionar */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Lista de Usuários</h3>
          <p className="text-gray-600">Gerencie todos os membros da comunidade</p>
        </div>
        
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Usuário
        </Button>
      </div>

      {/* Tabela moderna */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              <TableHead className="font-semibold text-gray-700 py-4">Nome</TableHead>
              <TableHead className="font-semibold text-gray-700 py-4">Email</TableHead>
              <TableHead className="font-semibold text-gray-700 py-4">Telefone</TableHead>
              <TableHead className="font-semibold text-gray-700 py-4">Idade</TableHead>
              <TableHead className="font-semibold text-gray-700 py-4">Função</TableHead>
              <TableHead className="font-semibold text-gray-700 py-4 text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    Carregando usuários...
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                  Nenhum usuário cadastrado ainda
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow 
                  key={user.id} 
                  className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <TableCell className="font-medium py-4">{user.name}</TableCell>
                  <TableCell className="text-gray-600 py-4">{user.email}</TableCell>
                  <TableCell className="text-gray-600 py-4">{user.phone || 'N/A'}</TableCell>
                  <TableCell className="text-gray-600 py-4">{user.age || 'N/A'}</TableCell>
                  <TableCell className="py-4">
                    <Badge 
                      variant={getRoleBadgeVariant(user.role)}
                      className="flex items-center gap-1 w-fit"
                    >
                      {getRoleIcon(user.role)}
                      {roleMapping[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        onClick={() => handleEditUser(user)}
                        variant="outline"
                        size="sm"
                        className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        onClick={() => handleDeleteUser(user)}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Deletar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Criar Usuário */}
      <Modal
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        title="Criar Novo Usuário"
      >
        <CreateUser onUserCreated={handleUserCreated} />
      </Modal>

      {/* Modal de Editar Usuário */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="Editar Usuário"
      >
        <div className="w-full">
          <form onSubmit={(e) => { e.preventDefault(); handleUpdateUser(); }} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Nome Completo
                </Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="Ex: João Silva Santos"
                  className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 px-4 text-base transition-all duration-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  E-mail
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  placeholder="joao@exemplo.com"
                  className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 px-4 text-base transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-age" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Idade
                </Label>
                <Input
                  id="edit-age"
                  type="number"
                  value={editFormData.age}
                  onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                  placeholder="Ex: 25"
                  min="1"
                  max="120"
                  className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 px-4 text-base transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-role" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Tipo de Usuário
                </Label>
                <Select value={editFormData.role} onValueChange={(value: "user" | "leader_trainee" | "leader") => setEditFormData({ ...editFormData, role: value })}>
                  <SelectTrigger className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 px-4 text-base transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-600" />
                        Usuário Comum
                      </div>
                    </SelectItem>
                    <SelectItem value="leader_trainee">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        Líder em Treinamento
                      </div>
                    </SelectItem>
                    <SelectItem value="leader">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-orange-600" />
                        Líder Principal
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Telefone (opcional)
              </Label>
              <Input
                id="edit-phone"
                type="tel"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                placeholder="Ex: (11) 99999-9999"
                className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 px-4 text-base transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Endereço (opcional)
              </Label>
              <Input
                id="edit-address"
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                placeholder="Rua, número, bairro, cidade"
                className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 px-4 text-base transition-all duration-200"
              />
            </div>

            {/* Botões de ação */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={editLoading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white h-12 rounded-xl"
              >
                {editLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Salvando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Salvar Alterações
                  </div>
                )}
              </Button>
              
              <Button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50 h-12 rounded-xl"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Confirmar Exclusão"
      >
        <div className="w-full">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tem certeza que deseja deletar este usuário?
              </h3>
              <p className="text-gray-600">
                Você está prestes a deletar <strong>{deletingUser?.name}</strong> permanentemente.
              </p>
              <p className="text-sm text-red-600 mt-2">
                ⚠️ Esta ação não pode ser desfeita!
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={confirmDeleteUser}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white h-12 rounded-xl"
              >
                {deleteLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Deletando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Sim, Deletar
                  </div>
                )}
              </Button>
              
              <Button
                onClick={() => setIsDeleteModalOpen(false)}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50 h-12 rounded-xl"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};