import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user stats
    const statsResult = await query(
      `SELECT 
        (SELECT COUNT(*) FROM conversations WHERE user_id = $1) as total_conversations,
        (SELECT COUNT(*) FROM writing_exercises WHERE user_id = $1) as total_writing_exercises,
        (SELECT COUNT(*) FROM progress_tracking WHERE user_id = $1 AND category = 'words_learned') as words_learned,
        COALESCE(
          (SELECT value FROM progress_tracking 
           WHERE user_id = $1 AND category = 'accuracy_rate' 
           ORDER BY recorded_at DESC LIMIT 1),
          0
        ) as accuracy_rate,
        COALESCE(
          (SELECT value FROM progress_tracking 
           WHERE user_id = $1 AND category = 'practice_time' 
           ORDER BY recorded_at DESC LIMIT 1),
          0
        ) as practice_time,
        COALESCE(
          (SELECT level FROM users WHERE id = $1),
          'intermediate'
        ) as level`,
      [session.user.id]
    );

    // Fetch recent activities
    const activitiesResult = await query(
      `SELECT 
        'chat' as type,
        id,
        title,
        created_at as date
       FROM conversations 
       WHERE user_id = $1
       UNION ALL
       SELECT 
        'writing' as type,
        id,
        title,
        created_at as date
       FROM writing_exercises 
       WHERE user_id = $1
       ORDER BY date DESC
       LIMIT 10`,
      [session.user.id]
    );

    const stats = statsResult.rows[0];
    const activities = activitiesResult.rows.map(activity => ({
      ...activity,
      date: new Date(activity.date).toLocaleDateString(),
    }));

    return Response.json({
      stats: {
        totalConversations: parseInt(stats.total_conversations),
        totalWritingExercises: parseInt(stats.total_writing_exercises),
        wordsLearned: parseInt(stats.words_learned),
        accuracyRate: parseInt(stats.accuracy_rate),
        practiceTime: parseInt(stats.practice_time),
        level: stats.level,
      },
      activities,
    });
  } catch (error) {
    console.error("Profile API Error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 