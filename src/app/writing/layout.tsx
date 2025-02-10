import { Metadata } from "next";
import { SidebarNav } from "@/components/sidebar-nav";

export const metadata: Metadata = {
  title: "Writing Practice",
  description: "Practice your English writing skills with AI-powered feedback.",
};

const sidebarNavItems = [
  {
    title: "New Exercise",
    href: "/writing",
  },
  {
    title: "My Exercises",
    href: "/writing/exercises",
  },
  {
    title: "Progress",
    href: "/writing/progress",
  },
];

interface WritingLayoutProps {
  children: React.ReactNode;
}

export default function WritingLayout({ children }: WritingLayoutProps) {
  return (
    <div className="space-y-6 p-10 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Writing Practice</h2>
        <p className="text-muted-foreground">
          Improve your writing skills with personalized feedback and exercises.
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