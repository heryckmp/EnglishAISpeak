"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { SpeechRecognitionService } from "@/lib/ai/speech-recognition-service";
import { PronunciationService } from "@/lib/ai/pronunciation-service";

interface VoiceRecorderProps {
  onRecordingComplete: (
    audioBlob: Blob,
    transcript: string,
    analysis: {
      errors: Array<{
        word: string;
        expected: string;
        actual: string;
        confidence: number;
        suggestion?: string;
        start: number;
        end: number;
      }>;
      score: number;
      feedback: string;
    }
  ) => void;
  isProcessing?: boolean;
}

export function VoiceRecorder({ onRecordingComplete, isProcessing = false }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const speechService = useRef(new SpeechRecognitionService());
  const pronunciationService = useRef(new PronunciationService());

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
        await processRecording(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processRecording = async (audioBlob: Blob) => {
    try {
      setIsAnalyzing(true);

      // Transcrever o áudio
      const transcriptionResult = await speechService.current.transcribeAudio(audioBlob);
      if (!transcriptionResult?.text) {
        throw new Error('Failed to transcribe audio');
      }

      // Analisar a pronúncia
      const analysis = await pronunciationService.current.analyzePronunciation(
        transcriptionResult.text,
        transcriptionResult.text
      );

      // Garantir que analysis tem a estrutura esperada
      const validAnalysis = {
        errors: analysis?.errors || [],
        score: analysis?.overallScore || 0,
        feedback: analysis?.feedback || 'No feedback available'
      };

      onRecordingComplete(audioBlob, transcriptionResult.text, validAnalysis);
    } catch (error) {
      console.error('Failed to process recording:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isRecording ? "destructive" : "default"}
        size="icon"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing || isAnalyzing}
      >
        {isRecording ? (
          <Square className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>

      {(isAnalyzing || isProcessing) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{isAnalyzing ? 'Analyzing...' : 'Processing...'}</span>
        </div>
      )}

      {isRecording && (
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm text-muted-foreground">Recording...</span>
        </div>
      )}
    </div>
  );
} 