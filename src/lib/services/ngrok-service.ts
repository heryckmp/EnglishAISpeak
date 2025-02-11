import ngrok from 'ngrok';
import { ngrokConfig } from '../config/ngrok';

export class NgrokService {
  private static instance: NgrokService;
  private tunnelUrl: string | null = null;
  private isConnected: boolean = false;

  private constructor() {}

  static getInstance(): NgrokService {
    if (!NgrokService.instance) {
      NgrokService.instance = new NgrokService();
    }
    return NgrokService.instance;
  }

  async connect(): Promise<string> {
    if (this.isConnected && this.tunnelUrl) {
      return this.tunnelUrl;
    }

    try {
      // Configurar o ngrok com o token de autenticação
      if (ngrokConfig.ngrok.authtoken) {
        await ngrok.authtoken(ngrokConfig.ngrok.authtoken);
      }

      // Iniciar o túnel
      this.tunnelUrl = await ngrok.connect({
        addr: ngrokConfig.ngrok.addr,
        region: ngrokConfig.ngrok.region,
      });

      this.isConnected = true;
      console.log('Ngrok tunnel established:', this.tunnelUrl);
      
      return this.tunnelUrl;
    } catch (error) {
      console.error('Failed to establish ngrok tunnel:', error);
      throw new Error('Failed to establish ngrok tunnel');
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await ngrok.disconnect();
      await ngrok.kill();
      
      this.tunnelUrl = null;
      this.isConnected = false;
      
      console.log('Ngrok tunnel disconnected');
    } catch (error) {
      console.error('Failed to disconnect ngrok tunnel:', error);
      throw new Error('Failed to disconnect ngrok tunnel');
    }
  }

  getTunnelUrl(): string | null {
    return this.tunnelUrl;
  }

  isConnectedToTunnel(): boolean {
    return this.isConnected;
  }
} 