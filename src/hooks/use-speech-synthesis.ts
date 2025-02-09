import { useState, useEffect, useCallback } from "react";

interface UseSpeechSynthesisProps {
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export function useSpeechSynthesis({
  voice,
  rate = 1,
  pitch = 1,
  volume = 1,
  onStart,
  onEnd,
  onError,
}: UseSpeechSynthesisProps = {}) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Carregar vozes disponíveis
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    if (typeof window !== "undefined") {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Função para criar uma nova utterance
  const createUtterance = useCallback((text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Aplicar configurações
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Eventos
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      onStart?.();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      onEnd?.();
    };

    utterance.onerror = (event) => {
      const errorMessage = event.error;
      setError(errorMessage);
      setIsSpeaking(false);
      setIsPaused(false);
      onError?.(errorMessage);
    };

    return utterance;
  }, [voice, rate, pitch, volume, onStart, onEnd, onError]);

  // Função para falar
  const speak = useCallback((text: string) => {
    if (typeof window === "undefined") return;

    try {
      // Cancelar fala anterior
      window.speechSynthesis.cancel();

      // Criar nova utterance
      const newUtterance = createUtterance(text);
      setUtterance(newUtterance);

      // Iniciar fala
      window.speechSynthesis.speak(newUtterance);
      setError(null);
    } catch (error) {
      console.error("Speech synthesis error:", error);
      setError("Failed to start speech synthesis");
      onError?.("Failed to start speech synthesis");
    }
  }, [createUtterance, onError]);

  // Função para pausar
  const pause = useCallback(() => {
    if (typeof window === "undefined") return;

    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSpeaking, isPaused]);

  // Função para resumir
  const resume = useCallback(() => {
    if (typeof window === "undefined") return;

    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSpeaking, isPaused]);

  // Função para cancelar
  const cancel = useCallback(() => {
    if (typeof window === "undefined") return;

    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  // Limpar ao desmontar
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    voices,
    isSpeaking,
    isPaused,
    error,
    speak,
    pause,
    resume,
    cancel,
    isSupported: typeof window !== "undefined" && "speechSynthesis" in window,
  };
} 