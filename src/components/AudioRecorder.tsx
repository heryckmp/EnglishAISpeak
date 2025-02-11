import React, { useState, useRef } from 'react';
import { SpeechRecognitionService } from '@/lib/ai/speech-recognition-service';

interface AudioRecorderProps {
  onTranscription: (text: string) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onTranscription,
  onError,
  className = '',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const speechService = useRef(new SpeechRecognitionService());

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
        
        // Limpar recursos
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      onError?.(error as Error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
      const result = await speechService.current.transcribeAudio(audioBlob);
      onTranscription(result.text);
    } catch (error) {
      console.error('Failed to process audio:', error);
      onError?.(error as Error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`
          px-4 py-2 rounded-full font-medium
          ${isRecording
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isProcessing ? (
          'Processando...'
        ) : isRecording ? (
          'Parar Gravação'
        ) : (
          'Iniciar Gravação'
        )}
      </button>

      {isRecording && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-600">Gravando...</span>
        </div>
      )}
    </div>
  );
}; 