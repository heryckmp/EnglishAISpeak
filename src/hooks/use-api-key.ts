import { useState, useEffect } from "react";

export function useApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isKeySet, setIsKeySet] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem("openrouter_api_key");
    if (storedKey) {
      setApiKey(storedKey);
      setIsKeySet(true);
    }
  }, []);

  const setKey = (key: string) => {
    localStorage.setItem("openrouter_api_key", key);
    setApiKey(key);
    setIsKeySet(true);
  };

  const removeKey = () => {
    localStorage.removeItem("openrouter_api_key");
    setApiKey(null);
    setIsKeySet(false);
  };

  return { apiKey, isKeySet, setKey, removeKey };
} 