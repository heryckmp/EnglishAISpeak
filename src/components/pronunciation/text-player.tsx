"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";

interface TextPlayerProps {
  text: string;
  onPlayComplete?: () => void;
}

export function TextPlayer({ text, onPlayComplete }: TextPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const englishVoices = availableVoices.filter(
        voice => voice.lang.startsWith("en-")
      );
      setVoices(englishVoices);
      
      // Set default voice (prefer US English)
      const defaultVoice = englishVoices.find(
        voice => voice.lang === "en-US"
      ) || englishVoices[0];
      setSelectedVoice(defaultVoice);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    // Create utterance with current settings
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.volume = volume;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      onPlayComplete?.();
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
  }, [text, selectedVoice, rate, volume, onPlayComplete]);

  const handlePlay = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      if (utteranceRef.current) {
        window.speechSynthesis.speak(utteranceRef.current);
      }
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleVoiceChange = (voiceURI: string) => {
    const voice = voices.find(v => v.voiceURI === voiceURI);
    if (voice) {
      setSelectedVoice(voice);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <Button
              variant="outline"
              size="icon"
              onClick={handlePause}
              title="Pause"
            >
              <Pause className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="icon"
              onClick={handlePlay}
              title="Play"
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={handleStop}
            title="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <Select
          value={selectedVoice?.voiceURI}
          onValueChange={handleVoiceChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select voice" />
          </SelectTrigger>
          <SelectContent>
            {voices.map((voice) => (
              <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium w-20">Speed</span>
          <Slider
            value={[rate]}
            onValueChange={([value]) => setRate(value)}
            min={0.5}
            max={2}
            step={0.1}
            className="w-48"
          />
          <span className="text-sm tabular-nums">{rate.toFixed(1)}x</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium w-20">Volume</span>
          <Slider
            value={[volume]}
            onValueChange={([value]) => setVolume(value)}
            min={0}
            max={1}
            step={0.1}
            className="w-48"
          />
          <Volume2 className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
} 