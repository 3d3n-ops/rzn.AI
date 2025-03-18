"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, BookOpen, Calculator, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "../components/Header";

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("Eden");

  const handleTakeNotes = () => {
    // Navigate to notes
    router.push("/notes");
  };

  const handleDeepLearn = () => {
    // Navigate to chat
    router.push("/chat");
  };

  return (
    <div className="min-h-screen relative">
      <Header />

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
              className="group hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] cursor-pointer overflow-hidden"
              onClick={handleDeepLearn}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all duration-300"></div>

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
                  Start learning
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
            <Card className="group hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] cursor-pointer overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-green-500/20 transition-all duration-300"></div>

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
                  Solve problems
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
