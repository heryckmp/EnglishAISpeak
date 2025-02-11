# English AI Trainer

Um aplicativo web moderno para treinamento de inglês usando Inteligência Artificial local.

## 🚀 Características

- 💬 Conversação em inglês com IA
  - Chat interativo com professor virtual
  - Correções em tempo real
  - Explicações em português
  - Feedback detalhado

- ✍️ Assistente de Escrita
  - Análise detalhada de textos
  - Correções gramaticais
  - Sugestões de vocabulário
  - Exemplos de escrita com correções
  - Feedback em português
  - Métricas de avaliação:
    - Gramática
    - Vocabulário
    - Coerência
    - Pontuação geral

- 🎤 Prática de Pronúncia
  - Avaliação em tempo real
  - Detecção de erros fonéticos
  - Sugestões de melhoria
  - Feedback visual

- 📊 Acompanhamento de Progresso
  - Histórico de práticas
  - Estatísticas de evolução
  - Áreas de melhoria

- 🏆 Sistema de Conquistas
  - Recompensas por progresso
  - Metas diárias
  - Níveis de habilidade

- 🎨 Interface Moderna
  - Design responsivo
  - Tema escuro/claro
  - Experiência intuitiva

## 🛠️ Tecnologias

### Frontend
- Next.js 13+
- TypeScript
- TailwindCSS
- NextAuth.js
- Shadcn/ui

### Backend
- FastAPI (Serviço de IA)
- PostgreSQL
- Python 3.8+

### IA Local
- LM Studio
  - Suporte a múltiplos modelos:
    - Microsoft Phi-2
    - Mistral
    - Llama 2
  - Configuração flexível
  - Baixa latência

### Integração
- Ngrok (túnel seguro)
- WebSockets
- API REST

## 📋 Pré-requisitos

- Node.js 18+
- Python 3.8+
- PostgreSQL
- LM Studio
- Conta Ngrok (gratuita)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/english-ai-trainer.git
cd english-ai-trainer
```

2. Instale as dependências do Node.js:
```bash
npm install
```

3. Instale as dependências Python:
```bash
cd ai-service
pip install -r requirements.txt
cd ..
```

4. Configure as variáveis de ambiente:
- Copie o arquivo `.env.example` para `.env`
- Preencha as variáveis necessárias:
  - Configurações do PostgreSQL
  - Chaves OAuth (Google/GitHub)
  - Token do Ngrok
  - Configurações do LM Studio

## 🚀 Executando o Projeto

1. Inicie o LM Studio:
   - Abra o LM Studio
   - Carregue o modelo desejado
   - Inicie o servidor na porta 1234

2. Inicie o serviço de IA local:
```bash
npm run start-local-ai
```

3. Em outro terminal, inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 📱 Funcionalidades Principais

### 🤖 Chat com IA
- Conversação natural em inglês
- Correções instantâneas
- Explicações em português
- Adaptação ao nível do usuário

### ✍️ Assistente de Escrita
- Análise completa de textos
- Métricas detalhadas
- Sugestões de melhoria
- Exemplos práticos
- Feedback personalizado

### 🎤 Treino de Pronúncia
- Reconhecimento de voz
- Avaliação fonética
- Feedback visual
- Exercícios práticos

## 🔄 Fluxo de Trabalho

1. **Autenticação:**
   - Login com Google ou GitHub
   - Gerenciamento de sessão

2. **Personalização:**
   - Definição de nível
   - Objetivos de aprendizado
   - Preferências de estudo

3. **Prática:**
   - Escolha da atividade
   - Feedback em tempo real
   - Acompanhamento de progresso
   - Conquistas e recompensas

## 🏗️ Arquitetura

### Serviços Principais

- **AI Services:**
  - ChatService: Conversação
  - WritingService: Análise de texto
  - PronunciationService: Avaliação de fala
  - SpeechSynthesisService: Síntese de voz

- **Core Services:**
  - UserPreferencesService
  - PracticeTrackingService
  - ExerciseService
  - AchievementService
  - FeedbackService

### IA Local

O projeto utiliza o LM Studio para rodar modelos de linguagem localmente:
- Baixa latência
- Privacidade dos dados
- Flexibilidade de modelos
- Customização de parâmetros

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- Abra uma issue para reportar bugs
- Sugestões de features são bem-vindas
- Dúvidas podem ser enviadas através das issues