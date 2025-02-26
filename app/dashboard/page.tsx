"use client";

import { useState } from "react";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModelSelector } from "@/components/model-selector";
import { ThemeToggle } from "@/components/theme-switcher";
import Link from "next/link";

const categories = [
  { id: "stem", name: "STEM", color: "bg-blue-500" },
  { id: "finbiz", name: "FinBiz", color: "bg-green-500" },
  { id: "social", name: "Social Sciences", color: "bg-yellow-500" },
  { id: "english", name: "English", color: "bg-purple-500" },
];

export default function Dashboard() {
  const [selectedModel, setSelectedModel] = useState("gpt-4");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md dark:bg-gray-900/80 border-b dark:border-gray-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <ModelSelector onModelChange={setSelectedModel} />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Register</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-8">
            <span className="bg-gradient-to-r from-blue-400 via-blue-600 to-blue-800 bg-clip-text text-transparent">
              rzn.AI
            </span>
          </h1>
          <p className="text-2xl mb-4">
            Deep Learning through{" "}
            <span className="text-blue-500 font-semibold">Voice Chat</span>
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-12 text-lg">
            AI-generated questions to test{" "}
            <span className="font-medium">comprehension</span> of learned
            concepts tailored for{" "}
            <span className="font-medium">deep reasoning</span>
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                className={`h-16 ${category.color} bg-opacity-10 hover:bg-opacity-20 border-2 border-opacity-20`}
              >
                <Mic className="mr-2 h-5 w-5" />
                {category.name}
              </Button>
            ))}
          </div>

          <Button
            size="lg"
            className="bg-gray-900 hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700"
            asChild
          >
            <Link href="/chat">Chat</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
