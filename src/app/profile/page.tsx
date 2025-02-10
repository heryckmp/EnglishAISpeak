"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LearningStats } from "@/components/stats/learning-stats";
import { auth, signOut } from "@/lib/auth";
import { LogOut } from "lucide-react";

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
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Meu Perfil</h1>
          <Button
            variant="outline"
            onClick={() => signOut()}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas de Aprendizado</CardTitle>
            </CardHeader>
            <CardContent>
              <LearningStats />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 