import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  Heart, 
  BookOpen, 
  MessageSquare, 
  TrendingUp,
  Crown,
  GraduationCap,
  User
} from "lucide-react";

// Mock data - will be replaced with real data from Supabase
const mockUserStats = {
  attendance: 85,
  monthlyGoal: 90,
  totalMeetings: 12,
  missedMeetings: 2
};

const mockLeaders = [
  {
    id: 1,
    name: "Pastor João Silva",
    age: 45,
    role: "Líder",
    photo: "/placeholder-avatar.jpg"
  },
  {
    id: 2,
    name: "Ana Costa",
    age: 32,
    role: "Líder em Treinamento",
    photo: "/placeholder-avatar.jpg"
  }
];

const mockEvents = [
  {
    id: 1,
    title: "Reunião de Célula",
    date: "2024-01-15",
    time: "19:30",
    type: "cell"
  },
  {
    id: 2,
    title: "Culto Domingo",
    date: "2024-01-16",
    time: "18:00",
    type: "church"
  },
  {
    id: 3,
    title: "Estudo Bíblico",
    date: "2024-01-18",
    time: "20:00",
    type: "study"
  }
];

export const Dashboard = () => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Líder":
        return <Crown className="w-4 h-4 text-primary" />;
      case "Líder em Treinamento":
        return <GraduationCap className="w-4 h-4 text-warning" />;
      default:
        return <User className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Olá, Maria! 👋
            </h1>
            <p className="text-muted-foreground">
              Bem-vinda ao seu painel da célula
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="hidden md:flex">
              Membro Ativo
            </Badge>
          </div>
        </div>

        {/* KPIs de Frequência */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Frequência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-2xl font-bold text-success">
                  {mockUserStats.attendance}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Meta Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-2xl font-bold text-foreground">
                  {mockUserStats.monthlyGoal}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Reuniões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-2xl font-bold text-foreground">
                  {mockUserStats.totalMeetings}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Faltas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-destructive" />
                <span className="text-2xl font-bold text-destructive">
                  {mockUserStats.missedMeetings}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Liderança */}
          <Card className="lg:col-span-1 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                Nossa Liderança
              </CardTitle>
              <CardDescription>
                Conheça os líderes da sua célula
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockLeaders.map((leader) => (
                <div key={leader.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="w-12 h-12 rounded-full bg-gradient-orange flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{leader.name}</h4>
                      {getRoleIcon(leader.role)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {leader.age} anos • {leader.role}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Agenda */}
          <Card className="lg:col-span-2 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Próximos Eventos
              </CardTitle>
              <CardDescription>
                Agenda da igreja e da célula
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div>
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.date).toLocaleDateString('pt-BR')} às {event.time}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {event.type === 'cell' ? 'Célula' : 
                       event.type === 'church' ? 'Igreja' : 'Estudo'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Menu de Acesso Rápido */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
            <CardDescription>
              Navegue pelas principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Heart className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium">Pedidos de Oração</span>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <MessageSquare className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium">Testemunhos</span>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium">Palavra do Dia</span>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Calendar className="w-6 h-6 text-primary" />
                <span className="text-sm font-medium">Agenda</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};