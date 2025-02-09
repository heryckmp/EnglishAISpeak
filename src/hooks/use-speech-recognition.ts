import { useState, useEffect, useCallback } from "react";

interface UseSpeechRecognitionProps {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export function useSpeechRecognition({
  language = "en-US",
  continuous = true,
  interimResults = true,
  onResult,
  onError,
}: UseSpeechRecognitionProps = {}) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");

  // Inicializar o reconhecimento de voz
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.lang = language;

        recognition.onresult = (event: any) => {
          const result = event.results[event.results.length - 1];
          const transcript = result[0].transcript;
          const confidence = result[0].confidence;
          const isFinal = result.isFinal;

          setTranscript(transcript);
          onResult?.(transcript, isFinal);
        };

        recognition.onerror = (event: any) => {
          const errorMessage = event.error;
          setError(errorMessage);
          onError?.(errorMessage);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        setRecognition(recognition);
      } else {
        setError("Speech recognition is not supported in this browser");
        onError?.("Speech recognition is not supported in this browser");
      }
    }

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, [language, continuous, interimResults, onResult, onError]);

  const start = useCallback(() => {
    if (recognition && !isListening) {
      try {
        recognition.start();
        setIsListening(true);
        setError(null);
      } catch (error) {
        console.error("Failed to start speech recognition:", error);
        setError("Failed to start speech recognition");
        onError?.("Failed to start speech recognition");
      }
    }
  }, [recognition, isListening, onError]);

  const stop = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening]);

  const abort = useCallback(() => {
    if (recognition) {
      recognition.abort();
      setIsListening(false);
    }
  }, [recognition]);

  return {
    isListening,
    transcript,
    error,
    start,
    stop,
    abort,
    isSupported: !!recognition,
  };
} 