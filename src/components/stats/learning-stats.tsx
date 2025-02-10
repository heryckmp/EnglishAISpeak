"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Brain,
  Clock,
  MessageSquare,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useProgress } from "@/hooks/use-progress";

interface LevelStats {
  level: string;
  conversations: number;
  points: number;
}

interface UserStats {
  words_learned: number;
  total_minutes: number;
  avg_accuracy: number;
  total_conversations: number;
  total_messages: number;
  last_practice: string;
  level_stats: LevelStats[];
}

export function LearningStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { progress } = useProgress();

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/profile/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }
        const data = await response.json();
        setStats(data.stats);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [progress]);

  if (loading) {
    return <div>Carregando estatísticas...</div>;
  }

  if (!stats) {
    return <div>Nenhuma estatística disponível.</div>;
  }

  const lastPracticeDate = new Date(stats.last_practice);
  const lastPracticeFormatted = formatDistanceToNow(lastPracticeDate, {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Palavras Aprendidas
          </CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.words_learned}</div>
          <p className="text-xs text-muted-foreground">
            palavras únicas utilizadas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Tempo de Prática
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(stats.total_minutes)} min
          </div>
          <p className="text-xs text-muted-foreground">
            tempo total de estudo
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Taxa de Acerto
          </CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(stats.avg_accuracy * 100)}%
          </div>
          <p className="text-xs text-muted-foreground">
            média de acertos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Conversas
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.total_conversations}
          </div>
          <p className="text-xs text-muted-foreground">
            conversas realizadas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Mensagens Trocadas
          </CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_messages}</div>
          <p className="text-xs text-muted-foreground">
            última prática {lastPracticeFormatted}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pontos por Nível
          </CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.level_stats.map((level) => (
              <div
                key={level.level}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-medium">{level.level}</span>
                <span className="text-muted-foreground">
                  {level.points} pts
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 