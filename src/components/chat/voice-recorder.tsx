"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SpeechToText, type SupportedLanguage } from "@/lib/ai/speech-to-text";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, transcript: string, language: string) => void;
  isProcessing?: boolean;
  whisperApiKey?: string;
}

export function VoiceRecorder({ onRecordingComplete, isProcessing, whisperApiKey }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [error, setError] = useState<string>("");
  const [volume, setVolume] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>("en-US");
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [speechToText] = useState(() => new SpeechToText({
    whisperApiKey,
    language: selectedLanguage,
    useWhisper: !!whisperApiKey
  }));

  // Obter lista de idiomas suportados
  const supportedLanguages = speechToText.getSupportedLanguages();

  // Inicializar o sistema de áudio
  const initializeAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      // Configurar o analisador de áudio
      const context = new AudioContext();
      const source = context.createMediaStreamSource(stream);
      const analyserNode = context.createAnalyser();
      source.connect(analyserNode);
      
      setAudioContext(context);
      setAnalyser(analyserNode);
      setMediaRecorder(recorder);
      setError("");

      // Configurar os handlers do MediaRecorder
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((chunks) => [...chunks, event.data]);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        try {
          // Detectar idioma se estiver usando Whisper
          if (whisperApiKey) {
            const detectedLang = await speechToText.detectLanguage(audioBlob);
            setDetectedLanguage(detectedLang);
          }

          // Transcrever o áudio
          const transcript = await speechToText.transcribeWithWhisper(audioBlob);
          onRecordingComplete(audioBlob, transcript, detectedLanguage || selectedLanguage);
        } catch (error) {
          console.error("Transcription error:", error);
          setError("Failed to transcribe audio. Please try again.");
        }
        setAudioChunks([]);
      };

      // Configurar o SpeechToText
      speechToText.on('result', (result) => {
        if (result.isFinal) {
          setTranscription(result.transcript);
        }
      });

      speechToText.on('error', (error) => {
        console.error('Speech recognition error:', error);
        setError("Speech recognition error. Switching to Whisper...");
      });

    } catch (err) {
      console.error("Error initializing audio:", err);
      setError("Could not access microphone. Please check permissions.");
    }
  }, [onRecordingComplete, speechToText, whisperApiKey, selectedLanguage, detectedLanguage]);

  // Atualizar o medidor de volume
  useEffect(() => {
    let animationFrame: number;

    const updateVolume = () => {
      if (analyser && isRecording) {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        // Calcular o volume médio
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setVolume(average);

        animationFrame = requestAnimationFrame(updateVolume);
      }
    };

    if (isRecording) {
      updateVolume();
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isRecording, analyser]);

  const handleLanguageChange = (language: SupportedLanguage) => {
    setSelectedLanguage(language);
    speechToText.setLanguage(language);
  };

  const startRecording = async () => {
    if (!mediaRecorder) {
      await initializeAudio();
    }
    
    if (mediaRecorder && mediaRecorder.state === "inactive") {
      setIsRecording(true);
      setTranscription("");
      setDetectedLanguage(null);
      mediaRecorder.start();
      speechToText.start();
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      setIsRecording(false);
      mediaRecorder.stop();
      speechToText.stop();
    }
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col items-center space-y-4">
        {/* Seletor de Idioma */}
        <div className="w-full">
          <Select
            value={selectedLanguage}
            onValueChange={handleLanguageChange}
            disabled={isRecording || isProcessing}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(supportedLanguages).map(([code, name]) => (
                <SelectItem key={code} value={code}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Idioma Detectado */}
        {detectedLanguage && (
          <div className="text-sm text-muted-foreground">
            Detected language: {supportedLanguages[detectedLanguage as SupportedLanguage] || detectedLanguage}
          </div>
        )}

        {/* Visualizador de Volume */}
        <div className="w-full h-8 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-100"
            style={{ width: `${(volume / 255) * 100}%` }}
          />
        </div>

        {/* Transcrição em Tempo Real */}
        {transcription && (
          <div className="w-full p-2 bg-muted rounded text-sm">
            {transcription}
          </div>
        )}

        {/* Botões de Controle */}
        <div className="flex gap-2">
          <Button
            onClick={startRecording}
            disabled={isRecording || isProcessing}
            variant={isRecording ? "destructive" : "default"}
          >
            {isRecording ? "Recording..." : "Start Recording"}
          </Button>
          <Button
            onClick={stopRecording}
            disabled={!isRecording || isProcessing}
            variant="outline"
          >
            Stop
          </Button>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {/* Status */}
        {isProcessing && (
          <p className="text-sm text-muted-foreground animate-pulse">
            Processing your audio...
          </p>
        )}
      </div>
    </Card>
  );
} 