import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type Event = Database['public']['Tables']['events']['Row'];

interface EventEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onEventUpdated: () => void;
}

export const EventEditModal = ({ isOpen, onClose, event, onEventUpdated }: EventEditModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      // Converter para formato datetime-local
      const date = new Date(event.event_date);
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      setEventDate(localDate.toISOString().slice(0, 16));
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    
    setLoading(true);

    const { error } = await supabase
      .from('events')
      .update({
        title,
        description,
        event_date: new Date(eventDate).toISOString()
      })
      .eq('id', event.id);

    if (error) {
      toast({
        title: "Erro ao atualizar evento",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Evento atualizado! ✅",
        description: "As alterações foram salvas com sucesso"
      });
      onEventUpdated();
      onClose();
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!event) return;
    
    setDeleteLoading(true);

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', event.id);

    if (error) {
      toast({
        title: "Erro ao excluir evento",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Evento excluído! 🗑️",
        description: "O evento foi removido do calendário"
      });
      onEventUpdated();
      onClose();
    }
    setDeleteLoading(false);
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setEventDate('');
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title="✏️ Editar Evento"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="edit-title" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Título do Evento
          </Label>
          <Input 
            id="edit-title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Ex: Reunião de Oração"
            className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 px-4 text-base transition-all duration-200"
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="edit-date" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Data e Hora
          </Label>
          <Input 
            id="edit-date" 
            type="datetime-local" 
            value={eventDate} 
            onChange={(e) => setEventDate(e.target.value)}
            className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 px-4 text-base transition-all duration-200"
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="edit-description" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Descrição (opcional)
          </Label>
          <Textarea 
            id="edit-description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Adicione detalhes sobre o evento..."
            className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl p-4 text-base resize-none transition-all duration-200 min-h-[80px]"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button 
            type="submit" 
            className="flex-1 h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:transform-none" 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Salvando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>✅</span>
                Salvar Alterações
              </div>
            )}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                type="button"
                variant="outline"
                className="h-12 px-4 border-2 border-red-200 hover:border-red-500 hover:bg-red-50 text-red-600 font-semibold rounded-xl transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir evento?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. O evento "{event?.title}" será removido permanentemente do calendário.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Excluindo..." : "Excluir"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </form>
    </Modal>
  );
};