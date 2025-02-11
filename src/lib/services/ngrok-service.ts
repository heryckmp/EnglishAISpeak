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
      const response = await fetch('/api/tunnel');
      if (!response.ok) {
        throw new Error('Failed to establish tunnel');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      this.tunnelUrl = data.url;
      this.isConnected = true;
      console.log('Tunnel established:', this.tunnelUrl);
      
      return this.tunnelUrl;
    } catch (error) {
      console.error('Failed to establish tunnel:', error);
      throw new Error('Failed to establish tunnel');
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      const response = await fetch('/api/tunnel', {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect tunnel');
      }

      this.tunnelUrl = null;
      this.isConnected = false;
      console.log('Tunnel disconnected');
    } catch (error) {
      console.error('Failed to disconnect tunnel:', error);
      throw new Error('Failed to disconnect tunnel');
    }
  }

  getTunnelUrl(): string | null {
    return this.tunnelUrl;
  }

  isConnectedToTunnel(): boolean {
    return this.isConnected;
  }
} 