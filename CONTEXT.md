# English AI Trainer

Um aplicativo web moderno para treinar inglês usando Inteligência Artificial, focado em conversação e escrita.

## 🎯 Funcionalidades Principais

### Chat Avançado com IA
- Conversação em texto e voz
- Correção de gramática em tempo real
- Níveis ajustáveis (iniciante, intermediário, avançado)
- Simulação de diálogos com diferentes sotaques e velocidades de fala
- Prática de pronúncia com feedback em tempo real

### Modo de Escrita e Feedback
- Editor de texto com correções em tempo real
- Análise detalhada de erros
- Sugestões personalizadas de melhoria

### Interface do Usuário
- Design responsivo e minimalista
- Suporte a modo claro/escuro
- UI moderna com Tailwind CSS e shadcn/ui

### Autenticação e Perfis
- Login social (Google/GitHub)
- Histórico de conversas
- Tracking de progresso

### Recursos Opcionais
- Sistema de flashcards personalizado
- Quiz adaptativo

## 🛠️ Stack Tecnológica

### Frontend
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Radix UI (primitivos headless)
- shadcn/ui (componentes pré-estilizados)

### Backend
- Next.js API Routes
- OpenAI API (GPT-4-turbo) ou DeepSeek Chat
- Web Speech API (reconhecimento de voz nativo do navegador)
- Browser Speech Synthesis (TTS nativo)
- Coqui TTS (TTS open source, self-hosted)
- Vosk (reconhecimento de voz offline)
- Whisper.cpp (versão leve do Whisper, self-hosted)

### Banco de Dados
- Supabase / Prisma
- PostgreSQL

### Autenticação
- NextAuth.js

## 🎙️ Sistema de Voz

### Funcionalidades de Voz
- Reconhecimento de fala em tempo real
- Geração de voz natural e expressiva
- Múltiplos sotaques (Americano, Britânico, Australiano, etc.)
- Ajuste de velocidade da fala por nível
- Feedback de pronúncia com destaque de palavras problemáticas
- Transcrição automática das conversas

### Níveis de Conversação
- **Iniciante**
  - Velocidade de fala reduzida
  - Vocabulário simplificado
  - Correções detalhadas de pronúncia
  - Tópicos do dia-a-dia

- **Intermediário**
  - Velocidade de fala natural
  - Expressões idiomáticas básicas
  - Diferentes sotaques
  - Tópicos variados

- **Avançado**
  - Velocidade de fala nativa
  - Gírias e expressões coloquiais
  - Múltiplos sotaques
  - Tópicos complexos e técnicos

## 📝 Variáveis de Ambiente

## 📁 Recursos Úteis
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives)

### Alternativas Gratuitas
- **LLMs Open Source**
  - Llama 2 (self-hosted)
  - Mistral 7B
  - Phi-2 (Microsoft)
  
- **Text-to-Speech**
  - Web Speech API (nativo do navegador)
  - Coqui TTS (self-hosted)
  - Mozilla TTS (self-hosted)
  
- **Speech-to-Text**
  - Web Speech API (nativo do navegador)
  - Vosk (offline, múltiplos idiomas)
  - Whisper.cpp (versão leve do Whisper)

## 🔄 Fluxo de Dados

1. **Autenticação**
   - Login via NextAuth
   - Persistência de sessão
   - Gerenciamento de perfil

2. **Chat**
   - Streaming de áudio bidirecional
   - Processamento de voz em tempo real
   - Correções e feedback instantâneos

3. **Escrita**
   - Editor em tempo real
   - Análise gramatical
   - Histórico de revisões

4. **Progresso**
   - Tracking de métricas
   - Análise de erros comuns
   - Relatórios de evolução

## 📁 Estrutura Completa do Projeto

