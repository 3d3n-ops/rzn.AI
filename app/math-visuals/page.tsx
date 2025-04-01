"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, ArrowLeft, Copy, Check, Code, Play, Sparkles, Loader2, Video, LineChart, PenTool } from "lucide-react"
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

export default function MathVisualsPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content:
        "Hi! I'm Ryzn Math Visualizer. I can help you create beautiful math visualizations using Manim, Desmos, or Excalidraw. Describe the mathematical concept you'd like to visualize, and I'll generate the appropriate visualization for you.",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("preview")
  const [copiedCode, setCopiedCode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentManimCode, setCurrentManimCode] = useState("")
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [desmosEquation, setDesmosEquation] = useState("y=6x^3-5x+4")
  const [desmosLoaded, setDesmosLoaded] = useState(false)
  const desmosRef = useRef<HTMLIFrameElement>(null)
  const excalidrawRef = useRef<HTMLIFrameElement>(null)

  // Debug function to help diagnose tab issues
  const debugTabs = (message: string, data?: any) => {
    console.log(`[TABS DEBUG] ${message}`, data || "")
  }

  // Add this useEffect to initialize tabs properly
  useEffect(() => {
    debugTabs("Component mounted, setting up tabs")

    // Force a re-render of the tabs after a short delay
    const timer = setTimeout(() => {
      debugTabs("Forcing tab refresh")
      setActiveTab((prev) => {
        debugTabs(`Current tab: ${prev}, refreshing...`)
        return prev
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Add this function to handle manual tab switching
  const forceTabSwitch = (tabValue: string) => {
    debugTabs(`Manually switching to tab: ${tabValue}`)
    setActiveTab(tabValue)

    // Add a small delay and then check if the tab actually changed
    setTimeout(() => {
      debugTabs(`Current tab after manual switch: ${activeTab}`)
      if (activeTab !== tabValue) {
        debugTabs("Tab didn't switch properly, forcing update")
        setActiveTab(tabValue)
      }
    }, 100)
  }

  // Sample Manim code for demonstration
  const sampleManimCode = `from manim import *

class DerivativeVisualization(Scene):
    def construct(self):
        # Create the axes
        axes = Axes(
            x_range=[-3, 3, 1],
            y_range=[-5, 20, 5],
            axis_config={"color": BLUE},
        )
        
        # Add labels to the axes
        x_label = axes.get_x_axis_label("x")
        y_label = axes.get_y_axis_label("f(x)")
        
        # Create the original function f(x) = 6x^3 - 5x + 4
        original_func = lambda x: 6*x**3 - 5*x + 4
        original_graph = axes.plot(original_func, color=BLUE)
        original_label = MathTex("f(x) = 6x^3 - 5x + 4").next_to(axes, UP)
        
        # Create the derivative function f'(x) = 18x^2 - 5
        derivative_func = lambda x: 18*x**2 - 5
        derivative_graph = axes.plot(derivative_func, color=GREEN)
        derivative_label = MathTex("f'(x) = 18x^2 - 5").next_to(original_label, DOWN)
        
        # Add everything to the scene
        self.play(Create(axes), Write(x_label), Write(y_label))
        self.play(Write(original_label))
        self.play(Create(original_graph))
        self.wait(1)
        
        # Show the derivative
        self.play(Write(derivative_label))
        self.play(Create(derivative_graph))
        self.wait(1)
        
        # Show tangent lines at different points
        for x in [-2, -1, 0, 1, 2]:
            point = axes.c2p(x, original_func(x))
            slope = derivative_func(x)
            tangent_line = TangentLine(original_graph, x, color=RED)
            
            # Add a dot at the point of tangency
            dot = Dot(point, color=YELLOW)
            
            # Show the slope value
            slope_text = MathTex(f"\\text{{Slope}} = {slope:.1f}").next_to(dot, UP)
            
            self.play(Create(dot), Create(tangent_line), Write(slope_text))
            self.wait(0.5)
            self.play(FadeOut(dot), FadeOut(tangent_line), FadeOut(slope_text))
        
        self.wait(2)`

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Initialize animation on page load
  useEffect(() => {
    // Simulate initial animation loading
    const timer = setTimeout(() => {
      if (!videoReady && !isGeneratingVideo && !currentManimCode) {
        setCurrentManimCode(sampleManimCode)
        setIsGeneratingVideo(true)

        setTimeout(() => {
          setIsGeneratingVideo(false)
          setVideoReady(true)
        }, 3000)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [videoReady, isGeneratingVideo, currentManimCode])

  // Handle Desmos iframe load
  useEffect(() => {
    const handleDesmosLoad = () => {
      setDesmosLoaded(true)
    }

    const iframe = desmosRef.current
    if (iframe) {
      iframe.addEventListener("load", handleDesmosLoad)
      return () => {
        iframe.removeEventListener("load", handleDesmosLoad)
      }
    }
  }, [])

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

    // Check if the message is about Desmos or Excalidraw
    const lowerInput = inputValue.toLowerCase()
    if (lowerInput.includes("desmos") || lowerInput.includes("graph") || lowerInput.includes("plot")) {
      // Handle Desmos-related request
      setTimeout(() => {
        const botResponse: Message = {
          id: messages.length + 2,
          content:
            "I've opened the Desmos graphing calculator for you. I've plotted the function f(x) = 6x³ - 5x + 4 and its derivative f'(x) = 18x² - 5. You can interact with the graph directly in the Desmos tab.",
          role: "assistant",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botResponse])
        setIsLoading(false)
        setActiveTab("desmos")
        setDesmosEquation("f(x)=6x^3-5x+4\\nf'(x)=18x^2-5")
      }, 2000)
    } else if (lowerInput.includes("excalidraw") || lowerInput.includes("draw") || lowerInput.includes("sketch")) {
      // Handle Excalidraw-related request
      setTimeout(() => {
        const botResponse: Message = {
          id: messages.length + 2,
          content:
            "I've opened Excalidraw for you. You can use this space to sketch mathematical concepts, create diagrams, or collaborate on problem-solving. The drawing tools are available in the toolbar at the top.",
          role: "assistant",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botResponse])
        setIsLoading(false)
        setActiveTab("excalidraw")
      }, 2000)
    } else {
      // Default to Manim visualization
      setTimeout(() => {
        const botResponse: Message = {
          id: messages.length + 2,
          content:
            "I'll create a visualization for the derivative of f(x) = 6x³ - 5x + 4 using Manim. The visualization will show both the original function and its derivative f'(x) = 18x² - 5, along with tangent lines at various points to illustrate the relationship between the function and its derivative.\n\nI've generated the Manim code in the code panel. The animation will show:\n\n1. The original function in blue\n2. The derivative function in green\n3. Tangent lines at different x-values\n4. The slope values at each point\n\nYou can see the preview in the visualization tab.",
          role: "assistant",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botResponse])
        setIsLoading(false)
        setCurrentManimCode(sampleManimCode)

        // Simulate video generation
        setIsGeneratingVideo(true)
        setTimeout(() => {
          setIsGeneratingVideo(false)
          setVideoReady(true)
          setActiveTab("preview")
        }, 3000)
      }, 2000)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentManimCode || sampleManimCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const handleTabChange = (value: string) => {
    console.log("Tab changed to:", value)
    setActiveTab(value)
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
            <h1 className="font-semibold text-lg">Math Visuals</h1>
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
                        ? "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {message.role === "assistant" ? <Sparkles className="h-4 w-4" /> : "U"}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm">
                        {message.role === "assistant" ? "Ryzn Math Visualizer" : "You"}
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
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300 flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">Ryzn Math Visualizer</span>
                    <span className="text-xs text-gray-500">{formatTime(new Date())}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-500">Generating visualization...</span>
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
                placeholder="Describe the math concept to visualize..."
                className="flex-1"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
              />
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={isLoading || !inputValue.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column - Code and Preview */}
        <div className="w-2/3 flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b dark:border-gray-800 px-4 flex justify-between items-center">
            <div className="flex h-12 items-center space-x-1 rounded-md p-1">
              <Button
                variant={activeTab === "code" ? "default" : "ghost"}
                size="sm"
                onClick={() => forceTabSwitch("code")}
                className={`flex items-center gap-2 ${activeTab === "code" ? "bg-background text-foreground" : ""}`}
              >
                <Code className="h-4 w-4" />
                <span>Manim Code</span>
              </Button>
              <Button
                variant={activeTab === "preview" ? "default" : "ghost"}
                size="sm"
                onClick={() => forceTabSwitch("preview")}
                className={`flex items-center gap-2 ${activeTab === "preview" ? "bg-background text-foreground" : ""}`}
              >
                <Play className="h-4 w-4" />
                <span>Visualization</span>
              </Button>
              <Button
                variant={activeTab === "desmos" ? "default" : "ghost"}
                size="sm"
                onClick={() => forceTabSwitch("desmos")}
                className={`flex items-center gap-2 ${activeTab === "desmos" ? "bg-background text-foreground" : ""}`}
              >
                <LineChart className="h-4 w-4" />
                <span>Desmos</span>
              </Button>
              <Button
                variant={activeTab === "excalidraw" ? "default" : "ghost"}
                size="sm"
                onClick={() => forceTabSwitch("excalidraw")}
                className={`flex items-center gap-2 ${activeTab === "excalidraw" ? "bg-background text-foreground" : ""}`}
              >
                <PenTool className="h-4 w-4" />
                <span>Excalidraw</span>
              </Button>
            </div>

            {activeTab === "code" && (
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={handleCopyCode}>
                {copiedCode ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy Code
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {/* Code Tab */}
            {activeTab === "code" && (
              <div className="h-full">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 h-full">
                  <pre className="text-sm font-mono whitespace-pre-wrap h-full overflow-auto">
                    <code>
                      {currentManimCode ||
                        "# Your Manim code will appear here after you describe a math concept to visualize"}
                    </code>
                  </pre>
                </div>
              </div>
            )}

            {/* Preview Tab */}
            {activeTab === "preview" && (
              <div className="h-full relative">
                <div className="bg-white dark:bg-gray-800 p-6 h-full flex flex-col">
                  {isGeneratingVideo ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                      <Loader2 className="h-12 w-12 animate-spin text-purple-600 dark:text-purple-400" />
                      <p className="text-gray-600 dark:text-gray-300">Generating visualization...</p>
                      <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 dark:bg-purple-400 animate-pulse"
                          style={{ width: "60%" }}
                        ></div>
                      </div>
                    </div>
                  ) : videoReady ? (
                    <div className="flex-1 flex flex-col">
                      <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full max-w-3xl">
                            {/* Placeholder animation that resembles a Manim animation */}
                            <div className="relative w-full h-0 pb-[56.25%] bg-[#1e1e1e]">
                              {/* Animation content remains the same */}
                              {/* ... */}

                              {/* Coordinate axes */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative w-[80%] h-[80%]">
                                  {/* X-axis */}
                                  <div
                                    className="absolute left-0 right-0 top-1/2 h-[2px] bg-blue-500 animate-fade-in"
                                    style={{ animationDelay: "0.2s" }}
                                  ></div>
                                  {/* Y-axis */}
                                  <div
                                    className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-blue-500 animate-fade-in"
                                    style={{ animationDelay: "0.2s" }}
                                  ></div>

                                  {/* Grid lines */}
                                  <div className="absolute inset-0 grid-lines opacity-30"></div>

                                  {/* Original function curve (cubic) */}
                                  <svg className="absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <path
                                      d="M 10,80 Q 25,10 50,50 Q 75,90 90,20"
                                      fill="none"
                                      stroke="#3b82f6"
                                      strokeWidth="2.5"
                                      className="animate-draw"
                                      style={{ animationDuration: "2.5s" }}
                                    />
                                  </svg>

                                  {/* Derivative function curve (quadratic) */}
                                  <svg className="absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <path
                                      d="M 10,30 Q 30,90 50,50 Q 70,10 90,70"
                                      fill="none"
                                      stroke="#10b981"
                                      strokeWidth="2.5"
                                      className="animate-draw-delayed"
                                      style={{ animationDelay: "2s", animationDuration: "2.5s" }}
                                    />
                                  </svg>

                                  {/* Tangent lines at different points */}
                                  <div
                                    className="absolute top-[30%] left-[20%] w-[30%] h-[2px] bg-red-500 origin-left transform rotate-45 animate-fade-in"
                                    style={{ animationDelay: "4s" }}
                                  ></div>
                                  <div
                                    className="absolute top-[50%] left-[50%] w-[30%] h-[2px] bg-red-500 origin-left transform rotate-12 animate-fade-in"
                                    style={{ animationDelay: "5s" }}
                                  ></div>
                                  <div
                                    className="absolute top-[70%] left-[80%] w-[30%] h-[2px] bg-red-500 origin-left transform -rotate-45 animate-fade-in"
                                    style={{ animationDelay: "6s" }}
                                  ></div>

                                  {/* Points on curve */}
                                  <div
                                    className="absolute top-[30%] left-[20%] w-3 h-3 bg-yellow-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-fade-in"
                                    style={{ animationDelay: "4s" }}
                                  ></div>
                                  <div
                                    className="absolute top-[50%] left-[50%] w-3 h-3 bg-yellow-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-fade-in"
                                    style={{ animationDelay: "5s" }}
                                  ></div>
                                  <div
                                    className="absolute top-[70%] left-[80%] w-3 h-3 bg-yellow-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-fade-in"
                                    style={{ animationDelay: "6s" }}
                                  ></div>

                                  {/* Labels */}
                                  <div
                                    className="absolute top-2 left-2 text-white text-sm p-1 bg-black/30 rounded animate-fade-in"
                                    style={{ animationDelay: "0.5s" }}
                                  >
                                    f(x) = 6x³ - 5x + 4
                                  </div>
                                  <div
                                    className="absolute top-8 left-2 text-green-400 text-sm p-1 bg-black/30 rounded animate-fade-in"
                                    style={{ animationDelay: "2s" }}
                                  >
                                    f'(x) = 18x² - 5
                                  </div>

                                  {/* Slope labels */}
                                  <div
                                    className="absolute top-[25%] left-[25%] text-red-400 text-xs p-1 bg-black/30 rounded animate-fade-in"
                                    style={{ animationDelay: "4.2s" }}
                                  >
                                    Slope = 67.0
                                  </div>
                                  <div
                                    className="absolute top-[45%] left-[55%] text-red-400 text-xs p-1 bg-black/30 rounded animate-fade-in"
                                    style={{ animationDelay: "5.2s" }}
                                  >
                                    Slope = 13.0
                                  </div>
                                  <div
                                    className="absolute top-[65%] left-[85%] text-red-400 text-xs p-1 bg-black/30 rounded animate-fade-in"
                                    style={{ animationDelay: "6.2s" }}
                                  >
                                    Slope = -41.0
                                  </div>
                                </div>
                              </div>

                              {/* Video controls */}
                              <div
                                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/50 rounded-full px-3 py-1.5 animate-fade-in"
                                style={{ animationDelay: "1s" }}
                              >
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-white">
                                  <Play className="h-4 w-4" />
                                </Button>
                                <div className="w-32 h-1 bg-white/30 rounded-full overflow-hidden">
                                  <div className="h-full bg-white animate-progress"></div>
                                </div>
                                <span className="text-white text-xs">00:00</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                          <h3 className="text-sm font-medium mb-2">Original Function</h3>
                          <div className="flex items-center justify-center p-4">
                            <div className="text-center">
                              <div className="text-lg font-medium mb-2">f(x) = 6x³ - 5x + 4</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">Cubic polynomial function</div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                          <h3 className="text-sm font-medium mb-2">Derivative</h3>
                          <div className="flex items-center justify-center p-4">
                            <div className="text-center">
                              <div className="text-lg font-medium mb-2">f'(x) = 18x² - 5</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">Quadratic function</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                        <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">Key Insights</h4>
                        <ul className="text-sm text-purple-600 dark:text-purple-400 space-y-1 list-disc pl-4">
                          <li>The derivative shows the rate of change of the original function</li>
                          <li>Where f'(x) = 0, the original function has local extrema</li>
                          <li>The tangent lines illustrate the instantaneous rate of change</li>
                          <li>The power rule was applied: d/dx(x^n) = n·x^(n-1)</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center max-w-md">
                        <Video className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                        <h3 className="text-lg font-medium mb-2">No Visualization Yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Describe a mathematical concept in the chat, and I'll generate a visualization for you.
                        </p>
                        <Button
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={() => setInputValue("Show me the derivative of f(x) = 6x³ - 5x + 4")}
                        >
                          Try an Example
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                {!videoReady && !isGeneratingVideo && (
                  <div className="absolute top-4 right-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setCurrentManimCode(sampleManimCode)
                        setIsGeneratingVideo(true)
                        setTimeout(() => {
                          setIsGeneratingVideo(false)
                          setVideoReady(true)
                        }, 3000)
                      }}
                    >
                      Load Animation
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Desmos Tab */}
            {activeTab === "desmos" && (
              <div className="h-full">
                <div className="bg-white dark:bg-gray-800 h-full flex flex-col">
                  <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
                    <h3 className="font-medium">Desmos Graphing Calculator</h3>
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
                          if (desmosRef.current && desmosRef.current.contentWindow) {
                            console.log("Updating equation:", desmosEquation)
                            // In a real implementation, we would use the Desmos API
                            try {
                              // Just a placeholder for demonstration
                              alert(`Equation updated: ${desmosEquation}`)
                            } catch (error) {
                              console.error("Error updating Desmos equation:", error)
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
                        console.log("Desmos iframe loaded")
                        setDesmosLoaded(true)
                      }}
                    />
                    {!desmosLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-4">
                          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                          <p>Loading Desmos Calculator...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Excalidraw Tab */}
            {activeTab === "excalidraw" && (
              <div className="h-full">
                <div className="bg-white dark:bg-gray-800 h-full flex flex-col">
                  <div className="p-4 border-b dark:border-gray-700">
                    <h3 className="font-medium">Excalidraw Whiteboard</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Use this space to sketch mathematical concepts, create diagrams, or collaborate on
                      problem-solving.
                    </p>
                  </div>
                  <div className="flex-1 relative">
                    <iframe
                      ref={excalidrawRef}
                      src="https://excalidraw.com/"
                      className="w-full h-full border-0"
                      title="Excalidraw Whiteboard"
                      allow="fullscreen"
                      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                      onLoad={() => console.log("Excalidraw iframe loaded")}
                    />
                    <div className="absolute bottom-4 right-4">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          console.log("Clear canvas button clicked")
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
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

