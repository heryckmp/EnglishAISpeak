import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Master English with AI
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Practice conversations, improve your writing, and enhance your English skills with our AI-powered platform.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/auth/signin">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/test">
                <Button variant="outline" size="lg">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Chat Practice</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Engage in natural conversations with our AI to improve your speaking skills.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Writing Assistant</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Get real-time feedback on your writing with grammar and style suggestions.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Progress Tracking</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Monitor your improvement with detailed progress analytics and insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Ready to improve your English?
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                Join thousands of learners who are enhancing their English skills with AI assistance.
              </p>
            </div>
            <Link href="/auth/signin">
              <Button size="lg">Start Learning Now</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 