import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { KeyRound, Save, Shield } from "lucide-react";

export const AccountSettings = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handlePasswordUpdate = async () => {
        if(password.length < 6) {
            toast({ title: "Senha muito curta", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
            return;
        }
        if (password !== confirmPassword) {
            toast({ title: "Senhas não coincidem", variant: "destructive" });
            return;
        }
        setLoading(true);

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            toast({ title: "Erro ao atualizar senha", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Senha atualizada com sucesso! ✨" });
            setPassword('');
            setConfirmPassword('');
        }
        setLoading(false);
    };

    return (
        <Card className="backdrop-blur-sm bg-white/95 border-0 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white pb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold">Segurança da Conta</CardTitle>
                        <CardDescription className="text-orange-100">
                            Altere sua senha de acesso para manter sua conta segura
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                Nova Senha
                            </Label>
                            <Input 
                                id="new-password" 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Digite sua nova senha"
                                className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 px-4 text-base transition-all duration-200"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                Confirmar Nova Senha
                            </Label>
                            <Input 
                                id="confirm-password" 
                                type="password" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirme sua nova senha"
                                className="border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 px-4 text-base transition-all duration-200"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-blue-800">Dicas de Segurança</h4>
                                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                                    <li>• Use pelo menos 6 caracteres</li>
                                    <li>• Combine letras, números e símbolos</li>
                                    <li>• Evite informações pessoais óbvias</li>
                                    <li>• Não compartilhe sua senha com ninguém</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <Button 
                        onClick={handlePasswordUpdate} 
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white h-12 rounded-xl"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Atualizando...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Save className="w-4 h-4" />
                                Atualizar Senha
                            </div>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};