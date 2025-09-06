import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, TrendingDown, Phone, Users2 } from "lucide-react";

type Profile = Database['public']['Tables']['profiles']['Row'];

interface UserAttendance {
  user: Profile;
  attendanceRate: number;
  totalEvents: number;
  presentEvents: number;
  lastAttendance: string | null;
}

export const AttendanceDashboard = () => {
  const [userAttendance, setUserAttendance] = useState<UserAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      // Buscar todos os usuários
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (usersError) throw usersError;

      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const attendanceData: UserAttendance[] = [];

      for (const user of users || []) {
        // Buscar frequência dos últimos 60 dias
        const { data: attendance, error: attendanceError } = await supabase
          .from('attendance')
          .select('*')
          .eq('user_id', user.user_id)
          .gte('event_date', sixtyDaysAgo.toISOString().split('T')[0]);

        if (attendanceError) {
          console.error('Erro ao buscar frequência:', attendanceError);
          continue;
        }

        const totalEvents = attendance?.length || 0;
        const presentEvents = attendance?.filter(a => a.present).length || 0;
        const attendanceRate = totalEvents > 0 ? (presentEvents / totalEvents) * 100 : 0;
        
        const lastAttendanceRecord = attendance?.find(a => a.present);
        const lastAttendance = lastAttendanceRecord ? lastAttendanceRecord.event_date : null;

        attendanceData.push({
          user,
          attendanceRate,
          totalEvents,
          presentEvents,
          lastAttendance
        });
      }

      // Ordenar por menor frequência
      attendanceData.sort((a, b) => a.attendanceRate - b.attendanceRate);
      setUserAttendance(attendanceData);
      
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppMessage = (user: Profile) => {
    if (!user.phone) {
      toast({
        title: "Número não cadastrado",
        description: `${user.name} não possui número de telefone cadastrado.`,
        variant: "destructive"
      });
      return;
    }

    const cleanPhone = user.phone.replace(/\D/g, '');
    
    const message = encodeURIComponent(
      `Olá ${user.name}! \n\nEsperamos você na próxima reunião da célula! Sentimos sua falta. \n\nConte conosco para qualquer coisa!`
    );
    
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const getAttendanceStatus = (rate: number) => {
    if (rate >= 80) return { text: "Excelente", color: "bg-green-500" };
    if (rate >= 60) return { text: "Bom", color: "bg-yellow-500" };
    if (rate >= 40) return { text: "Regular", color: "bg-orange-500" };
    return { text: "Baixa", color: "bg-red-500" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados de frequência...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <TrendingDown className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Frequência</h2>
          <p className="text-muted-foreground">
            Acompanhe a participação dos membros nos últimos 60 dias
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {userAttendance.map((userAtt) => {
          const status = getAttendanceStatus(userAtt.attendanceRate);
          const needsAttention = userAtt.attendanceRate < 60;
          
          return (
            <Card key={userAtt.user.id} className="shadow-medium">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                      <AvatarImage src={userAtt.user.avatar_url || ''} />
                      <AvatarFallback>
                        {userAtt.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{userAtt.user.name}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>
                            {userAtt.user.role === 'leader' ? 'Líder' : 
                             userAtt.user.role === 'leader_trainee' ? 'Líder em Treinamento' : 'Membro'}
                          </span>
                        </div>
                        {userAtt.user.phone && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="truncate">{userAtt.user.phone}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-center sm:text-right">
                      <div className="flex items-center justify-center sm:justify-end gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                        <Badge variant="outline">{status.text}</Badge>
                      </div>
                      <p className="text-xl sm:text-2xl font-bold">{userAtt.attendanceRate.toFixed(0)}%</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {userAtt.presentEvents} de {userAtt.totalEvents} reuniões
                      </p>
                      {userAtt.lastAttendance && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Última: {new Date(userAtt.lastAttendance).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {userAttendance.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum dado encontrado</h3>
            <p className="text-muted-foreground">
              Ainda não há dados de frequência registrados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
