declare module 'ngrok' {
  interface NgrokOptions {
    addr: number | string;
    authtoken?: string;
    subdomain?: string;
    region?: string;
    configPath?: string;
    binPath?: string;
    onStatusChange?: (status: string) => void;
    onLogEvent?: (log: string) => void;
  }

  interface NgrokModule {
    connect(options?: NgrokOptions | number): Promise<string>;
    disconnect(url?: string): Promise<void>;
    kill(): Promise<void>;
    authtoken(token: string): Promise<void>;
    getUrl(): string | null;
    getApi(): { [key: string]: any };
  }

  const ngrok: NgrokModule;
  export = ngrok;
} 