from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uvicorn
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from speech_recognition import setup_routes

app = FastAPI()

# Configurações do modelo
MODEL_NAME = "microsoft/phi-2"  # Modelo leve que pode rodar localmente
MAX_LENGTH = 1000
DEFAULT_TEMPERATURE = 0.7

# Carregar modelo e tokenizer
print("Loading model and tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float16,
    device_map="auto",
)
print("Model loaded successfully!")

class GenerateRequest(BaseModel):
    prompt: str
    temperature: Optional[float] = DEFAULT_TEMPERATURE
    maxTokens: Optional[int] = MAX_LENGTH
    topP: Optional[float] = 0.95
    repetitionPenalty: Optional[float] = 1.1

class GenerateResponse(BaseModel):
    text: str
    usage: Dict[str, int]

@app.post("/generate", response_model=GenerateResponse)
async def generate_text(request: GenerateRequest):
    try:
        # Tokenizar o prompt
        inputs = tokenizer(request.prompt, return_tensors="pt").to(model.device)
        input_length = len(inputs.input_ids[0])

        # Gerar resposta
        outputs = model.generate(
            inputs.input_ids,
            max_length=input_length + request.maxTokens,
            temperature=request.temperature,
            top_p=request.topP,
            repetition_penalty=request.repetitionPenalty,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id,
        )

        # Decodificar a resposta
        generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        response_text = generated_text[len(request.prompt):].strip()

        # Calcular uso de tokens
        usage = {
            "promptTokens": input_length,
            "completionTokens": len(outputs[0]) - input_length,
            "totalTokens": len(outputs[0]),
        }

        return GenerateResponse(text=response_text, usage=usage)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Configurar rotas de reconhecimento de voz
setup_routes(app)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 