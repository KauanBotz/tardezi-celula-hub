import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BookOpen, Plus, ArrowLeft, Upload, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CreateDevotional from "@/components/CreateDevotional";

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadDevotionals();
    }
  }, [user]);

  const loadDevotionals = async () => {
    try {
      const { data, error } = await supabase
        .from('devotionals')
        .select('*')
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

  const handleDevotionalCreated = () => {
    loadDevotionals();
    toast({
      title: "Devocional criado com sucesso! 📖",
      description: "Continue criando mais devocionais ou feche o modal quando quiser",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-screen">
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
              <p className="text-muted-foreground">Faça login para ver os devocionais</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-screen">
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex items-center justify-center gap-3 text-blue-600">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                Carregando devocionais...
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 mb-8 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Devocionais</h1>
              <p className="text-blue-100 text-lg mt-1">Compartilhe momentos de reflexão e fé</p>
            </div>
          </div>
        </div>

        {/* Botão voltar */}
        <div className="mb-6">
          <Button asChild variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> 
              Voltar para o Dashboard
            </Link>
          </Button>
        </div>

        {/* Botão para abrir modal */}
        <div className="mb-6">
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Novo Devocional
          </Button>
        </div>

        {/* Lista de devocionais */}
        <div className="space-y-4">
          {devotionals.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhum devocional ainda</h3>
                <p className="text-gray-500 mb-4">
                  Seja o primeiro a compartilhar um devocional inspirador!
                </p>
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Devocional
                </Button>
              </CardContent>
            </Card>
          ) : (
            devotionals.map((devotional) => (
              <Card key={devotional.id} className="shadow-lg border-0">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10 overflow-hidden">
                      <AvatarImage 
                        src={devotional.profiles?.avatar_url || ""} 
                        className="object-cover object-center"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                        {devotional.profiles?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{devotional.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Compartilhado por {devotional.profiles?.name || "Usuário"} em {format(new Date(devotional.created_at), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {devotional.image_url && (
                    <div className="w-full mb-4">
                      <img 
                        src={devotional.image_url} 
                        alt={devotional.title}
                        className="w-full max-w-md mx-auto rounded-lg object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap text-gray-700">{devotional.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Modal de criação */}
        <Modal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)}
          title="Novo Devocional"
        >
          <CreateDevotional onDevotionalCreated={handleDevotionalCreated} />
        </Modal>
      </div>
    </div>
  );
}