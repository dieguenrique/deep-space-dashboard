-- Criar tabela de registros financeiros
CREATE TABLE IF NOT EXISTS public.financeiro_registros (
  id BIGSERIAL PRIMARY KEY,
  data_hora TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valor DECIMAL(10, 2) NOT NULL,
  categoria TEXT,
  tipo TEXT,
  descricao TEXT,
  responsavel TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de lembretes
CREATE TABLE IF NOT EXISTS public.lembretes (
  id BIGSERIAL PRIMARY KEY,
  usuario TEXT NOT NULL,
  titulo TEXT,
  mensagem TEXT,
  data_hora TIMESTAMPTZ,
  enviado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de notas
CREATE TABLE IF NOT EXISTS public.notas (
  id BIGSERIAL PRIMARY KEY,
  usuario TEXT NOT NULL,
  titulo TEXT,
  conteudo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_financeiro_data ON public.financeiro_registros(data_hora);
CREATE INDEX IF NOT EXISTS idx_financeiro_responsavel ON public.financeiro_registros(responsavel);
CREATE INDEX IF NOT EXISTS idx_lembretes_usuario ON public.lembretes(usuario);
CREATE INDEX IF NOT EXISTS idx_lembretes_data ON public.lembretes(data_hora);
CREATE INDEX IF NOT EXISTS idx_notas_usuario ON public.notas(usuario);