export const ngrokConfig = {
  // Porta padrão para o serviço de IA local
  aiServicePort: 8000,
  
  // Configurações do ngrok
  ngrok: {
    authtoken: process.env.NGROK_AUTH_TOKEN,
    region: 'us',
    addr: 8000,
  },
  
  // Tempo máximo de espera para respostas (em ms)
  timeout: 30000,
  
  // Configurações de retry
  retry: {
    maxAttempts: 3,
    delay: 1000,
  }
}; 