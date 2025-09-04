import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Send, UserX, Sparkles } from "lucide-react";

export const CreatePrayerRequest = ({ onPrayerRequestCreated }: { onPrayerRequestCreated: () => void }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Você precisa estar logado para criar um pedido de oração.", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      console.log("Criando pedido de oração...");
      console.log("Título:", title);
      console.log("Conteúdo:", content);
      console.log("Anônimo:", isAnonymous);
      console.log("Usuário:", user.id);

      const { data, error } = await supabase
        .from("prayer_requests")
        .insert([{ 
          title: title.trim(), 
          content: content.trim(), 
          is_anonymous: isAnonymous, 
          created_by: user.id 
        }])
        .select();

      if (error) {
        console.error("Erro ao criar pedido de oração:", error);
        toast({
          title: "Erro ao criar pedido de oração",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log("Pedido de oração criado com sucesso:", data);
        toast({
          title: "Pedido de oração enviado com sucesso! 🙏",
          description: "Sua solicitação foi compartilhada com a comunidade",
        });
        setTitle("");
        setContent("");
        setIsAnonymous(false);
        
        // Chamar callback para recarregar a lista
        onPrayerRequestCreated();
      }
    } catch (err) {
      console.error("Erro inesperado ao criar pedido:", err);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label 
            htmlFor="title" 
            className="text-sm font-semibold text-gray-700 flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Motivo da Oração
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Por saúde, trabalho, família..."
            className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 px-4 text-base transition-all duration-200"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label 
            htmlFor="content" 
            className="text-sm font-semibold text-gray-700 flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Descrição do Pedido
          </Label>
          <div className="relative">
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Compartilhe os detalhes do que você gostaria que orassem por você..."
              rows={6}
              className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl p-4 text-base resize-none transition-all duration-200"
              required
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {content.length}/500
            </div>
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
                Seu nome não será mostrado, apenas "Pedido Anônimo"
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
                <Send className="w-4 h-4" />
                Enviar Pedido de Oração
              </>
            )}
          </div>
        </Button>
      </form>
    </div>
  );
};