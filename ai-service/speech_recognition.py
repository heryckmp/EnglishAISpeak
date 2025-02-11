import torch
import whisper
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from io import BytesIO
import soundfile as sf

# Carregar modelo Whisper
print("Loading Whisper model...")
model = whisper.load_model("base")
print("Whisper model loaded successfully!")

class TranscriptionSegment(BaseModel):
    text: str
    start: float
    end: float
    confidence: float

class TranscriptionResult(BaseModel):
    text: str
    language: str
    confidence: float
    segments: Optional[List[TranscriptionSegment]] = None

async def process_audio(file: UploadFile) -> bytes:
    # Ler o arquivo de áudio
    contents = await file.read()
    audio_bytes = BytesIO(contents)
    
    # Converter para formato que o Whisper aceita
    audio_data, sample_rate = sf.read(audio_bytes)
    if len(audio_data.shape) > 1:
        audio_data = audio_data.mean(axis=1)  # Converter para mono se for stereo
    
    return audio_data

async def transcribe_audio(audio_data: np.ndarray) -> TranscriptionResult:
    # Transcrever o áudio
    result = model.transcribe(audio_data)
    
    # Processar segmentos
    segments = []
    for segment in result["segments"]:
        segments.append(TranscriptionSegment(
            text=segment["text"],
            start=segment["start"],
            end=segment["end"],
            confidence=segment.get("confidence", 1.0)
        ))
    
    # Calcular confiança média
    confidence = sum(s.confidence for s in segments) / len(segments) if segments else 1.0
    
    return TranscriptionResult(
        text=result["text"],
        language=result["language"],
        confidence=confidence,
        segments=segments
    )

def setup_routes(app: FastAPI):
    @app.post("/transcribe", response_model=TranscriptionResult)
    async def transcribe_endpoint(audio: UploadFile = File(...)):
        try:
            audio_data = await process_audio(audio)
            result = await transcribe_audio(audio_data)
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/detect-language")
    async def detect_language_endpoint(audio: UploadFile = File(...)):
        try:
            audio_data = await process_audio(audio)
            # Usar apenas os primeiros 30 segundos para detecção de idioma
            audio_data = audio_data[:int(30 * 16000)]
            result = model.detect_language(audio_data)
            return {"language": result} 