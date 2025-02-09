"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UserStats {
  totalConversations: number;
  totalWritingExercises: number;
  wordsLearned: number;
  accuracyRate: number;
  practiceTime: number;
  level: string;
}

interface Activity {
  id: string;
  type: "chat" | "writing";
  title: string;
  date: string;
  score?: number;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");

  useEffect(() => {
    // Fetch user stats and activities
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/profile");
        const data = await response.json();
        if (response.ok) {
          setStats(data.stats);
          setActivities(data.activities);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    if (session?.user) {
      fetchUserData();
    }
  }, [session]);

  if (!session) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          {session.user.image && (
            <img
              src={session.user.image}
              alt={session.user.name || "Profile"}
              className="w-20 h-20 rounded-full"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold">{session.user.name}</h1>
            <p className="text-muted-foreground">{session.user.email}</p>
          </div>
        </div>

        {/* Level Badge */}
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary">
          <span className="text-sm font-medium">
            {stats?.level || "Intermediate"} Level
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === "overview" ? "default" : "outline"}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </Button>
        <Button
          variant={activeTab === "history" ? "default" : "outline"}
          onClick={() => setActiveTab("history")}
        >
          Learning History
        </Button>
      </div>

      {activeTab === "overview" ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-4">
              <div className="text-2xl mb-1">💬</div>
              <div className="text-sm font-medium text-muted-foreground">
                Conversations
              </div>
              <div className="text-2xl font-bold">
                {stats?.totalConversations || 0}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl mb-1">✍️</div>
              <div className="text-sm font-medium text-muted-foreground">
                Writing Exercises
              </div>
              <div className="text-2xl font-bold">
                {stats?.totalWritingExercises || 0}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl mb-1">📚</div>
              <div className="text-sm font-medium text-muted-foreground">
                Words Learned
              </div>
              <div className="text-2xl font-bold">{stats?.wordsLearned || 0}</div>
            </Card>
          </div>

          {/* Progress Section */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Learning Progress</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Accuracy Rate</span>
                  <span className="text-sm text-muted-foreground">
                    {stats?.accuracyRate || 0}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{
                      width: `${stats?.accuracyRate || 0}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Practice Time</span>
                  <span className="text-sm text-muted-foreground">
                    {stats?.practiceTime || 0} hours
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{
                      width: `${(stats?.practiceTime || 0) / 100 * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Achievement Badges */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Achievements</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["🎯", "🌟", "🏆", "📈"].map((emoji, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg"
                >
                  <span className="text-3xl mb-2">{emoji}</span>
                  <span className="text-sm font-medium">Coming Soon</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : (
        /* Learning History */
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <div>
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {activity.date}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {activity.type === "chat" ? "💬" : "✍️"}
                    {activity.score && (
                      <span className="text-sm font-medium">
                        Score: {activity.score}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No activities yet. Start practicing to see your history!
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
} 