from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv
import json

load_dotenv()

app = FastAPI()

class ChatRequest(BaseModel):
    message: str
    level: str = "intermediate"
    previous_messages: list = []

class ChatResponse(BaseModel):
    message: str

class WritingRequest(BaseModel):
    text: str
    level: str = "intermediate"

class WritingAnalysis(BaseModel):
    grammarScore: float
    vocabularyScore: float
    coherenceScore: float
    overallScore: float
    corrections: list
    suggestions: list
    feedback: str

# LM Studio Configuration
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "lmstudio")
LLM_API_URL = os.getenv("LLM_API_URL", "http://localhost:1234/v1")
LMSTUDIO_CONTEXT_LENGTH = int(os.getenv("LMSTUDIO_CONTEXT_LENGTH", "4096"))
LMSTUDIO_MAX_TOKENS = int(os.getenv("LMSTUDIO_MAX_TOKENS", "2048"))
LMSTUDIO_TEMPERATURE = float(os.getenv("LMSTUDIO_TEMPERATURE", "0.7"))
LMSTUDIO_TOP_P = float(os.getenv("LMSTUDIO_TOP_P", "0.95"))

async def get_lmstudio_response(prompt: str) -> str:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{LLM_API_URL}/chat/completions",
                json={
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": LMSTUDIO_TEMPERATURE,
                    "max_tokens": LMSTUDIO_MAX_TOKENS,
                    "top_p": LMSTUDIO_TOP_P
                }
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erro ao chamar LM Studio: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    # Construir o prompt em português
    prompt = f"""Você é um professor de inglês amigável e paciente. O nível de inglês do aluno é {request.level}.
    
    Histórico da conversa: {request.previous_messages}
    
    Aluno: {request.message}
    
    Por favor, responda naturalmente em inglês, corrija quaisquer erros e ajude o aluno a melhorar.
    Forneça explicações em português quando necessário, especialmente ao corrigir erros.
    
    Formato da resposta:
    1. Resposta em inglês
    2. [Correções] (se houver erros)
    3. [Dicas em português] (sugestões de melhoria)
    """

    if LLM_PROVIDER == "lmstudio":
        response = await get_lmstudio_response(prompt)
    else:
        raise HTTPException(status_code=400, detail="Provedor LLM não suportado")

    return ChatResponse(message=response)

@app.post("/writing/analyze", response_model=WritingAnalysis)
async def analyze_writing(request: WritingRequest):
    prompt = f"""Você é um assistente avançado de escrita em inglês. Analise o seguinte texto escrito por um aluno de nível {request.level}.
    
    Texto para analisar: "{request.text}"
    
    Forneça uma análise detalhada no seguinte formato JSON:
    {{
        "grammarScore": (número entre 0-100),
        "vocabularyScore": (número entre 0-100),
        "coherenceScore": (número entre 0-100),
        "overallScore": (número entre 0-100),
        "corrections": [
            {{
                "original": "texto incorreto",
                "suggestion": "texto corrigido",
                "explanation": "explicação em português do por que esta correção é necessária",
                "type": "gramática|vocabulário|estilo",
                "severity": "baixa|média|alta"
            }}
        ],
        "suggestions": [
            {{
                "category": "vocabulário|estrutura|estilo",
                "text": "sugestão de melhoria em português"
            }}
        ],
        "feedback": "feedback detalhado em português com avaliação geral e dicas de melhoria"
    }}
    
    Foque em fornecer feedback construtivo e explicações claras em português para as melhorias.
    """

    try:
        response = await get_lmstudio_response(prompt)
        # Parse da resposta como JSON
        analysis = json.loads(response)
        return WritingAnalysis(**analysis)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Falha ao analisar resposta")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/writing/improve")
async def improve_writing(request: WritingRequest):
    prompt = f"""Você é um assistente avançado de escrita em inglês. Melhore o seguinte texto escrito por um aluno de nível {request.level}.
    
    Texto para melhorar: "{request.text}"
    
    Por favor, forneça:
    1. Uma versão melhorada do texto em inglês
    2. Lista em português das melhorias específicas feitas
    3. Sugestões em português para aprimoramento adicional
    
    Formate sua resposta de maneira clara e estruturada em português.
    """

    try:
        response = await get_lmstudio_response(prompt)
        return {"improved_text": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/model")
async def get_model_info():
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{LLM_API_URL}/models")
            if response.ok:
                models = response.json()
                if models and len(models) > 0:
                    current_model = models[0]  # LM Studio geralmente usa o primeiro modelo carregado
                    return {
                        "name": current_model.get("id", "Unknown"),
                        "type": "LM Studio Model",
                        "parameters": current_model.get("parameters", "Unknown"),
                        "contextLength": current_model.get("context_length", LMSTUDIO_CONTEXT_LENGTH)
                    }
            return {
                "name": "LM Studio Model",
                "type": "Unknown",
                "contextLength": LMSTUDIO_CONTEXT_LENGTH
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter informações do modelo: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 