# Deploy no Vercel

## Variáveis de Ambiente Necessárias

### Banco de Dados (PostgreSQL)
```env
# Configuração principal do banco
DATABASE_URL="postgresql://seu_usuario:sua_senha@seu_host.neon.tech/seu_banco?sslmode=require"

# Detalhes do PostgreSQL
POSTGRES_USER="seu_usuario"
POSTGRES_PASSWORD="sua_senha"
POSTGRES_HOST="seu_host.neon.tech"
POSTGRES_DB="seu_banco"
```

### Autenticação (NextAuth)
```env
# URL base do seu projeto no Vercel
NEXTAUTH_URL="https://seu-projeto.vercel.app"
# Chave secreta (gere com: openssl rand -base64 32)
NEXTAUTH_SECRET="sua_chave_secreta"

# Credenciais OAuth
GOOGLE_CLIENT_ID="seu_client_id_do_google"
GOOGLE_CLIENT_SECRET="seu_client_secret_do_google"
GITHUB_ID="seu_github_id"
GITHUB_SECRET="seu_github_secret"
```

### LM Studio e IA
```env
# Configuração do LM Studio
LLM_PROVIDER="lmstudio"
LLM_API_URL="http://localhost:1234/v1"
LMSTUDIO_CONTEXT_LENGTH="4096"
LMSTUDIO_MAX_TOKENS="2048"
LMSTUDIO_TEMPERATURE="0.7"
LMSTUDIO_TOP_P="0.95"
```

### Ngrok (para túnel seguro)
```env
NGROK_AUTH_TOKEN="seu_token_ngrok"
NGROK_REGION="us"
NGROK_AI_SERVICE_PORT="8000"
```

## Passo a Passo para Deploy

1. **Banco de Dados**
   - Crie uma conta no [Neon.tech](https://neon.tech)
   - Crie um novo projeto
   - Copie as credenciais de conexão
   - Configure as variáveis do PostgreSQL no Vercel

2. **OAuth**
   - Configure o OAuth no [Google Cloud Console](https://console.cloud.google.com)
     - Adicione `https://seu-projeto.vercel.app` como origem autorizada
     - Adicione `https://seu-projeto.vercel.app/api/auth/callback/google` como URI de redirecionamento
   - Configure o OAuth no [GitHub Developer Settings](https://github.com/settings/developers)
     - Homepage URL: `https://seu-projeto.vercel.app`
     - Callback URL: `https://seu-projeto.vercel.app/api/auth/callback/github`

3. **Ngrok**
   - Crie uma conta no [Ngrok](https://ngrok.com)
   - Copie seu token de autenticação
   - Configure a variável `NGROK_AUTH_TOKEN`

4. **Deploy no Vercel**
   - Conecte seu repositório GitHub
   - Configure todas as variáveis de ambiente listadas acima
   - Deploy!

## Notas Importantes

1. **Banco de Dados**:
   - Recomendamos usar o Neon.tech pela integração com Vercel
   - Mantenha backups regulares

2. **Segurança**:
   - Nunca compartilhe suas chaves secretas
   - Use variáveis de ambiente para todas as credenciais
   - Mantenha o NEXTAUTH_SECRET seguro

3. **LM Studio**:
   - Em produção, considere hospedar o LM Studio em um servidor dedicado
   - Configure o Ngrok para acesso seguro ao LM Studio
   - Monitore o uso de recursos

4. **Monitoramento**:
   - Configure alertas no Vercel
   - Monitore o uso do banco de dados
   - Acompanhe os logs de erro

## Troubleshooting

### Problemas Comuns

1. **Erro de Conexão com Banco**:
   - Verifique as credenciais
   - Confirme se o IP está liberado no firewall
   - Teste a conexão localmente primeiro

2. **Falha na Autenticação**:
   - Verifique as URLs de callback
   - Confirme as credenciais OAuth
   - Verifique os logs do NextAuth

3. **Problemas com LM Studio**:
   - Confirme se o servidor está rodando
   - Verifique a conexão Ngrok
   - Monitore o uso de memória 