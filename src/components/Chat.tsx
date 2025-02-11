import React, { useState, useRef, useCallback } from 'react';
import { ChatService } from '@/lib/ai/chat-service';
import { AudioRecorder } from './AudioRecorder';
import type { ChatMessage } from '@/lib/types/chat';

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

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: text,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const formattedMessages: ChatMessage[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await chatService.current.sendMessage(
        text,
        formattedMessages
      );

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to get response:', error);
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
  }, [messages]);

  const handleTranscription = useCallback((text: string) => {
    setInputText(text);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  }, [handleSendMessage, inputText]);

  return (
    <div className={`flex flex-col h-full bg-gray-900 ${className}`}>
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
                  ? 'bg-blue-600 text-gray-100'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Área de input */}
      <div className="border-t border-gray-700 p-4 space-y-4 bg-gray-800">
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
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className={`
              px-6 py-2 rounded-lg font-medium text-gray-100
              ${
                isLoading || !inputText.trim()
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
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