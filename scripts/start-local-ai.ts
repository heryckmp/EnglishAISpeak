import { NgrokService } from '../src/lib/services/ngrok-service';
import { spawn } from 'child_process';
import path from 'path';

async function startLocalAIService() {
  try {
    // Iniciar o serviço de IA local
    const aiServicePath = path.join(__dirname, '..', 'ai-service', 'main.py');
    const aiService = spawn('python', [aiServicePath], {
      stdio: 'inherit',
    });

    // Configurar handlers para o processo
    aiService.on('error', (error) => {
      console.error('Failed to start AI service:', error);
      process.exit(1);
    });

    // Iniciar o túnel ngrok
    const ngrokService = NgrokService.getInstance();
    const tunnelUrl = await ngrokService.connect();
    console.log('AI service accessible at:', tunnelUrl);

    // Configurar cleanup ao encerrar
    process.on('SIGINT', async () => {
      console.log('\nShutting down...');
      aiService.kill();
      await ngrokService.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\nShutting down...');
      aiService.kill();
      await ngrokService.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('Error starting services:', error);
    process.exit(1);
  }
}

startLocalAIService().catch(console.error); 