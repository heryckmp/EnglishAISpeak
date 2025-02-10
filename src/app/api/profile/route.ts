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
    const stats = await query({
      query: `SELECT 
        (SELECT COUNT(*) FROM conversations WHERE user_id = ?) as total_conversations,
        (SELECT COUNT(*) FROM writing_exercises WHERE user_id = ?) as total_writing_exercises,
        (SELECT COUNT(*) FROM progress_tracking WHERE user_id = ? AND category = 'words_learned') as words_learned,
        COALESCE(
          (SELECT value FROM progress_tracking 
           WHERE user_id = ? AND category = 'accuracy_rate' 
           ORDER BY recorded_at DESC LIMIT 1),
          0
        ) as accuracy_rate,
        COALESCE(
          (SELECT value FROM progress_tracking 
           WHERE user_id = ? AND category = 'practice_time' 
           ORDER BY recorded_at DESC LIMIT 1),
          0
        ) as practice_time,
        COALESCE(
          (SELECT level FROM users WHERE id = ?),
          'intermediate'
        ) as level`,
      values: Array(6).fill(session.user.id)
    });

    // Fetch recent activities
    const activities = await query({
      query: `SELECT 
        'chat' as type,
        id,
        title,
        created_at as date
       FROM conversations 
       WHERE user_id = ?
       UNION ALL
       SELECT 
        'writing' as type,
        id,
        title,
        created_at as date
       FROM writing_exercises 
       WHERE user_id = ?
       ORDER BY date DESC
       LIMIT 10`,
      values: [session.user.id, session.user.id]
    });

    const formattedActivities = activities.map(activity => ({
      ...activity,
      date: new Date(activity.date).toLocaleDateString(),
    }));

    return Response.json({
      stats: {
        totalConversations: parseInt(stats[0].total_conversations),
        totalWritingExercises: parseInt(stats[0].total_writing_exercises),
        wordsLearned: parseInt(stats[0].words_learned),
        accuracyRate: parseInt(stats[0].accuracy_rate),
        practiceTime: parseInt(stats[0].practice_time),
        level: stats[0].level,
      },
      activities: formattedActivities,
    });
  } catch (error) {
    console.error("Profile API Error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 