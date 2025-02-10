interface Config {
  database: {
    user: string;
    password: string;
    host: string;
    port: number;
    database: string;
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
    apiKey: string | (() => string);
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

const getApiKey = () => {
  if (typeof window !== "undefined") {
    return window.localStorage.getItem("openrouter_api_key") || "";
  }
  return "";
};

const config: Config = {
  database: {
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "postgres",
    host: process.env.POSTGRES_HOST || "localhost",
    port: parseInt(process.env.POSTGRES_PORT || "5432"),
    database: process.env.POSTGRES_DB || "english_ai_trainer",
  },
  auth: {
    nextAuthUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
    nextAuthSecret: process.env.NEXTAUTH_SECRET || "",
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    githubId: process.env.GITHUB_ID || "",
    githubSecret: process.env.GITHUB_SECRET || "",
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
  },
  openrouter: {
    apiKey: getApiKey,
    defaultModel: "anthropic/claude-3-opus",
  },
  llm: {
    provider: "openrouter" as const,
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
    provider: "browser" as const,
    coquiUrl: process.env.COQUI_TTS_URL,
    mozillaUrl: process.env.MOZILLA_TTS_URL,
  },
  stt: {
    provider: "browser" as const,
    voskUrl: process.env.VOSK_URL,
    whisperUrl: process.env.WHISPER_URL,
  },
};

// Validar configuração obrigatória
const requiredEnvVars = [
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