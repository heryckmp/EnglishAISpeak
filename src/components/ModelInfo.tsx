import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface ModelInfo {
  name: string;
  type: string;
  parameters?: string;
  contextLength?: number;
}

export function ModelInfo() {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchModelInfo() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_LLM_API_URL || 'http://localhost:1234/v1'}/model`);
        if (response.ok) {
          const data = await response.json();
          setModelInfo(data);
        }
      } catch (error) {
        console.error('Erro ao buscar informações do modelo:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchModelInfo();
  }, []);

  if (isLoading) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">Carregando informações do modelo...</p>
      </Card>
    );
  }

  if (!modelInfo) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">Modelo LM Studio não detectado. Verifique se o serviço está rodando.</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Modelo Atual:</h3>
          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">LM Studio</span>
        </div>
        <div className="text-sm space-y-1">
          <p><span className="font-medium">Nome:</span> {modelInfo.name}</p>
          <p><span className="font-medium">Tipo:</span> {modelInfo.type}</p>
          {modelInfo.parameters && (
            <p><span className="font-medium">Parâmetros:</span> {modelInfo.parameters}</p>
          )}
          {modelInfo.contextLength && (
            <p><span className="font-medium">Contexto:</span> {modelInfo.contextLength} tokens</p>
          )}
        </div>
      </div>
    </Card>
  );
} 