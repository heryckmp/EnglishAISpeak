import { useEffect, useRef } from "react";

export function usePracticeTime() {
  const startTimeRef = useRef<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Iniciar contagem de tempo
    startTimeRef.current = new Date();

    // Enviar tempo a cada 5 minutos
    intervalRef.current = setInterval(async () => {
      if (!startTimeRef.current) return;

      const now = new Date();
      const minutes = Math.floor(
        (now.getTime() - startTimeRef.current.getTime()) / (1000 * 60)
      );

      if (minutes >= 1) {
        try {
          const response = await fetch("/api/profile/practice-time", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ minutes }),
          });

          if (response.ok) {
            // Reiniciar contagem
            startTimeRef.current = now;
          }
        } catch (error) {
          console.error("Failed to update practice time:", error);
        }
      }
    }, 5 * 60 * 1000); // 5 minutos

    // Limpar intervalo e enviar tempo final
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (startTimeRef.current) {
        const now = new Date();
        const minutes = Math.floor(
          (now.getTime() - startTimeRef.current.getTime()) / (1000 * 60)
        );

        if (minutes >= 1) {
          fetch("/api/profile/practice-time", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ minutes }),
          }).catch((error) => {
            console.error("Failed to update final practice time:", error);
          });
        }
      }
    };
  }, []);
} 