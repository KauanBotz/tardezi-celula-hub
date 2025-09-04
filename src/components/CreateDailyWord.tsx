import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Send, Sparkles } from "lucide-react";

export const CreateDailyWord = ({ onDailyWordCreated }: { onDailyWordCreated: () => void }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Você não tem permissão para postar a Palavra do Dia.", variant: "destructive" });
      return;
    }

    console.log('=== DEBUG DAILY WORD ===');
    console.log('Usuário logado:', user);
    console.log('Título:', title);
    console.log('Conteúdo:', content);
    console.log('User ID:', user.id);

    setLoading(true);

    const { data, error } = await supabase
      .from("daily_word")
      .insert([{ title, content, created_by: user.id }])
      .select();

    console.log('Resultado da inserção:', { data, error });

    if (error) {
      console.error('Erro detalhado:', error);
      toast({
        title: "Erro ao postar a Palavra do Dia",
        description: error.message,
        variant: "destructive",
      });
    } else {
      console.log('Palavra do dia criada com sucesso:', data);
      toast({
        title: "Palavra do Dia postada com sucesso! ✨",
        description: "Sua mensagem inspiracional foi compartilhada com todos",
      });
      setTitle("");
      setContent("");
      onDailyWordCreated();
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white pb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Palavra do Dia</CardTitle>
              <p className="text-orange-100 text-sm mt-1">Compartilhe uma mensagem inspiracional</p>
            </div>
          </div>
          <div className="absolute top-4 right-4 opacity-20">
            <Sparkles className="w-8 h-8" />
          </div>
        </CardHeader>
        
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label 
                htmlFor="daily-word-title" 
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Título da Mensagem
              </Label>
              <Input
                id="daily-word-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: A alegria do Senhor é a nossa força"
                className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 px-4 text-base transition-all duration-200"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label 
                htmlFor="daily-word-content" 
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Conteúdo da Palavra
                <span className="text-xs text-gray-500 ml-2">
                  (Suporte: &lt;strong&gt;, &lt;br&gt;, &lt;em&gt;, &lt;u&gt;)
                </span>
              </Label>
              <div className="relative">
                <Textarea
                  id="daily-word-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escreva aqui sua mensagem inspiracional para abençoar a vida de todos..."
                  rows={8}
                  className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl p-4 text-base resize-none transition-all duration-200"
                  required
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {content.length}/1000
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
                    Postando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Postar Palavra do Dia
                  </>
                )}
              </div>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};