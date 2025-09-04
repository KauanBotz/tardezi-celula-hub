import { useEffect, useState } from "react";
import { CreatePrayerRequest } from "@/components/CreatePrayerRequest";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Heart } from "lucide-react";
import { Link } from "react-router-dom";

type PrayerRequest = Database['public']['Tables']['prayer_requests']['Row'] & {
  profiles: { name: string; avatar_url: string; };
  prayer_responses: { id: string, content: string, created_at: string, profiles: { name: string, avatar_url: string } }[];
};

const PrayerRequests = () => {
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseContent, setResponseContent] = useState<{ [key: string]: string }>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPrayerRequests = async () => {
    setLoading(true);
    try {
      console.log("Buscando pedidos de oração...");
      
      const { data, error } = await supabase
        .from("prayer_requests")
        .select(`
          *,
          profiles (name, avatar_url),
          prayer_responses (id, content, created_at, profiles (name, avatar_url))
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar pedidos de oração:", error);
        toast({ 
          title: "Erro ao carregar pedidos", 
          description: error.message, 
          variant: "destructive" 
        });
      } else {
        console.log("Pedidos de oração carregados:", data?.length || 0);
        setPrayerRequests(data as PrayerRequest[]);
      }
    } catch (err) {
      console.error("Erro inesperado ao buscar pedidos:", err);
      toast({ 
        title: "Erro inesperado", 
        description: "Tente recarregar a página", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayerRequests();
  }, []);

  const handleResponseSubmit = async (prayerRequestId: string) => {
    if (!user) {
      toast({ title: "Você precisa estar logado para responder.", variant: "destructive" });
      return;
    }
    const content = responseContent[prayerRequestId];
    if (!content || content.trim() === "") return;

    setLoading(true);

    try {
      console.log("Enviando resposta para:", prayerRequestId);
      console.log("Conteúdo:", content);
      console.log("Usuário:", user.id);

      const { data, error } = await supabase
        .from("prayer_responses")
        .insert([{ 
          prayer_request_id: prayerRequestId, 
          content: content.trim(), 
          created_by: user.id 
        }])
        .select();

      if (error) {
        console.error("Erro ao inserir resposta:", error);
        toast({ 
          title: "Erro ao enviar resposta", 
          description: error.message, 
          variant: "destructive" 
        });
      } else {
        console.log("Resposta inserida com sucesso:", data);
        toast({ title: "Resposta enviada com sucesso! ✨" });
        setResponseContent(prev => ({ ...prev, [prayerRequestId]: "" }));
        
        // Recarregar os pedidos de oração
        await fetchPrayerRequests();
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      toast({ 
        title: "Erro inesperado", 
        description: "Tente novamente em alguns instantes", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrayerRequestCreated = () => {
    fetchPrayerRequests();
    // Não fechar o modal automaticamente
    toast({
      title: "Pedido de oração criado com sucesso! 🙏",
      description: "Continue criando mais pedidos ou feche o modal quando quiser",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 mb-8 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Heart className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Pedidos de Oração</h1>
              <p className="text-orange-100 text-lg mt-1">Compartilhe suas necessidades com a comunidade</p>
            </div>
          </div>
        </div>

        {/* Botão voltar */}
        <div className="mb-6">
          <Button asChild variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400">
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
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl shadow-lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Novo Pedido de Oração
          </Button>
        </div>

        {/* Lista de pedidos de oração */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="flex items-center justify-center gap-3 text-orange-600">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                Carregando pedidos de oração...
              </div>
            </div>
          ) : prayerRequests.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhum pedido de oração ainda</h3>
                <p className="text-gray-500 mb-4">Seja o primeiro a compartilhar uma necessidade com a comunidade</p>
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Pedido
                </Button>
              </CardContent>
            </Card>
          ) : (
            prayerRequests.map((request) => (
              <Card key={request.id} className="shadow-lg border-0">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10 overflow-hidden">
                      <AvatarImage 
                        src={!request.is_anonymous ? request.profiles.avatar_url : ""} 
                        className="object-cover object-center"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm">
                        {request.is_anonymous ? "A" : request.profiles.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{request.title}</CardTitle>
                      <CardDescription>
                        Pedido por {request.is_anonymous ? "Anônimo" : request.profiles.name} em {new Date(request.created_at).toLocaleDateString('pt-BR')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-gray-700">{request.content}</p>
                </CardContent>
                <CardFooter className="flex-col items-start">
                  <h4 className="text-sm font-semibold mb-2 text-gray-700">Respostas:</h4>
                  <div className="w-full space-y-2 mb-4">
                    {request.prayer_responses.map(response => (
                      <div key={response.id} className="text-sm bg-orange-50 border border-orange-200 p-3 rounded-lg">
                        <span className="font-semibold text-orange-700">{response.profiles.name}: </span>
                        <span className="text-gray-700">{response.content}</span>
                      </div>
                    ))}
                  </div>
                  <div className="w-full flex space-x-2">
                    <Input
                      placeholder="Escreva uma resposta de oração..."
                      value={responseContent[request.id] || ""}
                      onChange={(e) => setResponseContent(prev => ({ ...prev, [request.id]: e.target.value }))}
                      className="flex-1 border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl"
                    />
                    <Button 
                      onClick={() => handleResponseSubmit(request.id)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6"
                    >
                      Responder
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        {/* Modal de criação */}
        <Modal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)}
          title="Novo Pedido de Oração"
        >
          <CreatePrayerRequest onPrayerRequestCreated={handlePrayerRequestCreated} />
        </Modal>
      </div>
    </div>
  );
};

export default PrayerRequests;