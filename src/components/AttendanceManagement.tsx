import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";

type Profile = Database['public']['Tables']['profiles']['Row'];
type Attendance = Database['public']['Tables']['attendance']['Row'];

export const AttendanceManagement = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [attendance, setAttendance] = useState<Map<string, boolean>>(new Map());
  const { toast } = useToast();
  const { profile } = useAuth();

  const fetchUsersAndAttendance = async (date: Date) => {
    setLoading(true);
    const dateString = format(date, "yyyy-MM-dd");

    // Buscar todos os usuários
    const { data: usersData, error: usersError } = await supabase.from("profiles").select("*");
    if (usersError) {
      toast({ title: "Erro ao buscar usuários", description: usersError.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    setUsers(usersData || []);

    // Buscar frequência para a data selecionada
    const { data: attendanceData, error: attendanceError } = await supabase
      .from("attendance")
      .select("*")
      .eq("event_date", dateString);
    
    if (attendanceError) {
      toast({ title: "Erro ao buscar frequência", description: attendanceError.message, variant: "destructive" });
    } else {
      const newAttendance = new Map<string, boolean>();
      usersData?.forEach(user => {
        const attendanceRecord = attendanceData?.find(a => a.user_id === user.user_id);
        newAttendance.set(user.user_id, attendanceRecord ? attendanceRecord.present : false);
      });
      setAttendance(newAttendance);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedDate) {
      fetchUsersAndAttendance(selectedDate);
    }
  }, [selectedDate]);

  const handleAttendanceChange = (userId: string, isPresent: boolean) => {
    const newAttendance = new Map(attendance);
    newAttendance.set(userId, isPresent);
    setAttendance(newAttendance);
  };
  
  const handleSaveAttendance = async () => {
    if (!selectedDate || !profile) return;
    setLoading(true);
  
    const dateString = format(selectedDate, "yyyy-MM-dd");
  
    const recordsToUpsert = Array.from(attendance.entries()).map(([user_id, present]) => ({
      user_id,
      event_date: dateString,
      present,
      recorded_by: profile.user_id,
    }));
  
    const { error } = await supabase.from("attendance").upsert(recordsToUpsert, {
      onConflict: 'user_id, event_date'
    });
  
    if (error) {
      toast({ title: "Erro ao salvar frequência", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Frequência salva com sucesso!" });
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Frequência</CardTitle>
        <div className="pt-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <p>Carregando usuários...</p>
          ) : (
            users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                <label htmlFor={`attendance-${user.id}`} className="font-medium">
                  {user.name}
                </label>
                <Checkbox
                  id={`attendance-${user.id}`}
                  checked={attendance.get(user.user_id) || false}
                  onCheckedChange={(checked) => handleAttendanceChange(user.user_id, !!checked)}
                />
              </div>
            ))
          )}
        </div>
        <Button onClick={handleSaveAttendance} className="w-full mt-6" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Frequência"}
        </Button>
      </CardContent>
    </Card>
  );
};