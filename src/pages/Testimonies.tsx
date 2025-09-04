import { useEffect, useState } from "react";
import { CreateTestimony } from "@/components/CreateTestimony";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

type Testimony = Database['public']['Tables']['testimonies']['Row'] & {
  profiles: { name: string, avatar_url: string };
  testimony_responses: { id: string, content: string, created_at: string, profiles: { name: string, avatar_url: string } }[];
};

const Testimonies = () => {
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseContent, setResponseContent] = useState<{ [key: string]: string }>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTestimonies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("testimonies")
      .select(`
        *,
        profiles (name, avatar_url),
        testimony_responses (id, content, created_at, profiles (name, avatar_url))
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar testemunhos:", error);
    } else {
      setTestimonies(data as Testimony[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTestimonies();
  }, []);

  const handleResponseSubmit = async (testimonyId: string) => {
    if (!user) {
        toast({ title: "Você precisa estar logado para responder.", variant: "destructive" });
        return;
    }
    const content = responseContent[testimonyId];
    if (!content || content.trim() === "") return;

    const { error } = await supabase
      .from("testimony_responses")
      .insert([{ testimony_id: testimonyId, content, created_by: user.id }]);
    
    if (error) {
      toast({ title: "Erro ao enviar resposta.", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Resposta enviada com sucesso!" });
      setResponseContent(prev => ({ ...prev, [testimonyId]: "" }));
      fetchTestimonies();
    }
  };

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from('media').getPublicUrl(path);
    return data.publicUrl;
  }

  const handleTestimonyCreated = () => {
    fetchTestimonies();
    // Não fechar o modal automaticamente
    toast({
      title: "Testemunho enviado com sucesso! ✨",
      description: "Continue compartilhando mais testemunhos ou feche o modal quando quiser",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 mb-8 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Testemunhos</h1>
              <p className="text-orange-100 text-lg mt-1">Compartilhe suas experiências com a comunidade</p>
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
            Contar um Testemunho
          </Button>
        </div>

        {/* Lista de testemunhos */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="flex items-center justify-center gap-3 text-orange-600">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                Carregando testemunhos...
              </div>
            </div>
          ) : testimonies.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhum testemunho ainda</h3>
                <p className="text-gray-500 mb-4">Seja o primeiro a compartilhar uma experiência com a comunidade</p>
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Contar Primeiro Testemunho
                </Button>
              </CardContent>
            </Card>
          ) : (
            testimonies.map((testimony) => (
              <Card key={testimony.id} className="shadow-lg border-0">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10 overflow-hidden">
                      <AvatarImage 
                        src={!testimony.is_anonymous ? testimony.profiles.avatar_url : ""} 
                        className="object-cover object-center"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm">
                        {testimony.is_anonymous ? "A" : testimony.profiles.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{testimony.title}</CardTitle>
                      <CardDescription>
                        Testemunho de {testimony.is_anonymous ? "Anônimo" : testimony.profiles.name} em {new Date(testimony.created_at).toLocaleDateString('pt-BR')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {testimony.media_type === 'image' && testimony.media_url && (
                    <img 
                      src={getPublicUrl(testimony.media_url)} 
                      alt={testimony.title} 
                      className="rounded-md mb-4 max-h-96 w-auto mx-auto shadow-lg" 
                    />
                  )}
                  {testimony.media_type === 'video' && testimony.media_url && (
                    <video 
                      src={getPublicUrl(testimony.media_url)} 
                      controls 
                      className="rounded-md mb-4 w-full shadow-lg" 
                    />
                  )}
                  <p className="whitespace-pre-wrap text-gray-700">{testimony.content}</p>
                </CardContent>
                <CardFooter className="flex-col items-start">
                   <h4 className="text-sm font-semibold mb-2 text-gray-700">Comentários:</h4>
                   <div className="w-full space-y-2 mb-4">
                    {testimony.testimony_responses.map(response => (
                      <div key={response.id} className="text-sm bg-orange-50 border border-orange-200 p-3 rounded-lg">
                        <span className="font-semibold text-orange-700">{response.profiles.name}: </span>
                        <span className="text-gray-700">{response.content}</span>
                      </div>
                    ))}
                  </div>
                   <div className="w-full flex space-x-2">
                    <Input
                      placeholder="Escreva um comentário..."
                      value={responseContent[testimony.id] || ""}
                      onChange={(e) => setResponseContent(prev => ({...prev, [testimony.id]: e.target.value}))}
                      className="flex-1 border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl"
                     />
                    <Button 
                      onClick={() => handleResponseSubmit(testimony.id)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6"
                    >
                      Comentar
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
          title="Contar um Testemunho"
        >
          <CreateTestimony onTestimonyCreated={handleTestimonyCreated} />
        </Modal>
      </div>
    </div>
  );
};

export default Testimonies;