"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Mic, Square, Play, Loader2 } from "lucide-react";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, transcript: string, analysis: any) => void;
  expectedText?: string;
  isProcessing?: boolean;
}

export function VoiceRecorder({
  onRecordingComplete,
  expectedText,
  isProcessing = false,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [volume, setVolume] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const audioContextRef = useRef<AudioContext | undefined>(undefined);
  const analyserRef = useRef<AnalyserNode | undefined>(undefined);
  const sourceRef = useRef<MediaStreamAudioSourceNode | undefined>(undefined);
  const streamRef = useRef<MediaStream | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio context and analyser
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);

      // Configure analyser
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioBlob(audioBlob);
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);

      // Start volume visualization
      const updateVolume = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
        const normalizedVolume = Math.min(100, (average / 128) * 100);
        setVolume(normalizedVolume);

        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      setVolume(0);
    }
  };

  const handleAnalyze = async () => {
    if (!audioBlob) return;

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);
      if (expectedText) {
        formData.append("expectedText", expectedText);
      }

      const response = await fetch("/api/pronunciation/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze pronunciation");
      }

      const { transcript, analysis } = await response.json();
      onRecordingComplete(audioBlob, transcript, analysis);
    } catch (error) {
      console.error("Error analyzing pronunciation:", error);
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.play();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant={isRecording ? "destructive" : "default"}
          size="icon"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
        >
          {isRecording ? (
            <Square className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>

        {audioBlob && !isRecording && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={playRecording}
              disabled={isProcessing}
            >
              <Play className="h-4 w-4" />
            </Button>

            <Button
              onClick={handleAnalyze}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Pronunciation"
              )}
            </Button>
          </>
        )}
      </div>

      {isRecording && (
        <Progress value={volume} className="w-full h-2" />
      )}
    </div>
  );
} 