```bash
english-ai-trainer/
├── public/
│   ├── fonts/
│   ├── images/
│   └── sounds/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── profile/
│   │   │   ├── settings/
│   │   │   └── stats/
│   │   ├── chat/
│   │   │   ├── [id]/
│   │   │   ├── components/
│   │   │   └── page.tsx
│   │   ├── write/
│   │   │   ├── [id]/
│   │   │   ├── components/
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── chat/
│   │   │   ├── speech/
│   │   │   └── writing/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── chat/
│   │   │   ├── chat-bubble.tsx
│   │   │   ├── voice-recorder.tsx
│   │   │   └── corrections-display.tsx
│   │   ├── write/
│   │   │   ├── editor.tsx
│   │   │   └── feedback-panel.tsx
│   │   └── shared/
│   │       ├── header.tsx
│   │       └── footer.tsx
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── llm.ts
│   │   │   ├── speech-to-text.ts
│   │   │   └── text-to-speech.ts
│   │   ├── db/
│   │   │   ├── schema.ts
│   │   │   └── queries.ts
│   │   ├── utils/
│   │   │   ├── audio.ts
│   │   │   └── text.ts
│   │   └── config/
│   │       └── constants.ts
│   ├── hooks/
│   │   ├── use-speech.ts
│   │   ├── use-chat.ts
│   │   └── use-auth.ts
│   ├── types/
│   │   ├── database.ts
│   │   ├── api.ts
│   │   └── common.ts
│   ├── styles/
│   │   ├── globals.css
│   │   └── themes.css
│   └── context/
│       ├── auth-context.tsx
│       └── theme-context.tsx
├── prisma/
│   └── schema.prisma
├── tests/
│   ├── unit/
│   └── integration/
├── .env
├── .env.example
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## 💾 Esquema do Banco de Dados

### Users
```sql
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    name          VARCHAR(255),
    avatar_url    TEXT,
    level         VARCHAR(20) DEFAULT 'beginner',
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login    TIMESTAMP WITH TIME ZONE,
    settings      JSONB DEFAULT '{}'
);
```

### Conversations
```sql
CREATE TABLE conversations (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID REFERENCES users(id),
    title         VARCHAR(255),
    context       VARCHAR(50) DEFAULT 'general',
    level         VARCHAR(20),
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Messages
```sql
CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id),
    user_id         UUID REFERENCES users(id),
    content         TEXT NOT NULL,
    role            VARCHAR(20) NOT NULL,
    corrections     JSONB,
    audio_url       TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Writing_Exercises
```sql
CREATE TABLE writing_exercises (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID REFERENCES users(id),
    title         VARCHAR(255),
    content       TEXT,
    corrections   JSONB,
    status        VARCHAR(20) DEFAULT 'draft',
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Progress_Tracking
```sql
CREATE TABLE progress_tracking (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID REFERENCES users(id),
    category      VARCHAR(50),
    metric        VARCHAR(50),
    value         INTEGER,
    recorded_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Common_Mistakes
```sql
CREATE TABLE common_mistakes (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID REFERENCES users(id),
    mistake       TEXT,
    correction    TEXT,
    context       TEXT,
    category      VARCHAR(50),
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Plano de Implementação

### Fase 1: Setup Inicial e Estrutura Base
1. **Configuração do Projeto**
   ```bash
   npx create-next-app@latest english-ai-trainer --typescript --tailwind --app --use-npm
   cd english-ai-trainer
   npm install @radix-ui/react-* @prisma/client next-auth
   ```

2. **Setup do Banco de Dados**
   - Configurar Prisma
   - Implementar esquema inicial
   - Criar migrations base

3. **Autenticação**
   - Configurar NextAuth.js
   - Implementar login social
   - Criar páginas de auth

### Fase 2: Interface Base e Componentes Core
1. **UI Framework**
   - Setup Tailwind CSS
   - Implementar shadcn/ui
   - Criar tema base (claro/escuro)

2. **Componentes Base**
   - Layout principal
   - Navegação
   - Header/Footer
   - Componentes UI reutilizáveis

3. **Dashboard Inicial**
   - Página principal
   - Perfil do usuário
   - Navegação entre features

### Fase 3: Chat com IA
1. **Backend do Chat**
   - Configurar API Routes
   - Integrar LLM (DeepSeek/Llama)
   - Implementar streaming de respostas

2. **Interface do Chat**
   - Chat UI responsivo
   - Sistema de mensagens
   - Indicadores de digitação
   - Histórico de conversas

3. **Correções em Tempo Real**
   - Sistema de feedback
   - Highlighting de erros
   - Sugestões de melhoria

### Fase 4: Sistema de Voz
1. **Speech-to-Text**
   - Implementar Web Speech API
   - Backup com Whisper.cpp
   - Tratamento de erros

2. **Text-to-Speech**
   - Browser Speech Synthesis
   - Coqui TTS fallback
   - Controle de velocidade/sotaque

3. **UI de Voz**
   - Controles de gravação
   - Visualização de áudio
   - Feedback de pronúncia

### Fase 5: Editor de Texto
1. **Editor Base**
   - Implementar editor rich text
   - Auto-save
   - Formatação básica

2. **Sistema de Correções**
   - Análise gramatical
   - Sugestões de vocabulário
   - Feedback detalhado

3. **Histórico e Revisões**
   - Sistema de versões
   - Tracking de progresso
   - Estatísticas de melhoria

### Fase 6: Gamificação e Recursos Extras
1. **Sistema de Níveis**
   - Tracking de progresso
   - Métricas de evolução
   - Dashboard de estatísticas

2. **Flashcards**
   - Sistema de repetição espaçada
   - Criação automática baseada em erros
   - Interface de revisão

3. **Quiz Adaptativo**
   - Geração de questões
   - Adaptação por nível
   - Feedback instantâneo

### Fase 7: Polimento e Otimização
1. **Performance**
   - Otimização de assets
   - Lazy loading
   - Caching estratégico

2. **UX/UI**
   - Animações e transições
   - Responsividade
   - Acessibilidade

3. **Testes e QA**
   - Testes unitários
   - Testes de integração
   - Testes de usabilidade

### Fase 8: Deploy e Monitoramento
1. **Infraestrutura**
   - Setup de produção
   - CI/CD pipeline
   - Monitoramento

2. **Analytics**
   - Tracking de uso
   - Métricas de engajamento
   - Feedback dos usuários

3. **Manutenção**
   - Backups
   - Updates de segurança
   - Correções de bugs

## 📝 Próximos Passos

1. Começar pela Fase 1: Setup Inicial
2. Desenvolver incrementalmente, testando cada feature
3. Coletar feedback early e frequentemente
4. Iterar baseado no uso real
5. Escalar gradualmente as funcionalidades
