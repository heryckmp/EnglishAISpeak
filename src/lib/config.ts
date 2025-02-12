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
  llm: {
    provider: "lmstudio" | "local";
    baseUrl: string;
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
  llm: {
    provider: (process.env.LLM_PROVIDER as Config["llm"]["provider"]) || "lmstudio",
    baseUrl: process.env.LM_STUDIO_BASE_URL || "http://localhost:1234/v1",
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

// Validar apenas em runtime, não durante o build
if (process.env.NODE_ENV !== 'production' && config.llm.provider === "lmstudio") {
  requiredEnvVars.push('LM_STUDIO_BASE_URL');
}

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export default config; 