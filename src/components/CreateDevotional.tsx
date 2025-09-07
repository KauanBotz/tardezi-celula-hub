import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Upload, X, Image } from "lucide-react";

interface CreateDevotionalProps {
  onDevotionalCreated?: () => void;
}

export default function CreateDevotional({ onDevotionalCreated }: CreateDevotionalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
      } else {
        toast.error("Por favor, selecione apenas arquivos de imagem");
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('devotionals')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('devotionals')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Você precisa estar logado para criar um devocional");
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error("Por favor, preencha o título e o conteúdo");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;
      
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
        if (!imageUrl) {
          toast.error("Erro ao fazer upload da imagem");
          setIsSubmitting(false);
          return;
        }
      }

      const { error } = await supabase
        .from('devotionals')
        .insert({
          title: title.trim(),
          content: content.trim(),
          image_url: imageUrl,
          created_by: user.id
        });

      if (error) {
        console.error('Error creating devotional:', error);
        toast.error("Erro ao criar devocional");
        return;
      }

      toast.success("Devocional criado com sucesso!");
      setTitle("");
      setContent("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onDevotionalCreated?.();
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro inesperado ao criar devocional");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-pink-800">Criar Devocional</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Digite o título do devocional"
            required
          />
        </div>

        <div>
          <Label htmlFor="content">Conteúdo</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Compartilhe seu devocional..."
            rows={6}
            required
          />
        </div>

        <div>
          <Label>Imagem (opcional)</Label>
          <div className="mt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-pink-400 transition-colors"
            >
              {selectedFile ? (
                <div className="flex items-center space-x-2">
                  <Image className="h-6 w-6 text-pink-600" />
                  <span className="text-sm text-gray-600">{selectedFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      removeFile();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Clique para adicionar uma imagem</span>
                </div>
              )}
            </label>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-pink-600 hover:bg-pink-700"
        >
          {isSubmitting ? "Criando..." : "Criar Devocional"}
        </Button>
      </form>
    </Card>
  );
}