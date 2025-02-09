# English AI Speak 🎯

Um aplicativo web moderno para praticar inglês usando Inteligência Artificial, com suporte a chat por voz e texto, correções em tempo real e múltiplos modelos de IA.

## 🌟 Funcionalidades

- **Chat Interativo**: Pratique conversação em inglês com diferentes modelos de IA
- **Reconhecimento de Voz**: Suporte para entrada por voz usando Web Speech API ou Whisper
- **Síntese de Voz**: Respostas em áudio usando TTS (Text-to-Speech)
- **Múltiplos Modelos**: Suporte para OpenRouter (Claude 3, GPT-4, etc.) e modelos locais
- **Correções em Tempo Real**: Feedback instantâneo sobre erros gramaticais e pronúncia
- **Níveis Personalizados**: Adapte o nível de dificuldade (iniciante, intermediário, avançado)
- **Interface Moderna**: UI responsiva e intuitiva usando Next.js 14 e Tailwind CSS
- **Autenticação**: Login social com Google e GitHub

## 🚀 Tecnologias

- **Frontend**: Next.js 14, React, TypeScript
- **Estilização**: Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes, PostgreSQL
- **Autenticação**: NextAuth.js
- **IA**: OpenRouter API, Whisper API
- **Outros**: Web Speech API, WebRTC

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL
- Conta no OpenRouter (para acesso aos modelos de IA)
- (Opcional) Chave API do Whisper para reconhecimento de voz avançado

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone https://github.com/heryckmp/EnglishAISpeak.git
cd EnglishAISpeak
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Configure o banco de dados:
```bash
# Crie o banco de dados PostgreSQL
createdb english_ai_trainer

# Execute as migrações do banco
psql -d english_ai_trainer -f sql/schema.sql
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## ⚙️ Configuração

### Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure as seguintes variáveis:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/english_ai_trainer?schema=public"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="" # Gere com: openssl rand -base64 32

# OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_ID=""
GITHUB_SECRET=""

# LLM Provider
LLM_PROVIDER="openrouter" # Opções: openrouter, local, openai

# OpenRouter API
OPENROUTER_API_KEY="" # Obtenha em: https://openrouter.ai/keys

# Configuração de Modelos Locais (opcional)
ENABLE_LLAMA2="false"
LLAMA2_API_URL="http://localhost:8000"

ENABLE_MISTRAL="false"
MISTRAL_API_URL="http://localhost:8001"

ENABLE_PHI2="false"
PHI2_API_URL="http://localhost:8002"
```

### OAuth Setup

1. **Google OAuth**:
   - Acesse [Google Cloud Console](https://console.cloud.google.com)
   - Crie um novo projeto
   - Configure as credenciais OAuth
   - Adicione URLs de redirecionamento: `http://localhost:3000/api/auth/callback/google`

2. **GitHub OAuth**:
   - Acesse [GitHub Developer Settings](https://github.com/settings/developers)
   - Crie um novo OAuth App
   - Adicione URL de callback: `http://localhost:3000/api/auth/callback/github`

### OpenRouter Setup

1. Crie uma conta em [OpenRouter](https://openrouter.ai)
2. Gere uma chave API
3. Adicione a chave ao seu arquivo `.env`

## 🎯 Uso

### Chat por Texto

1. Faça login usando Google ou GitHub
2. Acesse a página de chat
3. Selecione o nível de dificuldade
4. Escolha o modelo de IA desejado
5. Comece a conversar!

### Chat por Voz

1. Clique no botão "Show Voice Recorder"
2. Selecione o idioma (se não estiver usando Whisper)
3. Clique em "Start Recording"
4. Fale sua mensagem
5. Clique em "Stop" para enviar

### Correções

O sistema fornecerá correções no seguinte formato:
```
Original: I have 23 years
Corrected: I am 23 years old
Explanation: In English, we use "am/is/are" + "years old" to express age
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia nosso guia de contribuição antes de enviar um PR.

1. Faça um Fork do projeto
2. Crie sua Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📧 Contato

Erick Moreira - [@heryckmp](https://github.com/heryckmp)

Link do Projeto: [https://github.com/heryckmp/EnglishAISpeak](https://github.com/heryckmp/EnglishAISpeak) 