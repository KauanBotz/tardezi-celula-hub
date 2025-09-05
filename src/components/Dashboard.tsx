import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Link } from "react-router-dom";
import { 
  Users,
  Heart,
  BookOpen,
  BarChart3,
  Bell,
  Settings,
  Sun,
  LogOut,
  MessageSquare,
  Shield,
  Calendar as CalendarIcon
} from "lucide-react";
import { EventCalendar } from "./EventCalendar"; // Apenas este componente de calendário é necessário

type Profile = Database['public']['Tables']['profiles']['Row'];
type Event = Database['public']['Tables']['events']['Row']; // Precisamos deste tipo de volta

export const Dashboard = () => {
  const { profile, signOut, loading } = useAuth();
  const [leaders, setLeaders] = useState<Profile[]>([]);
  const [events, setEvents] = useState<Event[]>([]); // O estado dos eventos volta para cá
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, total: 0 });
  const isLeader = profile?.role === 'leader' || profile?.role === 'leader_trainee';

  useEffect(() => {
    if (profile) {
      loadLeaders();
      loadEvents(); // A função de carregar eventos volta para cá
      loadAttendanceStats();
    }
  }, [profile]);

  const loadLeaders = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['leader', 'leader_trainee'])
      .order('role', { ascending: false });
    
    if (data) setLeaders(data);
  };
  
  // A função para carregar os próximos eventos para o card do topo
  const loadEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(5);
    
    if (data) setEvents(data);
  };

  const loadAttendanceStats = async () => {
    if (!profile) return;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', profile.user_id)
      .gte('event_date', thirtyDaysAgo.toISOString().split('T')[0]);
    
    if (data) {
      const present = data.filter(a => a.present).length;
      setAttendanceStats({ present, total: data.length });
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <Sun className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="font-bold text-lg text-primary">TARDEZINHA</h1>
                <p className="text-sm text-muted-foreground">Bem-vindo, {profile.name}!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isLeader && (
                <Button asChild variant="ghost" size="icon">
                  <Link to="/admin" title="Painel do Líder">
                    <Shield className="w-5 h-5" />
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="icon">
                <Link to="/settings" title="Configurações">
                <Settings className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Frequência Pessoal */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Minha Frequência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Últimos 30 dias</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {attendanceStats.total > 0 ? Math.round((attendanceStats.present / attendanceStats.total) * 100) : 0}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Presença</span>
                    <Badge variant="secondary">{attendanceStats.present} de {attendanceStats.total} reuniões</Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-orange h-2 rounded-full" 
                      style={{ 
                        width: attendanceStats.total > 0 
                          ? `${(attendanceStats.present / attendanceStats.total) * 100}%` 
                          : '0%' 
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Líderes da Célula */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Líderes da Célula
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaders.length > 0 ? leaders.map((leader) => (
                    <div key={leader.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                      <Avatar className="w-12 h-12 overflow-hidden">
                        {leader.avatar_url && (
                          <AvatarImage 
                            src={leader.avatar_url} 
                            className="object-cover object-center"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        )}
                        <AvatarFallback className={leader.role === 'leader' ? 'bg-gradient-orange text-white' : 'bg-primary text-white'}>
                          {leader.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">{leader.name}</h4>
                        <p className="text-sm text-muted-foreground">{leader.age} anos</p>
                        <Badge 
                          variant={leader.role === 'leader' ? 'outline' : 'secondary'} 
                          className="text-xs mt-1"
                        >
                          {leader.role === 'leader' ? 'Líder Principal' : 'Líder em Treinamento'}
                        </Badge>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum líder cadastrado ainda
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Próximos Eventos (Card original de volta) */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  Próximos Eventos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events.length > 0 ? events.map((event) => {
                    const eventDate = new Date(event.event_date);
                    const now = new Date();
                    const diffTime = eventDate.getTime() - now.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    let timeLabel = '';
                    if (diffDays === 0) timeLabel = 'Hoje';
                    else if (diffDays === 1) timeLabel = 'Amanhã';
                    else if (diffDays > 1) timeLabel = `Em ${diffDays} dias`;
                    else timeLabel = 'Passado';
                    
                    return (
                      <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {eventDate.toLocaleDateString('pt-BR')} às {eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <Badge variant={diffDays <= 1 ? 'outline' : 'secondary'}>{timeLabel}</Badge>
                      </div>
                    );
                  }) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum evento agendado
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Menu de Acesso Rápido */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Acesso Rápido</CardTitle>
              <CardDescription>
                Navegue pelas principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Link to="/pedidos-de-oracao">
                    <Heart className="w-6 h-6 text-primary" />
                    <span className="text-sm font-medium">Pedidos de Oração</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Link to="/testemunhos">
                    <MessageSquare className="w-6 h-6 text-primary" />
                    <span className="text-sm font-medium">Testemunhos</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Link to="/palavra-do-dia">
                    <BookOpen className="w-6 h-6 text-primary" />
                    <span className="text-sm font-medium">Palavra do Dia</span>
                  </Link>
                </Button>

                {isLeader && (
                  <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                    <Link to="/frequencia">
                      <BarChart3 className="w-6 h-6 text-primary" />
                      <span className="text-sm font-medium">Dashboard</span>
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Agenda da Célula (Calendário interativo) */}
          <EventCalendar />

        </div>
      </div>
    </div>
  );
};