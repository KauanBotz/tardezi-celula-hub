import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save, User, MapPin, Calendar } from "lucide-react";
import { ProfileImageEditor } from "@/components/ProfileImageEditor";

export const ProfileSettings = () => {
  const { profile, user, loading: authLoading } = useAuth();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setAddress(profile.address || '');
      setAge(profile.age || '');
      setPhone(profile.phone || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  async function handleUpdateProfile() {
    if (!user) return;
    setLoading(true);

    const { error } = await supabase.from('profiles').update({
      name,
      address,
      age: age === '' ? null : age,
      phone: phone || null,
    }).eq('user_id', user.id);

    if (error) {
      toast({ title: "Erro ao atualizar perfil", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Perfil atualizado com sucesso! ✨" });
    }
    setLoading(false);
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    if (!user || !event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({ title: "Arquivo inválido", description: "Por favor, selecione apenas imagens.", variant: "destructive" });
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "A imagem deve ter no máximo 5MB.", variant: "destructive" });
      return;
    }

    // Criar URL temporária para o editor
    const imageUrl = URL.createObjectURL(file);
    setSelectedImageFile(imageUrl);
    setIsEditorOpen(true);
  }

  const handleImageSave = (newAvatarUrl: string) => {
    setAvatarUrl(newAvatarUrl);
    if (selectedImageFile) {
      URL.revokeObjectURL(selectedImageFile);
      setSelectedImageFile('');
    }
  };

  return (
    <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white pb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <User className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">Meu Perfil</CardTitle>
            <CardDescription className="text-orange-100">
              Atualize suas informações pessoais e foto de perfil
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* Seção da foto de perfil */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg overflow-hidden">
              <AvatarImage 
                src={avatarUrl} 
                alt="Foto de perfil"
                className="object-cover object-center w-full h-full"
                onError={(e) => {
                  // Fallback para imagem quebrada
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white">
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {uploading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-center sm:items-start gap-3">
            <Label htmlFor="avatar-upload" className="cursor-pointer">
              <Button asChild variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400">
                <span className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  {uploading ? 'Enviando...' : 'Trocar Foto'}
                </span>
              </Button>
              <Input 
                id="avatar-upload" 
                type="file" 
                className="hidden" 
                onChange={uploadAvatar} 
                disabled={uploading} 
                accept="image/*" 
              />
            </Label>
            <p className="text-sm text-gray-600 text-center sm:text-left">
              Formatos aceitos: JPG, PNG, GIF (máx. 5MB)
            </p>
          </div>
        </div>

        {/* Campos do formulário */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Nome Completo
            </Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 px-4 text-base transition-all duration-200"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="age" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Idade
            </Label>
            <Input 
              id="age" 
              type="number" 
              value={age} 
              onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              placeholder="Sua idade"
              min="1"
              max="120"
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
            value={phone} 
            onChange={(e) => setPhone(e.target.value)}
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
            value={address} 
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Rua, número, bairro, cidade"
            className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 px-4 text-base transition-all duration-200"
          />
        </div>

        {/* Botão de salvar */}
        <Button 
          onClick={handleUpdateProfile} 
          disabled={loading || authLoading}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white h-12 rounded-xl"
        >
          {loading ? (
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
      </CardContent>

      {/* Editor de imagem */}
      {isEditorOpen && selectedImageFile && (
        <ProfileImageEditor
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            if (selectedImageFile) {
              URL.revokeObjectURL(selectedImageFile);
              setSelectedImageFile('');
            }
          }}
          onSave={handleImageSave}
          initialImage={selectedImageFile}
        />
      )}
    </Card>
  );
};