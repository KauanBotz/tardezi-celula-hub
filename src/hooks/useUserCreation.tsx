import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUserCreation = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createUser = async (userData: {
    name: string;
    email: string;
    password: string;
    address?: string;
    age?: string;
    phone?: string;
    role: 'user' | 'leader_trainee' | 'leader';
  }) => {
    setLoading(true);

    try {
      // Salvar a sessão atual
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      // Preparar dados para o signUp
      const signUpData = {
        name: userData.name,
        address: userData.address,
        age: userData.age && userData.age.trim() !== '' ? parseInt(userData.age) : undefined,
        phone: userData.phone,
        role: userData.role
      };
      
      console.log('Dados para signUp:', signUpData);
      console.log('Idade original:', userData.age);
      console.log('Idade processada:', signUpData.age);
      
      // Criar o novo usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: signUpData
        }
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Aguardar o trigger executar
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verificar se o perfil foi criado automaticamente
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', authData.user.id)
          .single();

        console.log('Perfil existente encontrado:', existingProfile);

        if (!existingProfile) {
          // Criar perfil manualmente se necessário
          const profileData = {
            user_id: authData.user.id,
            name: userData.name,
            email: userData.email,
            address: userData.address || null,
            age: userData.age && userData.age.trim() !== '' ? parseInt(userData.age) : null,
            phone: userData.phone || null,
            role: userData.role
          };
          
          console.log('Criando perfil manualmente:', profileData);
          console.log('Idade no perfil:', profileData.age);
          
          const { error: profileError } = await supabase
            .from('profiles')
            .insert(profileData);

          if (profileError) {
            console.error('Erro ao criar perfil:', profileError);
            throw profileError;
          }
          
          console.log('Perfil criado com sucesso');
        } else {
          // Se o perfil já existe, atualizar com os dados corretos (especialmente a idade)
          const updateData = {
            name: userData.name,
            email: userData.email,
            address: userData.address || null,
            age: userData.age && userData.age.trim() !== '' ? parseInt(userData.age) : null,
            phone: userData.phone || null,
            role: userData.role
          };
          
          console.log('Atualizando perfil existente:', updateData);
          console.log('Idade para atualizar:', updateData.age);
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('user_id', authData.user.id);

          if (updateError) {
            console.error('Erro ao atualizar perfil:', updateError);
            throw updateError;
          }
          
          console.log('Perfil atualizado com sucesso');
        }

        // Restaurar a sessão original se existia
        if (currentSession) {
          await supabase.auth.setSession(currentSession);
        } else {
          // Se não havia sessão, fazer logout
          await supabase.auth.signOut();
        }

        return { success: true, user: authData.user };
      }

      return { success: false, error: 'Usuário não foi criado' };
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return { createUser, loading };
};
