"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface VoiceSettingsProps {
  onSettingsChange: (settings: VoiceSettings) => void;
  defaultSettings?: VoiceSettings;
}

export interface VoiceSettings {
  accent: string;
  speed: number;
  pitch: number;
  volume: number;
}

const ACCENTS = {
  "en-US": "American",
  "en-GB": "British",
  "en-AU": "Australian",
  "en-CA": "Canadian",
  "en-IE": "Irish",
  "en-NZ": "New Zealand",
};

export function VoiceSettings({ onSettingsChange, defaultSettings }: VoiceSettingsProps) {
  const [settings, setSettings] = useState<VoiceSettings>(defaultSettings || {
    accent: "en-US",
    speed: 1,
    pitch: 1,
    volume: 1,
  });

  const handleSettingChange = (key: keyof VoiceSettings, value: string | number) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-medium">Voice Settings</h3>

      {/* Accent Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Accent</label>
        <Select
          value={settings.accent}
          onValueChange={(value) => handleSettingChange("accent", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select accent" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ACCENTS).map(([code, name]) => (
              <SelectItem key={code} value={code}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Speed Control */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Speed</label>
        <div className="flex items-center space-x-2">
          <Slider
            value={[settings.speed]}
            min={0.5}
            max={2}
            step={0.1}
            onValueChange={([value]) => handleSettingChange("speed", value)}
          />
          <span className="text-sm w-12">{settings.speed}x</span>
        </div>
      </div>

      {/* Pitch Control */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Pitch</label>
        <div className="flex items-center space-x-2">
          <Slider
            value={[settings.pitch]}
            min={0.5}
            max={2}
            step={0.1}
            onValueChange={([value]) => handleSettingChange("pitch", value)}
          />
          <span className="text-sm w-12">{settings.pitch}x</span>
        </div>
      </div>

      {/* Volume Control */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Volume</label>
        <div className="flex items-center space-x-2">
          <Slider
            value={[settings.volume]}
            min={0}
            max={1}
            step={0.1}
            onValueChange={([value]) => handleSettingChange("volume", value)}
          />
          <span className="text-sm w-12">{Math.round(settings.volume * 100)}%</span>
        </div>
      </div>

      {/* Reset Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const defaultSettings = {
            accent: "en-US",
            speed: 1,
            pitch: 1,
            volume: 1,
          };
          setSettings(defaultSettings);
          onSettingsChange(defaultSettings);
        }}
      >
        Reset to Default
      </Button>
    </Card>
  );
} 