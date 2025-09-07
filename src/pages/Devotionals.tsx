import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CreateDevotional from "@/components/CreateDevotional";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, BookHeart, Calendar, User, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Devotional {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
  created_by: string;
  profiles?: {
    name: string;
    avatar_url?: string;
  };
}

export default function Devotionals() {
  const { user, profile } = useAuth();
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchDevotionals = async () => {
    try {
      const { data, error } = await supabase
        .from('devotionals')
        .select(`
          *,
          profiles:created_by (
            name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching devotionals:', error);
        toast.error("Erro ao carregar devocionais");
        return;
      }

      setDevotionals(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro inesperado ao carregar devocionais");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevotionals();
  }, []);

  const handleDevotionalCreated = () => {
    setShowCreateForm(false);
    fetchDevotionals();
  };

  const handleDeleteDevotional = async (devotionalId: string) => {
    if (!confirm("Tem certeza que deseja excluir este devocional?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('devotionals')
        .delete()
        .eq('id', devotionalId);

      if (error) {
        console.error('Error deleting devotional:', error);
        toast.error("Erro ao excluir devocional");
        return;
      }

      toast.success("Devocional excluído com sucesso!");
      fetchDevotionals();
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro inesperado ao excluir devocional");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-pink-800 mb-4">Acesso Restrito</h1>
          <p className="text-gray-600 mb-4">Você precisa estar logado para acessar os devocionais.</p>
          <Link to="/">
            <Button>Ir para Login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <BookHeart className="h-8 w-8 text-pink-600" />
              <h1 className="text-3xl font-bold text-pink-800">Devocionais</h1>
            </div>
          </div>
          
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-pink-600 hover:bg-pink-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Devocional
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="mb-6">
            <CreateDevotional onDevotionalCreated={handleDevotionalCreated} />
          </div>
        )}

        {/* Devotionals List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando devocionais...</p>
            </div>
          </div>
        ) : devotionals.length === 0 ? (
          <Card className="p-8 text-center">
            <BookHeart className="h-16 w-16 text-pink-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Nenhum devocional encontrado</h2>
            <p className="text-gray-600 mb-4">Seja o primeiro a compartilhar um devocional!</p>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-pink-600 hover:bg-pink-700"
            >
              Criar Primeiro Devocional
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {devotionals.map((devotional) => (
              <Card key={devotional.id} className="p-6 bg-white/80 backdrop-blur-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-pink-600" />
                      <span className="font-medium text-gray-900">
                        {devotional.profiles?.name || 'Usuário Anônimo'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {formatDistanceToNow(new Date(devotional.created_at), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </div>
                  </div>
                  
                  {user.id === devotional.created_by && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDevotional(devotional.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <h3 className="text-xl font-semibold text-pink-800 mb-3">
                  {devotional.title}
                </h3>

                {devotional.image_url && (
                  <div className="mb-4">
                    <img
                      src={devotional.image_url}
                      alt="Imagem do devocional"
                      className="w-full max-w-md h-48 object-cover rounded-lg mx-auto"
                    />
                  </div>
                )}

                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {devotional.content}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}