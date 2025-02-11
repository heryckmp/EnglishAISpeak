"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { type EnglishLevel } from '@/lib/prompts/english-training';
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { VoiceRecorder } from "@/components/chat/voice-recorder";
import { VoiceSettings as VoiceSettingsComponent } from "@/components/chat/voice-settings";
import { AudioPlayer } from "@/components/chat/audio-player";
import { PronunciationFeedback } from "@/components/chat/pronunciation-feedback";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ModelInfo } from "@/components/ModelInfo";

interface PronunciationError {
  word: string;
  expected: string;
  actual: string;
  confidence: number;
  suggestion?: string;
  start: number;
  end: number;
}

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  audioUrl?: string;
  pronunciationFeedback?: PronunciationError[];
}

interface VoiceSettings {
  accent: string;
  speed: number;
  pitch: number;
  volume: number;
}

interface PronunciationAnalysis {
  errors: PronunciationError[];
  score: number;
  feedback: string;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [level] = useState<EnglishLevel>('intermediate');
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    accent: "american",
    speed: 1,
    pitch: 1,
    volume: 1
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Se ainda está carregando a sessão, mostra o loading
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Se não estiver autenticado, redireciona para login
  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }

  const handleSubmit = async (message: string) => {
    if (!message.trim() || isLoading) return;

    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      role: 'user',
      content: message
    }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.id}`
        },
        body: JSON.stringify({
          message,
          level,
          previousMessages: messages,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message
      };

      // Gerar áudio para a resposta
      const audioResponse = await fetch('/api/chat/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: data.message,
          settings: voiceSettings
        })
      });

      if (audioResponse.ok) {
        const audioData = await audioResponse.json();
        assistantMessage.audioUrl = audioData.audioUrl;
      }

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceRecording = async (audioBlob: Blob, transcript: string, analysis: PronunciationAnalysis) => {
    if (isLoading) return;

    setIsLoading(true);
    const newMessage: Message = {
      id: crypto.randomUUID(),
      content: transcript,
      role: "user",
      pronunciationFeedback: analysis.errors
    };

    setMessages(prev => [...prev, newMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: transcript,
          audioBlob,
          analysis 
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        audioUrl: data.audioUrl
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending voice message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <ModelInfo />
      <Card className="p-6">
        <VoiceSettingsComponent onSettingsChange={setVoiceSettings} />
      </Card>

      <Card className="p-6 h-[600px] flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <ChatMessage
                content={message.content}
                role={message.role}
              />
              {message.pronunciationFeedback && (
                <PronunciationFeedback
                  text={message.content}
                  feedback={message.pronunciationFeedback}
                />
              )}
              {message.audioUrl && (
                <AudioPlayer
                  src={message.audioUrl}
                />
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="space-y-4">
          <VoiceRecorder
            onRecordingComplete={handleVoiceRecording}
            isProcessing={isLoading}
          />
          <ChatInput
            onSend={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </Card>
    </div>
  );
} 