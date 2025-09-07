import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUserCreation } from "@/hooks/useUserCreation";
import { UserPlus, Send, Users, Shield, Crown, Sparkles } from "lucide-react";

interface CreateUserProps {
  onUserCreated?: () => void;
}

export const CreateUser = ({ onUserCreated }: CreateUserProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    birth_date: "",
    phone: "",
    role: "user" as "user" | "leader_trainee" | "leader"
  });
  const { createUser, loading } = useUserCreation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await createUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      address: formData.address,
      birth_date: formData.birth_date,
      phone: formData.phone,
      role: formData.role
    });

    if (result.success) {
      toast({
        title: "Usuário criado com sucesso! ✨",
        description: `${formData.name} foi cadastrado(a) no sistema com o perfil de ${getRoleName(formData.role)}.`
      });

      setFormData({
        name: "",
        email: "",
        address: "",
        password: "",
        birth_date: "",
        phone: "",
        role: "user"
      });
      
      // Chama o callback se fornecido
      if (onUserCreated) {
        onUserCreated();
      }
    } else {
      toast({
        title: "Erro ao criar usuário",
        description: result.error,
        variant: "destructive"
      });
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "leader": return "Líder";
      case "leader_trainee": return "Líder em Treinamento";
      default: return "Usuário Comum";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "leader": return <Crown className="w-4 h-4 text-orange-600" />;
      case "leader_trainee": return <Shield className="w-4 h-4 text-blue-600" />;
      default: return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Nome Completo
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: João Silva Santos"
              className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 px-4 text-base transition-all duration-200"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="joao@exemplo.com"
              className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 px-4 text-base transition-all duration-200"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 px-4 text-base transition-all duration-200"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth_date" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Data de Aniversário
            </Label>
            <Input
              id="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              placeholder="Selecione a data de nascimento"
              className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 px-4 text-base transition-all duration-200"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Telefone (opcional)
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Ex: (11) 99999-9999"
            className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 px-4 text-base transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Endereço (opcional)
          </Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Rua, número, bairro, cidade"
            className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 px-4 text-base transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Tipo de Usuário
          </Label>
          <Select value={formData.role} onValueChange={(value: "user" | "leader_trainee" | "leader") => setFormData({ ...formData, role: value })}>
            <SelectTrigger className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 px-4 text-base">
              <SelectValue placeholder="Selecione o tipo de usuário" />
            </SelectTrigger>
            <SelectContent className="z-[10000]">
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

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mt-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              {getRoleIcon(formData.role)}
              <strong>Selecionado:</strong> {getRoleName(formData.role)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {formData.role === "leader" && "Acesso completo ao sistema, pode gerenciar usuários e eventos."}
              {formData.role === "leader_trainee" && "Pode criar eventos e gerenciar conteúdo, mas não usuários."}
              {formData.role === "user" && "Acesso básico: pode participar de eventos e interagir com conteúdo."}
            </p>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:transform-none"
          disabled={loading}
        >
          <div className="flex items-center gap-2">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Criando usuário...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Criar Usuário
              </>
            )}
          </div>
        </Button>
      </form>
    </div>
  );
};
