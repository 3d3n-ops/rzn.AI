"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, Sparkles, Loader2, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModelSelector } from "@/components/model-selector";
import { ThemeToggle } from "@/components/theme-switcher";
import Link from "next/link";

interface Message {
  id: number;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export default function DesmosPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content:
        "Hi! I'm Ryzn Desmos Visualizer. I can help you create beautiful math visualizations using Desmos. Describe the mathematical concept or equation you'd like to visualize, and I'll help you plot it.",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [desmosEquation, setDesmosEquation] = useState("y=6x^3-5x+4");
  const [desmosLoaded, setDesmosLoaded] = useState(false);
  const desmosRef = useRef<HTMLIFrameElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle Desmos iframe load
  useEffect(() => {
    const handleDesmosLoad = () => {
      setDesmosLoaded(true);
    };

    const iframe = desmosRef.current;
    if (iframe) {
      iframe.addEventListener("load", handleDesmosLoad);
      return () => {
        iframe.removeEventListener("load", handleDesmosLoad);
      };
    }
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Process the message and generate a response
    setTimeout(() => {
      const lowerInput = inputValue.toLowerCase();
      let equation = "y=x^2";
      let response =
        "I've plotted a basic parabola y = x² for you. You can modify the equation using the input field above the graph.";

      // Check for specific equation patterns
      if (lowerInput.includes("derivative") || lowerInput.includes("f'")) {
        equation = "f(x)=6x^3-5x+4\\nf'(x)=18x^2-5";
        response =
          "I've plotted the function f(x) = 6x³ - 5x + 4 and its derivative f'(x) = 18x² - 5. You can see how the derivative represents the slope of the original function.";
      } else if (
        lowerInput.includes("sin") ||
        lowerInput.includes("cos") ||
        lowerInput.includes("trigonometric")
      ) {
        equation = "y=\\sin(x)\\ny=\\cos(x)";
        response =
          "I've plotted the sine and cosine functions. Notice how they're related and how they oscillate between -1 and 1.";
      } else if (
        lowerInput.includes("quadratic") ||
        lowerInput.includes("parabola")
      ) {
        equation = "y=ax^2+bx+c\\na=1\\nb=0\\nc=0";
        response =
          "I've plotted a quadratic function y = ax² + bx + c with sliders for a, b, and c. Try adjusting the parameters to see how they affect the shape of the parabola.";
      } else if (lowerInput.includes("exponential")) {
        equation = "y=e^x\\ny=2^x";
        response =
          "I've plotted exponential functions y = e^x and y = 2^x. Notice how exponential functions grow rapidly as x increases.";
      } else if (
        lowerInput.includes("logarithm") ||
        lowerInput.includes("log")
      ) {
        equation = "y=\\ln(x)\\ny=\\log_{10}(x)";
        response =
          "I've plotted the natural logarithm (ln) and common logarithm (log base 10) functions. Notice how they grow very slowly as x increases.";
      }

      const botResponse: Message = {
        id: messages.length + 2,
        content: response,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
      setIsLoading(false);
      setDesmosEquation(equation);
    }, 1500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative">
      {/* Net Background Pattern with Blur */}
      <div className="absolute inset-0 z-0">
        {/* Net Background Pattern with Reduced Opacity */}
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
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="font-semibold text-lg">Desmos Graphing</h1>
          </div>
          <div className="flex items-center gap-4">
            <ModelSelector />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content - Two Column Layout */}
      <div className="pt-16 h-screen flex">
        {/* Left Column - Chat Interface */}
        <div className="w-1/3 border-r dark:border-gray-800 flex flex-col">
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="mb-6">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                      message.role === "assistant"
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <Sparkles className="h-4 w-4" />
                    ) : (
                      "U"
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm">
                        {message.role === "assistant"
                          ? "Ryzn Desmos Visualizer"
                          : "You"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm whitespace-pre-line">
                      {message.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">
                      Ryzn Desmos Visualizer
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(new Date())}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-500">
                      Generating graph...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t dark:border-gray-800">
            <form className="flex gap-2" onSubmit={handleSendMessage}>
              <Input
                placeholder="Describe the equation or concept to graph..."
                className="flex-1"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
              />
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading || !inputValue.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column - Desmos Graph */}
        <div className="w-2/3 flex flex-col">
          {/* Header */}
          <div className="border-b dark:border-gray-800 px-4 flex justify-between items-center h-12">
            <div className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              <span className="font-medium">Desmos Graphing Calculator</span>
            </div>
          </div>

          {/* Desmos Content */}
          <div className="flex-1 overflow-hidden">
            <div className="bg-white dark:bg-gray-800 h-full flex flex-col">
              <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-medium">Current Equation</h3>
                <div className="flex items-center gap-2">
                  <Input
                    value={desmosEquation}
                    onChange={(e) => setDesmosEquation(e.target.value)}
                    placeholder="Enter equation (e.g., y=x^2)"
                    className="w-64"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (
                        desmosRef.current &&
                        desmosRef.current.contentWindow
                      ) {
                        console.log("Updating equation:", desmosEquation);
                        // In a real implementation, we would use the Desmos API
                        try {
                          // Just a placeholder for demonstration
                          alert(`Equation updated: ${desmosEquation}`);
                        } catch (error) {
                          console.error(
                            "Error updating Desmos equation:",
                            error
                          );
                        }
                      }
                    }}
                  >
                    Update Graph
                  </Button>
                </div>
              </div>
              <div className="flex-1 relative">
                <iframe
                  ref={desmosRef}
                  src="https://www.desmos.com/calculator/ycaswggsgk?embed"
                  className="w-full h-full border-0"
                  title="Desmos Graphing Calculator"
                  allow="fullscreen"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  onLoad={() => {
                    console.log("Desmos iframe loaded");
                    setDesmosLoaded(true);
                  }}
                />
                {!desmosLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      <p>Loading Desmos Calculator...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
