import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Star, Send, UserX, Upload, X, Image, Video, Sparkles } from "lucide-react";

export const CreateTestimony = ({ onTestimonyCreated }: { onTestimonyCreated: () => void }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setMediaFile(file);
  };

  const removeFile = () => {
    setMediaFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Você precisa estar logado para postar um testemunho.", variant: "destructive" });
      return;
    }

    setLoading(true);

    let media_url = null;
    let media_type = 'text';

    if (mediaFile) {
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;
        const { data, error: uploadError } = await supabase.storage.from('media').upload(fileName, mediaFile);

        if (uploadError) {
            toast({ title: "Erro no upload da mídia", description: uploadError.message, variant: "destructive" });
            setLoading(false);
            return;
        }
        media_url = data.path;
        if(mediaFile.type.startsWith('image/')) media_type = 'image';
        if(mediaFile.type.startsWith('video/')) media_type = 'video';
    }

    const { error } = await supabase
      .from("testimonies")
      .insert([{ title, content, is_anonymous: isAnonymous, created_by: user.id, media_url, media_type }]);

    if (error) {
      toast({
        title: "Erro ao criar testemunho",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Testemunho enviado com sucesso! ✨",
        description: "Seu testemunho foi compartilhado com a comunidade",
      });
      setTitle("");
      setContent("");
      setIsAnonymous(false);
      setMediaFile(null);
      // Fix: Limpa o campo de arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onTestimonyCreated();
    }

    setLoading(false);
  };

  const getFileIcon = () => {
    if (!mediaFile) return <Upload className="w-5 h-5" />;
    if (mediaFile.type.startsWith('image/')) return <Image className="w-5 h-5 text-green-600" />;
    if (mediaFile.type.startsWith('video/')) return <Video className="w-5 h-5 text-blue-600" />;
    return <Upload className="w-5 h-5" />;
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label 
            htmlFor="testimony-title" 
            className="text-sm font-semibold text-gray-700 flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Título do Testemunho
          </Label>
          <Input
            id="testimony-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Como Deus me curou, A fidelidade do Senhor..."
            className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 px-4 text-base transition-all duration-200"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label 
            htmlFor="testimony-content" 
            className="text-sm font-semibold text-gray-700 flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Seu Testemunho
          </Label>
          <div className="relative">
            <Textarea
              id="testimony-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Conte como Deus tem agido em sua vida, suas bênçãos e vitórias..."
              rows={6}
              className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl p-4 text-base resize-none transition-all duration-200"
              required
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {content.length}/1000
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label 
            htmlFor="testimony-media" 
            className="text-sm font-semibold text-gray-700 flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Mídia (opcional)
          </Label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-orange-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept="image/*,video/*"
              className="hidden"
              id="testimony-media"
            />
            <label htmlFor="testimony-media" className="cursor-pointer">
              <div className="space-y-3">
                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  {getFileIcon()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {mediaFile ? mediaFile.name : "Clique para selecionar uma imagem ou vídeo"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF, MP4, AVI até 10MB
                  </p>
                </div>
              </div>
            </label>
            {mediaFile && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeFile}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Remover
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(!!checked)}
              className="mt-1 border-orange-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
            />
            <div className="flex-1">
              <Label 
                htmlFor="anonymous" 
                className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2"
              >
                <UserX className="w-4 h-4 text-orange-600" />
                Publicar anonimamente
              </Label>
              <p className="text-xs text-gray-600 mt-1">
                Seu nome não será mostrado, apenas "Testemunho Anônimo"
              </p>
            </div>
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
                Enviando...
              </>
            ) : (
              <>
                <Star className="w-4 h-4" />
                Enviar Testemunho
              </>
            )}
          </div>
        </Button>
      </form>
    </div>
  );
};