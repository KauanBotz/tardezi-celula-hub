import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Users, CheckSquare, Sparkles } from "lucide-react";
import { UserManagement } from "@/components/UserManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceManagement } from "@/components/AttendanceManagement";

const AdminDashboard = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-700 font-medium">Carregando painel...</p>
        </div>
      </div>
    );
  }

  const isLeader = profile?.role === "leader" || profile?.role === "leader_trainee";

  if (!isLeader) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Moderno */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Painel Administrativo <Sparkles className="w-6 h-6" />
              </h1>
              <p className="text-orange-100 text-sm mt-1">
                Gerencie usuários e controle de frequência da comunidade
              </p>
            </div>

            <Button asChild variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white rounded-xl px-4 py-2">
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar ao Dashboard</span>
                <span className="sm:hidden">Voltar</span>
              </Link>
            </Button>
          </div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Tabs Modernas */}
        <Tabs defaultValue="users" className="w-full">
  <TabsList className="flex justify-center bg-white p-1 rounded-2xl shadow-md w-full max-w-lg mx-auto mb-8">
    <TabsTrigger
      value="users"
      className="flex items-center gap-2 w-full justify-center rounded-xl px-4 py-2 text-sm font-medium transition-all data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500"
    >
      <Users className="w-4 h-4" />
      Usuários
    </TabsTrigger>
    <TabsTrigger
      value="attendance"
      className="flex items-center gap-2 w-full justify-center rounded-xl px-4 py-2 text-sm font-medium transition-all data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500"
    >
      <CheckSquare className="w-4 h-4" />
      Frequência
    </TabsTrigger>
  </TabsList>


          <TabsContent value="users" className="mt-0">
            <div className="bg-white rounded-2xl shadow-lg border p-6">
              <UserManagement />
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="mt-0">
            <div className="bg-white rounded-2xl shadow-lg border p-6">
              <AttendanceManagement />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
