import { NextResponse } from 'next/server';
import ngrok from 'ngrok';
import { ngrokConfig } from '@/lib/config/ngrok';

let tunnelUrl: string | null = null;

export async function GET() {
  try {
    // Se já existe uma URL de túnel, retorna ela
    if (tunnelUrl) {
      return NextResponse.json({ url: tunnelUrl });
    }

    // Em desenvolvimento, retorna a URL local
    if (process.env.NODE_ENV === 'development') {
      tunnelUrl = `http://localhost:${ngrokConfig.aiServicePort}`;
      return NextResponse.json({ url: tunnelUrl });
    }

    // Em produção, cria um túnel ngrok
    if (ngrokConfig.ngrok.authtoken) {
      await ngrok.authtoken(ngrokConfig.ngrok.authtoken);
    }

    tunnelUrl = await ngrok.connect({
      addr: ngrokConfig.ngrok.addr,
      region: ngrokConfig.ngrok.region,
    });

    return NextResponse.json({ url: tunnelUrl });
  } catch (error) {
    console.error('Failed to establish tunnel:', error);
    return NextResponse.json(
      { error: 'Failed to establish tunnel' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    if (process.env.NODE_ENV !== 'development' && tunnelUrl) {
      await ngrok.disconnect();
      await ngrok.kill();
    }
    
    tunnelUrl = null;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to disconnect tunnel:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect tunnel' },
      { status: 500 }
    );
  }
} 