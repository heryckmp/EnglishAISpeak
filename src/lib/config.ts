interface Config {
  database: {
    url: string;
  };
  auth: {
    nextAuthUrl: string;
    nextAuthSecret: string;
    googleClientId: string;
    googleClientSecret: string;
    githubId: string;
    githubSecret: string;
  };
  openai: {
    apiKey: string;
  };
  openrouter: {
    apiKey: string;
    defaultModel: string;
  };
  llm: {
    provider: "openrouter" | "local" | "openai";
    localModels: {
      llama2: {
        enabled: boolean;
        apiUrl: string;
      };
      mistral: {
        enabled: boolean;
        apiUrl: string;
      };
      phi2: {
        enabled: boolean;
        apiUrl: string;
      };
    };
  };
  tts: {
    provider: "browser" | "coqui" | "mozilla";
    coquiUrl?: string;
    mozillaUrl?: string;
  };
  stt: {
    provider: "browser" | "vosk" | "whisper";
    voskUrl?: string;
    whisperUrl?: string;
  };
}

const config: Config = {
  database: {
    url: process.env.DATABASE_URL!,
  },
  auth: {
    nextAuthUrl: process.env.NEXTAUTH_URL!,
    nextAuthSecret: process.env.NEXTAUTH_SECRET!,
    googleClientId: process.env.GOOGLE_CLIENT_ID!,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    githubId: process.env.GITHUB_ID!,
    githubSecret: process.env.GITHUB_SECRET!,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
  },
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY!,
    defaultModel: "anthropic/claude-3-opus",
  },
  llm: {
    provider: process.env.LLM_PROVIDER as Config["llm"]["provider"] || "openrouter",
    localModels: {
      llama2: {
        enabled: process.env.ENABLE_LLAMA2 === "true",
        apiUrl: process.env.LLAMA2_API_URL || "http://localhost:8000",
      },
      mistral: {
        enabled: process.env.ENABLE_MISTRAL === "true",
        apiUrl: process.env.MISTRAL_API_URL || "http://localhost:8001",
      },
      phi2: {
        enabled: process.env.ENABLE_PHI2 === "true",
        apiUrl: process.env.PHI2_API_URL || "http://localhost:8002",
      },
    },
  },
  tts: {
    provider: process.env.TTS_PROVIDER as Config["tts"]["provider"] || "browser",
    coquiUrl: process.env.COQUI_TTS_URL,
    mozillaUrl: process.env.MOZILLA_TTS_URL,
  },
  stt: {
    provider: process.env.STT_PROVIDER as Config["stt"]["provider"] || "browser",
    voskUrl: process.env.VOSK_URL,
    whisperUrl: process.env.WHISPER_URL,
  },
};

// Validar configuração obrigatória
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GITHUB_ID',
  'GITHUB_SECRET',
];

// Validar variáveis condicionais
if (config.llm.provider === "openrouter") {
  requiredEnvVars.push('OPENROUTER_API_KEY');
} else if (config.llm.provider === "openai") {
  requiredEnvVars.push('OPENAI_API_KEY');
}

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export default config; 