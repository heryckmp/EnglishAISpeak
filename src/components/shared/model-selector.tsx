"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OpenRouterClient } from "@/lib/ai/openrouter-client";

interface ModelSelectorProps {
  onModelChange: (model: string) => void;
  currentModel: string;
}

export function ModelSelector({ onModelChange, currentModel }: ModelSelectorProps) {
  const models = OpenRouterClient.AVAILABLE_MODELS;
  
  const getModelLabel = (modelId: string) => {
    const entries = Object.entries(models);
    const entry = entries.find(([_, value]) => value === modelId);
    if (entry) {
      return entry[0].replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    }
    return modelId;
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">Modelo:</span>
      <Select
        value={currentModel}
        onValueChange={(value) => onModelChange(value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue>{getModelLabel(currentModel)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(models).map(([key, value]) => (
            <SelectItem key={key} value={value}>
              {key.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 