import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, User, KeyRound, Settings as SettingsIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/ProfileSettings";
import { AccountSettings } from "@/components/AccountSettings";

const Settings = () => {
  const { user, loading } = useAuth();

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

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 mb-8 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <SettingsIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Configurações</h1>
              <p className="text-orange-100 text-lg mt-1">Gerencie sua conta e perfil</p>
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

        {/* Tabs com design moderno */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border border-orange-200 rounded-xl p-1 shadow-lg">
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
            >
              <User className="mr-2 h-4 w-4" /> 
              Perfil
            </TabsTrigger>
            <TabsTrigger 
              value="account"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200"
            >
              <KeyRound className="mr-2 h-4 w-4" /> 
              Conta
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="profile" className="mt-0">
              <ProfileSettings />
            </TabsContent>
            <TabsContent value="account" className="mt-0">
              <AccountSettings />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;