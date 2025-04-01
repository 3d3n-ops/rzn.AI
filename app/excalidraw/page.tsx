"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, ArrowLeft, Sparkles, Loader2, PenTool } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ModelSelector } from "@/components/model-selector"
import { ThemeToggle } from "@/components/theme-switcher"
import Link from "next/link"

interface Message {
  id: number
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export default function ExcalidrawPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content:
        "Hi! I'm Ryzn Excalidraw Assistant. I can help you create sketches, diagrams, and visual explanations for mathematical concepts. Describe what you'd like to draw or explain, and I'll guide you through using Excalidraw.",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [excalidrawLoaded, setExcalidrawLoaded] = useState(false)
  const excalidrawRef = useRef<HTMLIFrameElement>(null)

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Process the message and generate a response
    setTimeout(() => {
      const lowerInput = inputValue.toLowerCase()
      let response =
        "I've opened Excalidraw for you. You can use the drawing tools at the top to create your sketch. Try using the shapes, text, and arrow tools to illustrate your concept."

      if (lowerInput.includes("triangle")) {
        response =
          "To draw a triangle in Excalidraw, select the line tool from the toolbar and draw three connected lines. You can also use the shape tool and select the triangle option. Try adding labels to the vertices and angles."
      } else if (lowerInput.includes("circle") || lowerInput.includes("ellipse")) {
        response =
          "To draw a circle in Excalidraw, select the ellipse tool from the toolbar. Hold Shift while drawing to create a perfect circle. You can add labels for the center, radius, and circumference."
      } else if (lowerInput.includes("graph") || lowerInput.includes("coordinate")) {
        response =
          "To create a coordinate system, first draw two perpendicular lines for the x and y axes. Add arrow tips using the arrow tool. Then use the grid background option in the settings menu to help align your points and functions."
      } else if (lowerInput.includes("function") || lowerInput.includes("curve")) {
        response =
          "To sketch a function curve, you can use the freehand drawing tool for a rough sketch, or the curve tool for smoother lines. Start by drawing your coordinate axes, then add your function curve. Label key points like intercepts and extrema."
      } else if (lowerInput.includes("diagram") || lowerInput.includes("flowchart")) {
        response =
          "For creating a flowchart or diagram, use the rectangle tool for process boxes, the diamond shape for decision points, and arrows to connect them. You can add text inside each shape to describe the steps."
      }

      const botResponse: Message = {
        id: messages.length + 2,
        content: response,
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botResponse])
      setIsLoading(false)
    }, 1500)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative">
      {/* Net Background Pattern with Blur */}
      <div className="absolute inset-0 z-0">
        {/* Net Background Pattern with Reduced Opacity */}
        <div className="absolute inset-0 z-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="net-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 20 L40 20 M20 0 L20 40" stroke="currentColor" strokeWidth="0.5" />
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
            <h1 className="font-semibold text-lg">Excalidraw Sketching</h1>
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
                        ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {message.role === "assistant" ? <Sparkles className="h-4 w-4" /> : "U"}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm">
                        {message.role === "assistant" ? "Ryzn Excalidraw Assistant" : "You"}
                      </span>
                      <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                    </div>
                    <div className="text-sm whitespace-pre-line">{message.content}</div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300 flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">Ryzn Excalidraw Assistant</span>
                    <span className="text-xs text-gray-500">{formatTime(new Date())}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-500">Thinking...</span>
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
                placeholder="Ask how to draw something or explain a concept..."
                className="flex-1"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
              />
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isLoading || !inputValue.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column - Excalidraw */}
        <div className="w-2/3 flex flex-col">
          {/* Header */}
          <div className="border-b dark:border-gray-800 px-4 flex justify-between items-center h-12">
            <div className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              <span className="font-medium">Excalidraw Whiteboard</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (excalidrawRef.current && excalidrawRef.current.contentWindow) {
                  // In a real implementation, we would use the Excalidraw API
                  try {
                    // Just a placeholder for demonstration
                    alert("Canvas cleared!")
                  } catch (error) {
                    console.error("Error clearing Excalidraw canvas:", error)
                  }
                }
              }}
            >
              Clear Canvas
            </Button>
          </div>

          {/* Excalidraw Content */}
          <div className="flex-1 overflow-hidden">
            <div className="bg-white dark:bg-gray-800 h-full flex flex-col">
              <div className="flex-1 relative">
                <iframe
                  ref={excalidrawRef}
                  src="https://excalidraw.com/"
                  className="w-full h-full border-0"
                  title="Excalidraw Whiteboard"
                  allow="fullscreen"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  onLoad={() => {
                    console.log("Excalidraw iframe loaded")
                    setExcalidrawLoaded(true)
                  }}
                />
                {!excalidrawLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                      <p>Loading Excalidraw Whiteboard...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


