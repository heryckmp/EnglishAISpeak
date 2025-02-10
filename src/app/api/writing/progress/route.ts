import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { startOfDay, subDays } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get total exercises and average score
    const [stats] = await query({
      query: `
        SELECT
          COUNT(*) as total_exercises,
          AVG(
            CASE
              WHEN analysis IS NOT NULL
              THEN JSON_EXTRACT(analysis, '$.overallScore')
              ELSE NULL
            END
          ) as average_score
        FROM writing_exercises
        WHERE user_id = ?
      `,
      values: [session.user.id],
    });

    // Get topic distribution
    const topics = await query({
      query: `
        SELECT
          topic,
          COUNT(*) as count
        FROM writing_exercises
        WHERE user_id = ? AND topic IS NOT NULL
        GROUP BY topic
      `,
      values: [session.user.id],
    });

    // Get recent progress (last 30 days)
    const thirtyDaysAgo = startOfDay(subDays(new Date(), 30));
    const recentProgress = await query({
      query: `
        SELECT
          DATE(created_at) as date,
          AVG(
            CASE
              WHEN analysis IS NOT NULL
              THEN JSON_EXTRACT(analysis, '$.overallScore')
              ELSE NULL
            END
          ) as average_score,
          COUNT(*) as exercises_completed
        FROM writing_exercises
        WHERE user_id = ? AND created_at >= ?
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      values: [session.user.id, thirtyDaysAgo],
    });

    // Format topic distribution
    const topicDistribution: Record<string, number> = {};
    topics.forEach((topic: any) => {
      topicDistribution[topic.topic] = topic.count;
    });

    // Format progress data
    const progress = {
      totalExercises: stats.total_exercises,
      averageScore: stats.average_score || 0,
      topicDistribution,
      recentProgress: recentProgress.map((day: any) => ({
        date: day.date,
        averageScore: day.average_score || 0,
        exercisesCompleted: day.exercises_completed,
      })),
    };

    return Response.json({ progress });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 