import React, { useState, useRef } from 'react';
import { ChatService } from '@/lib/ai/chat-service';
import { AudioRecorder } from './AudioRecorder';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatProps {
  className?: string;
}

export const Chat: React.FC<ChatProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatService = useRef(new ChatService());

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: text,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await chatService.current.sendMessage(
        text,
        messages as any
      );

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to get response:', error);
      // Adicionar mensagem de erro ao chat
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Desculpe, ocorreu um erro ao processar sua mensagem.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranscription = (text: string) => {
    setInputText(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 text-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Área de input */}
      <div className="border-t p-4 space-y-4">
        <AudioRecorder
          onTranscription={handleTranscription}
          onError={error => console.error('Audio recording error:', error)}
          className="mb-4"
        />

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className={`
              px-6 py-2 rounded-lg font-medium text-white
              ${
                isLoading || !inputText.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }
            `}
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}; 