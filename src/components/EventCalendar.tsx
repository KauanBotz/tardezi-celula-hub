import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Clock, Users, Edit } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { EventEditModal } from "@/components/EventEditModal";

type Event = Database['public']['Tables']['events']['Row'];

// Custom Day Component com tema laranja
function CustomDay({ date, displayMonth, events, profile, onEditEvent }: { date: Date; displayMonth: Date; events: Event[]; profile: any; onEditEvent: (event: Event) => void }) {
    const eventsForDay = events.filter(event => 
        new Date(event.event_date).toDateString() === date.toDateString()
    );

    const isToday = new Date().toDateString() === date.toDateString();
    const hasEvents = eventsForDay.length > 0;

    if (hasEvents) {
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <div
                        className={cn(
                            "h-9 w-9 relative flex items-center justify-center cursor-pointer rounded-lg transition-all duration-200",
                            "hover:scale-105 hover:shadow-lg",
                            isToday 
                                ? "bg-gradient-to-br from-orange-600 to-red-600 text-white font-bold shadow-lg ring-2 ring-orange-300" 
                                : "bg-gradient-to-br from-orange-500 to-orange-600 text-white font-semibold shadow-md"
                        )}
                    >
                        <span className="relative z-10">{date.getDate()}</span>
                        {eventsForDay.length > 1 && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-bold">{eventsForDay.length}</span>
                            </div>
                        )}
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 border-0 shadow-2xl" align="start">
                    <div className="bg-white rounded-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 text-white">
                            <h3 className="font-bold text-sm">
                                {date.toLocaleDateString('pt-BR', { 
                                    weekday: 'long', 
                                    day: 'numeric', 
                                    month: 'long' 
                                })}
                            </h3>
                            <Badge className="mt-1 bg-white/20 text-white hover:bg-white/30">
                                {eventsForDay.length} evento{eventsForDay.length > 1 ? 's' : ''}
                            </Badge>
                        </div>
                        <div className="p-3 space-y-3 max-h-64 overflow-y-auto">
                            {eventsForDay.map((event) => {
                                const eventTime = new Date(event.event_date);
                                const isPastEvent = eventTime < new Date();
                                
                                return (
                                    <div 
                                        key={event.id} 
                                        className={cn(
                                            "p-3 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md",
                                            isPastEvent 
                                                ? "bg-gray-100 border-gray-400 opacity-75" 
                                                : "bg-orange-50 border-orange-400 hover:border-orange-600"
                                        )}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className={cn(
                                                    "font-semibold text-sm mb-1",
                                                    isPastEvent ? "text-gray-600" : "text-gray-900"
                                                )}>
                                                    {event.title}
                                                </h4>
                                                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                                                    <Clock className="w-3 h-3" />
                                                    <span>
                                                        {eventTime.toLocaleTimeString('pt-BR', { 
                                                            hour: '2-digit', 
                                                            minute: '2-digit' 
                                                        })}
                                                    </span>
                                                </div>
                                                 {event.description && (
                                                     <p className="text-xs text-gray-600 line-clamp-2">
                                                         {event.description}
                                                     </p>
                                                 )}
                                             </div>
                                             <div className="flex flex-col gap-1">
                                                 {isPastEvent && (
                                                     <Badge variant="secondary" className="text-xs">
                                                         Finalizado
                                                     </Badge>
                                                 )}
                                                  {profile?.role === 'leader' && (
                                                      <Button
                                                          size="sm"
                                                          variant="outline"
                                                          onClick={(e) => {
                                                              e.stopPropagation();
                                                              onEditEvent(event);
                                                          }}
                                                          className="h-6 px-2 text-xs"
                                                      >
                                                          <Edit className="w-3 h-3 mr-1" />
                                                          Editar
                                                      </Button>
                                                  )}
                                             </div>
                                         </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        );
    }

    // Dia normal sem evento
    return (
        <div className={cn(
            "h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-lg transition-all duration-150",
            isToday 
                ? "bg-orange-100 text-orange-800 font-bold ring-2 ring-orange-300" 
                : "hover:bg-orange-50 text-gray-700 hover:scale-105"
        )}>
            {date.getDate()}
        </div>
    );
}

export const EventCalendar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { profile } = useAuth();
  const { toast } = useToast();

  const isLeader = profile?.role === 'leader' || profile?.role === 'leader_trainee';

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });
    
    if (error) {
      toast({ title: "Erro ao buscar eventos", description: error.message, variant: "destructive" });
    } else {
      setEvents(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const eventDays = events.map(event => new Date(event.event_date));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.event_date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= today;
  }).slice(0, 3);

  const handleEventCreated = () => {
    fetchEvents();
    setIsModalOpen(false);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  const handleEventUpdated = () => {
    fetchEvents();
    setIsEditModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <Card className="shadow-medium col-span-1 md:col-span-3">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold">📅 Agenda da Célula</CardTitle>
            <CardDescription className="text-orange-100 mt-1">
              Click nos dias destacados para ver detalhes dos eventos
            </CardDescription>
          </div>
          {isLeader && (
            <Button 
              onClick={() => setIsModalOpen(true)}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Evento
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Calendar
              mode="multiple"
              selected={eventDays}
              className="rounded-lg bg-white p-2 sm:p-3 w-full border"
              classNames={{
                months: "space-y-4",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center text-base sm:text-lg font-semibold text-gray-800",
                caption_label: "text-base sm:text-lg font-bold",
                nav: "space-x-1 flex items-center",
                nav_button: "h-6 w-6 sm:h-8 sm:w-8 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-full hover:bg-orange-100",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-gray-500 rounded-md w-8 sm:w-9 font-medium text-[0.7rem] sm:text-[0.8rem] text-center",
                row: "flex w-full mt-1 sm:mt-2",
                cell: "text-center text-sm relative p-0 focus-within:relative focus-within:z-20",
                day: "h-8 w-8 sm:h-9 sm:w-9 p-0 font-normal aria-selected:opacity-100 rounded-lg",
                day_outside: "text-gray-300 opacity-50",
                day_disabled: "text-gray-300 opacity-50",
                day_hidden: "invisible",
              }}
              components={{
                Day: (props) => <CustomDay date={props.date} displayMonth={props.displayMonth} events={events} profile={profile} onEditEvent={handleEditEvent} />
              }}
            />
          </div>
          
          {/* Sidebar Próximos Eventos */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-3 sm:p-4 rounded-lg border border-orange-200">
              <h3 className="font-bold text-orange-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
                <Users className="w-4 h-4" />
                Próximos Eventos
              </h3>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                   {upcomingEvents.map(event => {
                     const eventDate = new Date(event.event_date);
                     const today = new Date();
                     today.setHours(0, 0, 0, 0);
                     const eventDateOnly = new Date(event.event_date);
                     eventDateOnly.setHours(0, 0, 0, 0);
                     const daysUntil = Math.ceil((eventDateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                     
                     return (
                       <div key={event.id} className="bg-white p-3 rounded-lg border border-orange-100 hover:shadow-md transition-shadow">
                         <h4 className="font-semibold text-gray-800 text-sm mb-1">{event.title}</h4>
                         <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                           <Clock className="w-3 h-3" />
                           <span>
                             {eventDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} às{' '}
                             {eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                           </span>
                         </div>
                         <Badge 
                           variant={daysUntil === 0 ? "default" : daysUntil <= 3 ? "destructive" : "secondary"}
                           className="text-xs"
                         >
                           {daysUntil === 0 ? "Hoje" : daysUntil === 1 ? "Amanhã" : `Em ${daysUntil} dias`}
                         </Badge>
                       </div>
                     );
                   })}
                </div>
              ) : (
                <p className="text-orange-600 text-sm">Nenhum evento próximo 📅</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Modal de Criar Evento */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="🎉 Criar Novo Evento"
      >
        <CreateEventForm onEventCreated={handleEventCreated} />
      </Modal>

      {/* Modal de Editar Evento */}
      <EventEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        event={selectedEvent}
        onEventUpdated={handleEventUpdated}
      />
    </Card>
  );
};

// Form de criação melhorado
const CreateEventForm = ({ onEventCreated }: { onEventCreated: () => void }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        const { error } = await supabase.from('events').insert({
            title,
            description,
            event_date: new Date(eventDate).toISOString(),
            created_by: user.id
        });

        if (error) {
            toast({ title: "Erro ao criar evento", description: error.message, variant: "destructive" });
        } else {
            toast({ 
                title: "Evento criado com sucesso! 🎉", 
                description: "O evento foi adicionado ao calendário da célula" 
            });
            onEventCreated();
            setTitle('');
            setDescription('');
            setEventDate('');
        }
        setLoading(false);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="event-title" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Título do Evento
                </Label>
                <Input 
                    id="event-title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="Ex: Reunião de Oração"
                    className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 px-4 text-base transition-all duration-200"
                    required 
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="event-date" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Data e Hora
                </Label>
                <Input 
                    id="event-date" 
                    type="datetime-local" 
                    value={eventDate} 
                    onChange={(e) => setEventDate(e.target.value)}
                    className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 px-4 text-base transition-all duration-200"
                    required 
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="event-description" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Descrição (opcional)
                </Label>
                <Textarea 
                    id="event-description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Adicione detalhes sobre o evento..."
                    className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl p-4 text-base resize-none transition-all duration-200 min-h-[80px]"
                />
            </div>
            <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:transform-none" 
                disabled={loading}
            >
                {loading ? (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Criando...
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <span>🎉</span>
                        Criar Evento
                    </div>
                )}
            </Button>
        </form>
    )
}