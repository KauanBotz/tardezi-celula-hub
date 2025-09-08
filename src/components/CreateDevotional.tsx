import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image } from "lucide-react";

interface CreateDevotionalProps {
  onDevotionalCreated?: () => void;
}

export default function CreateDevotional({ onDevotionalCreated }: CreateDevotionalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
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
        toast({
          title: "Erro",
          description: "Por favor, selecione apenas arquivos de imagem",
          variant: "destructive",
        });
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
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um devocional",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o título e o conteúdo",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;
      
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
        if (!imageUrl) {
          toast({
            title: "Erro",
            description: "Erro ao fazer upload da imagem",
            variant: "destructive",
          });
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
        toast({
          title: "Erro",
          description: "Erro ao criar devocional",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Devocional criado com sucesso!",
      });
      setTitle("");
      setContent("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onDevotionalCreated?.();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar devocional",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          Título
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Digite o título do devocional"
          className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 px-4 text-base transition-all duration-200"
          required
        />
      </div>

      <div>
        <Label htmlFor="content" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          Conteúdo
        </Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Compartilhe seu devocional..."
          className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl px-4 py-3 text-base transition-all duration-200 min-h-[120px]"
          rows={6}
          required
        />
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          Imagem (opcional)
        </Label>
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
            className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-500 transition-colors"
          >
            {selectedFile ? (
              <div className="flex items-center space-x-2">
                <Image className="h-6 w-6 text-orange-600" />
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

      <div className="flex gap-3 pt-4">
        <Button 
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-2 rounded-xl shadow-lg"
        >
          {isSubmitting ? "Criando..." : "Criar Devocional"}
        </Button>
      </div>
    </div>
  );
}