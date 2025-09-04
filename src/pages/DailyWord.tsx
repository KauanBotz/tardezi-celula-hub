import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Plus, Edit3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { CreateDailyWord } from "@/components/CreateDailyWord";
import { EditDailyWord } from "@/components/EditDailyWord";
import { Modal } from "@/components/ui/modal";

type DailyWord = Database['public']['Tables']['daily_word']['Row'] & {
  profiles: { name: string; avatar_url: string | null; } | null;
};

const DailyWord = () => {
  const [dailyWords, setDailyWords] = useState<DailyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<DailyWord | null>(null);
  const { user } = useAuth();

  const fetchDailyWords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("daily_word")
      .select(`
        *,
        profiles!daily_word_created_by_fkey (
          name,
          avatar_url
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar a Palavra do Dia:", error);
    } else {
      console.log("Daily words data:", data); // Debug pra ver se tá pegando os nomes
      setDailyWords(data as DailyWord[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDailyWords();
  }, []);

  const latestWord = dailyWords?.[0];
  const historyWords = dailyWords?.slice(1);
  const isLeader = user && (user.user_metadata?.role === 'leader' || user.user_metadata?.role === 'leader_trainee');

  const handleDailyWordCreated = () => {
    fetchDailyWords();
    setIsCreateModalOpen(false);
  };

  const handleEditWord = (word: DailyWord) => {
    setEditingWord(word);
    setIsEditModalOpen(true);
  };

  const handleDailyWordUpdated = () => {
    fetchDailyWords();
    setIsEditModalOpen(false);
    setEditingWord(null);
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditingWord(null);
  };

  // Função para renderizar HTML simples
  const renderHtmlContent = (content: string) => {
    return (
      <div 
        className="whitespace-pre-wrap text-gray-700 text-lg leading-relaxed"
        dangerouslySetInnerHTML={{ 
          __html: content
            .replace(/\n/g, '<br>')
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts por segurança
        }} 
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-orange-600">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 mb-8 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Palavra do Dia</h1>
              <p className="text-orange-100 text-lg mt-1">Reflexões e mensagens para inspirar sua jornada</p>
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

        {/* Botão para criar palavra do dia (apenas para líderes) */}
        {isLeader && (
          <div className="mb-6">
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl shadow-lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nova Palavra do Dia
            </Button>
          </div>
        )}

        {/* Conteúdo principal */}
        {latestWord ? (
          <>
            <Card className="mb-6 shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-xl">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{latestWord.title}</CardTitle>
                  {isLeader && user?.id === latestWord.created_by && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditWord(latestWord)}
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:border-white/50"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  )}
                </div>
                <div className="flex items-center space-x-3 text-sm text-orange-100 pt-2">
                  <Avatar className="h-6 w-6 overflow-hidden">
                    <AvatarImage 
                      src={latestWord.profiles?.avatar_url || ''} 
                      className="object-cover object-center"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <AvatarFallback className="bg-white/20 text-white text-xs">
                      {latestWord.profiles?.name ? latestWord.profiles.name.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span>{latestWord.profiles?.name || 'Usuário Anônimo'}</span>
                  <span>-</span>
                  <span>{new Date(latestWord.created_at).toLocaleString('pt-BR')}</span>
                  {latestWord.created_at !== latestWord.updated_at && (
                    <span className="italic text-xs">(editado)</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {renderHtmlContent(latestWord.content)}
              </CardContent>
            </Card>
            
            {historyWords.length > 0 && (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Histórico de Palavras</h2>
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {historyWords.map(word => (
                     <AccordionItem value={word.id} key={word.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-md">
                        <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-3">
                                <BookOpen className="w-5 h-5 text-orange-600" />
                                <span className="font-semibold text-gray-800">{word.title}</span>
                                <span className="text-sm text-gray-500">- {new Date(word.created_at).toLocaleDateString('pt-BR')}</span>
                              </div>
                              {isLeader && user?.id === word.created_by && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditWord(word);
                                  }}
                                  className="mr-4 border-orange-300 text-orange-600 hover:bg-orange-50"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4">
                            <div className="space-y-4">
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Avatar className="h-5 w-5 overflow-hidden">
                                  <AvatarImage 
                                    src={word.profiles?.avatar_url || ''} 
                                    className="object-cover object-center"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                  <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                                    {word.profiles?.name ? word.profiles.name.charAt(0).toUpperCase() : 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <span>Postado por {word.profiles?.name || 'Usuário Anônimo'}</span>
                              </div>
                              <div className="text-gray-700 leading-relaxed">
                                {renderHtmlContent(word.content)}
                              </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </>
            )}
          </>
        ) : (
          <Card className="text-center py-16 shadow-lg border-0">
            <CardContent>
              <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-3">Nenhuma Palavra do Dia ainda</h3>
              <p className="text-gray-500 mb-6 text-lg">Aguardando a primeira mensagem inspiradora da comunidade</p>
              {isLeader && (
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 text-lg"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Criar Primeira Palavra
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Modal de criação */}
        <Modal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)}
          title="Nova Palavra do Dia"
        >
          <CreateDailyWord onDailyWordCreated={handleDailyWordCreated} />
        </Modal>

        {/* Modal de edição */}
        <Modal 
          isOpen={isEditModalOpen} 
          onClose={handleCancelEdit}
          title="Editar Palavra do Dia"
        >
          {editingWord && (
            <EditDailyWord 
              dailyWord={editingWord}
              onDailyWordUpdated={handleDailyWordUpdated} 
              onCancel={handleCancelEdit}
            />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default DailyWord;