import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, TrendingDown } from "lucide-react";
import { AttendanceDashboard } from "@/components/AttendanceDashboard";

const AttendanceDashboardPage = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-muted-foreground font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  const isLeader = profile?.role === "leader" || profile?.role === "leader_trainee";

  if (!isLeader) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-white shadow-lg mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Dashboard de Frequência</h1>
                <p className="text-primary-foreground/80 text-sm">
                  Monitore a participação dos membros da célula
                </p>
              </div>
            </div>

            <Button asChild variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white">
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Link>
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="bg-white rounded-2xl shadow-lg border p-6">
          <AttendanceDashboard />
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboardPage;