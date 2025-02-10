import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SidebarNav } from "@/components/sidebar-nav";

const sidebarNavItems = [
  {
    title: "Practice",
    href: "/pronunciation-practice",
  },
  {
    title: "Exercises",
    href: "/pronunciation-practice/exercises",
  },
  {
    title: "Progress",
    href: "/pronunciation-practice/progress",
  },
];

interface PronunciationPracticeLayoutProps {
  children: React.ReactNode;
}

export default async function PronunciationPracticeLayout({
  children,
}: PronunciationPracticeLayoutProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="space-y-6 p-10 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Pronunciation Practice</h2>
        <p className="text-muted-foreground">
          Improve your English pronunciation with interactive exercises and real-time feedback.
        </p>
      </div>
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
} 