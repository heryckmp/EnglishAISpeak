"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Loader2 } from "lucide-react";
import { SpeechRecognitionService } from "@/lib/ai/speech-recognition-service";
import { PronunciationService } from "@/lib/ai/pronunciation-service";

interface VoiceRecorderProps {
  onRecordingComplete: (
    audioBlob: Blob,
    transcript: string,
    analysis: any
  ) => void;
  expectedText?: string;
  isProcessing?: boolean;
}

export function VoiceRecorder({
  onRecordingComplete,
  expectedText,
  isProcessing = false
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [volume, setVolume] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const audioContextRef = useRef<AudioContext | undefined>(undefined);
  const analyserRef = useRef<AnalyserNode | undefined>(undefined);
  const speechRecognitionRef = useRef<SpeechRecognitionService | undefined>(undefined);
  const pronunciationServiceRef = useRef<PronunciationService | undefined>(undefined);

  useEffect(() => {
    // Inicializar serviços
    speechRecognitionRef.current = new SpeechRecognitionService();
    pronunciationServiceRef.current = new PronunciationService();

    // Configurar eventos do reconhecimento de fala
    speechRecognitionRef.current.on('result', (result: any) => {
      setTranscript(result.text);
    });

    return () => {
      cancelAnimationFrame(animationFrameRef.current!);
      audioContextRef.current?.close();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Configurar análise de áudio
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Configurar gravação
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Analisar pronúncia se houver texto esperado
        if (expectedText && pronunciationServiceRef.current) {
          const analysis = await pronunciationServiceRef.current.analyzePronunciation(
            audioBlob,
            expectedText
          );
          onRecordingComplete(audioBlob, transcript, analysis);
        } else {
          onRecordingComplete(audioBlob, transcript, null);
        }
      };

      // Iniciar gravação e visualização
      mediaRecorderRef.current.start();
      speechRecognitionRef.current?.start();
      setIsRecording(true);
      updateVolume();
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    speechRecognitionRef.current?.stop();
    setIsRecording(false);
    cancelAnimationFrame(animationFrameRef.current!);
  };

  const updateVolume = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calcular volume médio
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setVolume(average);

    animationFrameRef.current = requestAnimationFrame(updateVolume);
  };

  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Visualização do volume */}
      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-100"
          style={{ width: `${(volume / 255) * 100}%` }}
        />
      </div>

      {/* Controles */}
      <div className="flex space-x-2">
        {!isRecording && !audioUrl && (
          <Button
            onClick={startRecording}
            disabled={isProcessing}
            variant="outline"
            size="icon"
          >
            <Mic className="h-4 w-4" />
          </Button>
        )}

        {isRecording && (
          <Button
            onClick={stopRecording}
            variant="outline"
            size="icon"
            className="text-red-500"
          >
            <Square className="h-4 w-4" />
          </Button>
        )}

        {audioUrl && !isRecording && (
          <Button
            onClick={playRecording}
            variant="outline"
            size="icon"
          >
            <Play className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Transcrição */}
      {transcript && (
        <p className="text-sm text-gray-600 mt-2">{transcript}</p>
      )}

      {/* Indicador de processamento */}
      {isProcessing && (
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Processing audio...</span>
        </div>
      )}
    </div>
  );
} 