import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BookOpen, Plus, ArrowLeft, Upload, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Devotional {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  created_by: string;
  created_at: string;
  profiles?: {
    name: string;
    avatar_url?: string;
  } | null;
}

export default function Devotionals() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDevotional, setNewDevotional] = useState({
    title: "",
    content: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      loadDevotionals();
    }
  }, [user]);

  const loadDevotionals = async () => {
    try {
      const { data, error } = await supabase
        .from('devotionals')
        .select(`
          *,
          profiles (
            name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDevotionals(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar devocionais:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar devocionais",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('devotionals')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('devotionals')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newDevotional.title.trim() || !newDevotional.content.trim()) return;

    setUploading(true);
    try {
      let imageUrl = null;
      
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) {
          toast({
            title: "Erro",
            description: "Erro ao fazer upload da imagem",
            variant: "destructive",
          });
          setUploading(false);
          return;
        }
      }

      const { error } = await supabase
        .from('devotionals')
        .insert({
          title: newDevotional.title.trim(),
          content: newDevotional.content.trim(),
          image_url: imageUrl,
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Devocional criado com sucesso!",
      });

      setNewDevotional({ title: "", content: "" });
      setSelectedImage(null);
      setImagePreview(null);
      setShowCreateForm(false);
      loadDevotionals();
    } catch (error: any) {
      console.error('Erro ao criar devocional:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar devocional",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <Card className="p-8 text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground">Faça login para ver os devocionais</p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando devocionais...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-primary" />
                Devocionais
              </h1>
              <p className="text-muted-foreground">Compartilhe momentos de reflexão e fé</p>
            </div>
          </div>
          
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showCreateForm ? "Cancelar" : "Novo Devocional"}
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Criar Novo Devocional</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newDevotional.title}
                  onChange={(e) => setNewDevotional(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Digite o título do devocional"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="content">Conteúdo</Label>
                <Textarea
                  id="content"
                  value={newDevotional.content}
                  onChange={(e) => setNewDevotional(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Escreva seu devocional aqui..."
                  rows={6}
                  required
                />
              </div>

              <div>
                <Label htmlFor="image">Imagem (opcional)</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                        onClick={removeImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <span className="text-sm text-muted-foreground">
                          Clique para selecionar uma imagem
                        </span>
                      </Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={uploading}>
                  {uploading ? "Publicando..." : "Publicar Devocional"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Devotionals List */}
        <div className="space-y-6">
          {devotionals.length === 0 ? (
            <Card className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum devocional ainda</h3>
              <p className="text-muted-foreground mb-4">
                Seja o primeiro a compartilhar um devocional inspirador!
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Devocional
              </Button>
            </Card>
          ) : (
            devotionals.map((devotional) => (
              <Card key={devotional.id} className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={devotional.profiles?.avatar_url || ""} />
                    <AvatarFallback>
                      {devotional.profiles?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{devotional.profiles?.name || "Usuário"}</h4>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(devotional.created_at), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">{devotional.title}</h3>
                  
                  {devotional.image_url && (
                    <div className="w-full">
                      <img 
                        src={devotional.image_url} 
                        alt={devotional.title}
                        className="w-full max-w-md mx-auto rounded-lg object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap text-foreground">{devotional.content}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}