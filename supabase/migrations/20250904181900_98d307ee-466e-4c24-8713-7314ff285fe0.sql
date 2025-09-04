-- Criar o usuário Kauan Gabriel Rodrigues da Silva
-- Primeiro vamos criar um insert direto na tabela profiles para o usuário que será criado via auth

-- Vamos também verificar e corrigir permissões de daily_word
-- Alterando as políticas de daily_word para garantir que líderes possam inserir

DROP POLICY IF EXISTS "Leaders can manage daily word" ON public.daily_word;

CREATE POLICY "Leaders and trainees can manage daily word" 
ON public.daily_word 
FOR ALL 
USING (is_leader_or_trainee(auth.uid()));

-- Verificar se existe a policy para criação
CREATE POLICY "Leaders and trainees can create daily word" 
ON public.daily_word 
FOR INSERT 
WITH CHECK (is_leader_or_trainee(auth.uid()));

-- Permitir que todos vejam daily_word
DROP POLICY IF EXISTS "Everyone can view daily word" ON public.daily_word;

CREATE POLICY "Everyone can view daily word" 
ON public.daily_word 
FOR SELECT 
USING (true);