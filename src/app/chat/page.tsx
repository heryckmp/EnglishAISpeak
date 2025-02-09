"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { VoiceRecorder } from "@/components/chat/voice-recorder";
import { AudioPlayer } from "@/components/chat/audio-player";
import { OpenRouterClient } from "@/lib/ai/openrouter-client";
import config from "@/lib/config";

// Tipos
interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  audioUrl?: string;
  language?: string;
  corrections?: {
    original: string;
    corrected: string;
    explanation: string;
  }[];
}

const CONVERSATION_STARTERS = [
  "Tell me about your day",
  "What's your favorite movie?",
  "How do you like to spend your weekends?",
  "What are your hobbies?",
];

const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const AVAILABLE_MODELS = OpenRouterClient.AVAILABLE_MODELS;

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("intermediate");
  const [selectedModel, setSelectedModel] = useState<keyof typeof AVAILABLE_MODELS>("claude-3-opus");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Rolar para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: content, 
          level: selectedLevel,
          model: selectedModel 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages((prev) => [...prev, ...data.messages]);
      } else {
        console.error("Error:", data.error);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceRecording = async (audioBlob: Blob, transcript: string, language: string) => {
    setIsProcessingAudio(true);
    try {
      // Criar FormData com o arquivo de áudio
      const formData = new FormData();
      formData.append("audio", audioBlob);
      formData.append("level", selectedLevel);
      formData.append("transcript", transcript);
      formData.append("language", language);
      formData.append("model", selectedModel);

      const response = await fetch("/api/chat/voice", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setMessages((prev) => [...prev, ...data.messages]);
      } else {
        console.error("Error:", data.error);
      }
    } catch (error) {
      console.error("Failed to process voice message:", error);
    } finally {
      setIsProcessingAudio(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header Section */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">English Conversation Practice</h1>
        <p className="text-muted-foreground">
          Chat with our AI tutor to improve your English skills
        </p>
      </div>

      {/* Settings Bar */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex gap-2 items-center">
          <div className="flex gap-2">
            {DIFFICULTY_LEVELS.map((level) => (
              <Button
                key={level.value}
                variant={selectedLevel === level.value ? "default" : "outline"}
                onClick={() => setSelectedLevel(level.value)}
                size="sm"
              >
                {level.label}
              </Button>
            ))}
          </div>
          <Select
            value={selectedModel}
            onValueChange={(value) => setSelectedModel(value as keyof typeof AVAILABLE_MODELS)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(AVAILABLE_MODELS).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value.split("/")[0]} - {value.split("/")[1]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsRecording(!isRecording)}>
          {isRecording ? "Hide Voice Recorder" : "Show Voice Recorder"}
        </Button>
      </div>

      {/* Main Chat Area */}
      <Card className="mb-4">
        <div className="h-[600px] flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="mb-6">
                  <span className="text-4xl mb-4">👋</span>
                  <h2 className="text-xl font-semibold mb-2">
                    Start Your English Practice
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Choose a topic or start with one of our suggestions below
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                  {CONVERSATION_STARTERS.map((starter) => (
                    <Button
                      key={starter}
                      variant="outline"
                      className="text-sm"
                      onClick={() => handleSendMessage(starter)}
                    >
                      {starter}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <ChatMessage {...message} />
                  {message.audioUrl && (
                    <div className="ml-4">
                      <AudioPlayer src={message.audioUrl} />
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t space-y-4">
            {isRecording && (
              <VoiceRecorder
                onRecordingComplete={handleVoiceRecording}
                isProcessing={isProcessingAudio}
                whisperApiKey={config.openai.apiKey}
              />
            )}
            <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>
      </Card>

      {/* Learning Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl mb-1">🎯</div>
          <div className="text-sm font-medium">Words Learned</div>
          <div className="text-2xl font-bold">24</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl mb-1">⏱️</div>
          <div className="text-sm font-medium">Practice Time</div>
          <div className="text-2xl font-bold">45m</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl mb-1">📈</div>
          <div className="text-sm font-medium">Accuracy</div>
          <div className="text-2xl font-bold">92%</div>
        </Card>
      </div>
    </div>
  );
} 