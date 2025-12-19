-- Habilitar RLS em todas as tabelas
ALTER TABLE public.financeiro_registros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lembretes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para financeiro_registros (app sem autenticação real por enquanto)
CREATE POLICY "Permitir todas operações em financeiro_registros"
ON public.financeiro_registros
FOR ALL
USING (true)
WITH CHECK (true);

-- Políticas permissivas para lembretes
CREATE POLICY "Permitir todas operações em lembretes"
ON public.lembretes
FOR ALL
USING (true)
WITH CHECK (true);

-- Políticas permissivas para notas
CREATE POLICY "Permitir todas operações em notas"
ON public.notas
FOR ALL
USING (true)
WITH CHECK (true);