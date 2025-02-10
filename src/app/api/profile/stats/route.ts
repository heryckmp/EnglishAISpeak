import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Buscar estatísticas do usuário
    const result = await query(
      `WITH user_stats AS (
        -- Total de palavras únicas usadas
        SELECT COUNT(DISTINCT word) as words_learned
        FROM (
          SELECT regexp_split_to_table(content, '\\s+') as word
          FROM messages
          WHERE user_id = $1 AND role = 'user'
        ) words
      ),
      practice_time AS (
        -- Tempo total de prática (em minutos)
        SELECT COALESCE(SUM(value), 0) as total_minutes
        FROM progress_tracking
        WHERE user_id = $1 AND category = 'practice_time'
      ),
      accuracy AS (
        -- Taxa de acerto média
        SELECT COALESCE(AVG(value), 0) as avg_accuracy
        FROM progress_tracking
        WHERE user_id = $1 AND category = 'accuracy_rate'
      ),
      conversation_stats AS (
        -- Estatísticas de conversas
        SELECT 
          COUNT(DISTINCT c.id) as total_conversations,
          COUNT(m.id) as total_messages,
          MAX(c.created_at) as last_practice
        FROM conversations c
        LEFT JOIN messages m ON c.id = m.conversation_id
        WHERE c.user_id = $1
      ),
      level_progress AS (
        -- Progresso por nível
        SELECT 
          level,
          COUNT(*) as conversations,
          SUM(
            CASE 
              WHEN context = 'voice' THEN 2
              ELSE 1
            END
          ) as points
        FROM conversations
        WHERE user_id = $1
        GROUP BY level
      )
      SELECT
        s.words_learned,
        pt.total_minutes,
        a.avg_accuracy,
        cs.total_conversations,
        cs.total_messages,
        cs.last_practice,
        json_agg(
          json_build_object(
            'level', lp.level,
            'conversations', lp.conversations,
            'points', lp.points
          )
        ) as level_stats
      FROM user_stats s
      CROSS JOIN practice_time pt
      CROSS JOIN accuracy a
      CROSS JOIN conversation_stats cs
      LEFT JOIN level_progress lp ON true
      GROUP BY 
        s.words_learned,
        pt.total_minutes,
        a.avg_accuracy,
        cs.total_conversations,
        cs.total_messages,
        cs.last_practice`,
      [session.user.id]
    );

    return Response.json({ stats: result.rows[0] });
  } catch (error) {
    console.error("Failed to fetch user stats:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 