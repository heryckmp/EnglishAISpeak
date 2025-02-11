# English AI Trainer

Um aplicativo web moderno para treinamento de inglês usando Inteligência Artificial local.

## 🚀 Características

- 💬 Conversação em inglês com IA
- 🎯 Exercícios personalizados
- 🎤 Prática de pronúncia
- ✍️ Treino de escrita com feedback
- 📊 Acompanhamento de progresso
- 🏆 Sistema de conquistas
- 🎨 Interface moderna e responsiva

## 🛠️ Tecnologias

- **Frontend:**
  - Next.js 13+
  - TypeScript
  - TailwindCSS
  - NextAuth.js

- **Backend:**
  - FastAPI (Serviço de IA)
  - PostgreSQL
  - Prisma ORM

- **IA Local:**
  - Microsoft Phi-2 (Modelo leve para execução local)
  - Transformers
  - PyTorch
  - Ngrok (Túnel seguro)

## 📋 Pré-requisitos

- Node.js 18+
- Python 3.8+
- PostgreSQL
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

5. Configure o banco de dados:
```bash
npx prisma migrate dev
```

## 🚀 Executando o Projeto

1. Inicie o serviço de IA local:
```bash
npm run start-local-ai
```

2. Em outro terminal, inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 🔄 Fluxo de Trabalho

1. **Autenticação:**
   - Login com Google ou GitHub
   - Gerenciamento de sessão com NextAuth.js

2. **Personalização:**
   - Definição de nível de inglês
   - Escolha de objetivos de aprendizado
   - Configuração de preferências

3. **Prática:**
   - Exercícios gerados por IA
   - Feedback em tempo real
   - Acompanhamento de progresso
   - Sistema de conquistas

## 🏗️ Arquitetura

### Serviços Principais

- **AI Services:**
  - ChatService: Conversação em inglês
  - WritingService: Análise e correção de texto
  - PronunciationService: Avaliação de pronúncia
  - SpeechSynthesisService: Síntese de voz

- **Core Services:**
  - UserPreferencesService: Gerenciamento de preferências
  - PracticeTrackingService: Acompanhamento de progresso
  - ExerciseService: Geração de exercícios
  - AchievementService: Sistema de gamificação
  - FeedbackService: Feedback dos usuários

### IA Local

O projeto utiliza o modelo Microsoft Phi-2, um modelo leve e eficiente que pode rodar em hardware comum. A comunicação é feita através de um túnel Ngrok seguro, evitando problemas de CORS e permitindo acesso externo quando necessário.

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