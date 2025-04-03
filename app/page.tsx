"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Header } from "./components/Header";

export default function Home() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleCTAClick = () => {
    if (isSignedIn) {
      router.push("/dashboard");
    } else {
      router.push("/sign-up");
    }
  };

  return (
    <div className="min-h-screen relative">
      <Header />

      {/* Hero Section */}
      <main className="pt-32 pb-16 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-blue-100 rounded-full blur-3xl opacity-60 animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-40 animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl sm:text-7xl font-bold tracking-tight mb-8">
              <span className="bg-gradient-to-r from-blue-400 via-blue-600 to-blue-800 bg-clip-text text-transparent">
                Revolutionize
              </span>
              <br />
              your learning
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
              Improve your study experience with ryznAI. 
            </p>
            <Button
              onClick={handleCTAClick}
              className="h-12 px-8 text-lg bg-gray-900 hover:bg-gray-800 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {isSignedIn ? "Go to Dashboard" : "Try Ryzn Now!"}
            </Button>
          </div>

          {/* Product Preview */}
          <div className="mt-24 relative">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-w-5xl mx-auto">
              <div className="aspect-[16/9] w-full">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/DjLgC5Kafx8?rel=0&modestbranding=1&autoplay=0"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <section className="py-32 relative">
            <div className="container mx-auto px-4 max-w-7xl">
              <div className="space-y-32">
                {/* Study Materials Feature */}
                <div className="grid md:grid-cols-2 gap-16 items-center">
                  <div>
                    <h3 className="text-4xl font-semibold mb-6">Study Materials on Demand</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xl mb-8">
                      Transform your lecture recordings and PDF materials into comprehensive study resources with AI-powered content generation.
                    </p>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mt-1">
                          <div className="h-2.5 w-2.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium mb-2">Smart Content Processing</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-lg">Upload PDFs and lecture audio to generate study materials instantly</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mt-1">
                          <div className="h-2.5 w-2.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium mb-2">Comprehensive Resources</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-lg">Get organized notes, chapter summaries, and practice quizzes</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mt-1">
                          <div className="h-2.5 w-2.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium mb-2">Multi-format Support</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-lg">Compatible with PDF textbooks and recorded lecture audio</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 relative shadow-2xl">
                    <div className="aspect-[16/9] rounded-lg overflow-hidden">
                      <img
                        src="/notes.png"
                        alt="Study Materials Demo"
                        className="w-full h-full object-contain bg-white dark:bg-gray-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Voice Chat Feature */}
                <div className="grid md:grid-cols-2 gap-16 items-center">
                  <div className="order-2 md:order-1">
                    <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-8 relative shadow-2xl">
                      <div className="aspect-[4/3] rounded-lg overflow-hidden">
                        <div className="w-full h-full bg-gray-900">
                          {/* Chat Interface */}
                          <div className="h-full flex flex-col">
                            {/* Chat Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-800">
                              <h4 className="text-white">Conversations</h4>
                              <button className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm">+ New Chat</button>
                            </div>
                            
                            {/* Chat Messages */}
                            <div className="flex-1 p-4 space-y-4">
                              <div className="bg-gray-800 text-white p-3 rounded-lg max-w-[80%]">
                                Hi! I'm Ryzn, your AI learning assistant. How can I help you today?
                              </div>
                              <div className="bg-blue-600 text-white p-3 rounded-lg max-w-[80%] ml-auto">
                                How do I find the derivative of a quadratic equation?
                              </div>
                              <div className="bg-gray-800 text-white p-3 rounded-lg max-w-[80%]">
                                To find the derivative of a quadratic equation in the form ax² + bx + c, you apply the power rule to each term. The derivative will be 2ax + b. The constant term c disappears because the derivative of a constant is zero.
                              </div>
                            </div>
                            
                            {/* Chat Input */}
                            <div className="p-4 border-t border-gray-800">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-800 rounded-lg p-2 text-gray-400">
                                  Type your message...
                                </div>
                                <button className="p-2 bg-blue-600 rounded-lg">
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="order-1 md:order-2">
                    <h3 className="text-4xl font-semibold mb-6">Interactive Voice Chat</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xl mb-8">
                      Natural conversations with AI to deepen your understanding through active learning.
                    </p>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mt-1">
                          <div className="h-2.5 w-2.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium mb-2">Real-time Interaction</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-lg">Engage in natural conversations with AI</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mt-1">
                          <div className="h-2.5 w-2.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium mb-2">Deep Understanding</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-lg">Learn through the Feynman technique</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Math Workspace Feature */}
                <div className="grid md:grid-cols-2 gap-16 items-center">
                  <div>
                    <h3 className="text-4xl font-semibold mb-6">Interactive Workspace for Math</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xl mb-8">
                      A comprehensive suite of tools combining AI-powered animations, interactive calculators, and intelligent assistance to make math learning intuitive and engaging.
                    </p>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mt-1">
                          <div className="h-2.5 w-2.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium mb-2">AI-Generated Math Animations</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-lg">Watch complex concepts come to life with Manim-powered visual explanations</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mt-1">
                          <div className="h-2.5 w-2.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium mb-2">Interactive Math Tools</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-lg">Solve problems using Excalidraw's whiteboard and Desmos' graphing calculator</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mt-1">
                          <div className="h-2.5 w-2.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium mb-2">Advanced AI Assistance</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-lg">Get expert help from Deepseek and Groq AI for step-by-step problem solving</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-900 dark:bg-gray-800 rounded-xl p-8 relative shadow-2xl">
                    <div className="aspect-[4/3] rounded-lg overflow-hidden">
                      <div className="w-full h-full bg-gray-900">
                        {/* Excalidraw Interface */}
                        <div className="h-full flex flex-col">
                          {/* Toolbar */}
                          <div className="flex items-center justify-between p-4 border-b border-gray-800">
                            <div className="flex items-center gap-2">
                              <span className="text-white">Math Workspace</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm">Tools</div>
                            </div>
                          </div>
                          
                          {/* Drawing Area */}
                          <div className="flex-1 p-4">
                            <div className="bg-white rounded-lg h-full w-full p-4 flex items-center justify-center">
                              <div className="text-black text-2xl font-mono">
                                2x + 5 = 10
                                <br />
                                - 5&nbsp;&nbsp;&nbsp;-5
                                <br />
                                2x = 5
                                <br />
                                x = 5/2
                              </div>
                            </div>
                          </div>
                          
                          {/* Bottom Tools */}
                          <div className="p-4 border-t border-gray-800">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 bg-gray-800 rounded flex items-center justify-center">
                                  <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                                </div>
                                <div className="h-8 w-8 bg-gray-800 rounded flex items-center justify-center">
                                  <div className="w-4 h-4 border-2 border-blue-500 rounded-sm"></div>
                                </div>
                              </div>
                              <div className="text-gray-400 text-sm">68%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="py-32 relative">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4">
                  Choose the plan that works for you
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Flexible pricing for students and enterprises
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Free Plan */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative">
                    <h3 className="text-2xl font-semibold mb-2">Free</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-4xl font-bold">$0</span>
                      <span className="text-gray-600 dark:text-gray-300">/month</span>
                    </div>
                    <p className="text-blue-600 dark:text-blue-400 mb-6">Perfect for trying out</p>
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full" />
                        <span>Limited File Upload</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full" />
                        <span>Limited voice chat sessions</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full" />
                        <span>Limited math workspace help</span>
                      </li>
                    </ul>
                    <Button 
                      onClick={handleCTAClick}
                      className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700 h-12"
                    >
                      {isSignedIn ? "Go to Dashboard" : "Sign up today"}
                    </Button>
                  </div>
                </div>

                {/* Student Plan */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow duration-300 border-2 border-blue-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
                  <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                    Popular
                  </div>
                  <div className="relative">
                    <h3 className="text-2xl font-semibold mb-2">Student</h3>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-4xl font-bold">$7</span>
                      <span className="text-gray-600 dark:text-gray-300">/month</span>
                    </div>
                    <p className="text-blue-600 dark:text-blue-400 mb-6">Most popular choice</p>
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full" />
                        <span>Unlimited File Upload</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full" />
                        <span>Unlimited voice chat sessions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
                        <span>Full math workspace access</span>
                      </li>
                    </ul>
                    <Button 
                      onClick={handleCTAClick}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
                    >
                      {isSignedIn ? "Go to Dashboard" : "Sign up now!"}
                    </Button>
                  </div>
                </div>

                {/* Enterprise Plan */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative">
                    <h3 className="text-2xl font-semibold mb-2">Enterprise</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-4xl font-bold">Custom</span>
                    </div>
                    <p className="text-blue-600 dark:text-blue-400 mb-6">For organizations</p>
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full" />
                        <span>Custom deployment options</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full" />
                        <span>Dedicated support</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full" />
                        <span>Custom integrations</span>
                      </li>
                    </ul>
                    <Button 
                      onClick={handleCTAClick}
                      className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-purple-600 dark:hover:bg-purple-700 h-12"
                    >
                      {isSignedIn ? "Go to Dashboard" : "Contact Sales"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer CTA */}
          <section className="py-32 relative rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 opacity-90" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  With RyznAI, you no longer have a reason to not study.
                </h2>
                <p className="text-xl text-gray-100 mb-8">
                  RyznAI: Deep Learning through Reason.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={handleCTAClick}
                    className="bg-white hover:bg-gray-100 text-gray-900 h-12 px-8 rounded-full text-lg"
                  >
                    {isSignedIn ? "Go to Dashboard" : "Try ryznAI today!"}
                  </Button>
                  <Button 
                    onClick={handleCTAClick}
                    className="bg-transparent hover:bg-white/10 text-white border-2 border-white h-12 px-8 rounded-full text-lg"
                  >
                    {isSignedIn ? "Go to Dashboard" : "Get Started Free"}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
