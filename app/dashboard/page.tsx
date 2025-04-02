"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Brain,
  BookOpen,
  Calculator,
  ChevronRight,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ModelSelector } from "@/components/model-selector";
import { ThemeToggle } from "@/components/theme-switcher";
import { StatusBadge } from "@/components/status-badge";

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("Eden");

  const handleTakeNotes = () => {
    // Refresh the current view
    router.push("/notes");
  };

  const handleDeepLearn = () => {
    // Navigate to chat
    router.push("/chat");
  };

  const handleMathVisuals = () => {
    // Navigate to math visuals with a proper state reset
    router.push("/math-visuals");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative">
      {/* Net Background Pattern with Blur */}
      <div className="absolute inset-0 z-0">
        {/* Blurred overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/80 to-gray-100/80 dark:from-gray-900/80 dark:to-gray-800/80 backdrop-blur-[8px]"></div>

        {/* Net pattern with reduced opacity */}
        <div className="absolute inset-0 z-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern
              id="net-pattern"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 20 L40 20 M20 0 L20 40"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
            <rect width="100%" height="100%" fill="url(#net-pattern)" />
          </svg>
        </div>
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md dark:bg-gray-900/80 border-b dark:border-gray-800 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold">
            <span className="bg-gradient-to-r from-blue-400 via-blue-600 to-blue-800 bg-clip-text text-transparent">
              rzn.AI
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <ModelSelector />
            <ThemeToggle />
            <Button variant="outline" size="sm" className="gap-2">
              <User size={16} />
              <span>{userName}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-32 pb-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              What are you learning today?
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Choose from our learning tools to enhance your educational journey
            </p>
          </div>

          {/* Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Deep Learn Card */}
            <Card
              className="group hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] cursor-not-allowed opacity-70 overflow-hidden"
              onClick={() => {}}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all duration-300"></div>
              <div className="absolute top-4 right-4 z-10">
                <StatusBadge status="coming-soon" />
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  Deep Learn with Ryzn
                </CardTitle>
                <CardDescription>
                  Interactive AI-powered learning through conversation
                </CardDescription>
              </CardHeader>

              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Engage in deep conversations with our AI to understand complex
                  concepts through the Feynman technique.
                </p>
              </CardContent>

              <CardFooter className="flex justify-between items-center">
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  Coming soon
                </span>
                <ChevronRight className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
              </CardFooter>
            </Card>

            {/* Take Notes Card */}
            <Card
              className="group hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] cursor-pointer overflow-hidden"
              onClick={handleTakeNotes}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition-all duration-300"></div>
              <div className="absolute top-4 right-4 z-10">
                <StatusBadge status="live" />
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  Take Notes with Ryzn
                </CardTitle>
                <CardDescription>
                  AI-powered note-taking and organization
                </CardDescription>
              </CardHeader>

              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Transform lectures, videos, and readings into organized notes
                  with our AI assistant.
                </p>
              </CardContent>

              <CardFooter className="flex justify-between items-center">
                <span className="text-sm text-purple-600 dark:text-purple-400">
                  Organize your thoughts
                </span>
                <ChevronRight className="h-5 w-5 text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform" />
              </CardFooter>
            </Card>

            {/* Learn Math Card */}
            <Card
              className="group hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] cursor-not-allowed opacity-70 overflow-hidden"
              onClick={() => {}}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-green-500/20 transition-all duration-300"></div>
              <div className="absolute top-4 right-4 z-10">
                <StatusBadge status="coming-soon" />
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Calculator className="h-6 w-6 text-green-600 dark:text-green-400" />
                  Learn Math with Ryzn + Prometheus
                </CardTitle>
                <CardDescription>
                  Advanced mathematics learning platform
                </CardDescription>
              </CardHeader>

              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Master mathematics from algebra to calculus with our
                  specialized AI tutor and interactive exercises.
                </p>
              </CardContent>

              <CardFooter className="flex justify-between items-center">
                <span className="text-sm text-green-600 dark:text-green-400">
                  Coming soon
                </span>
                <ChevronRight className="h-5 w-5 text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-transform" />
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
