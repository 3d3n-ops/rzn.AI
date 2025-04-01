"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
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
              Improve your study experience by deep learning through AI voice
              chat.
            </p>
            <Button
              asChild
              className="h-12 px-8 text-lg bg-gray-900 hover:bg-gray-800 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <Link href="/sign-up"> Try Ryzn Now!</Link>
            </Button>
          </div>

          {/* Product Preview */}
          <div className="mt-24 relative">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-w-5xl mx-auto">
              <div className="aspect-[16/9] relative group">
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                  <div className="bg-white/90 dark:bg-gray-900/90 rounded-full p-4 transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-xl hover:bg-white dark:hover:bg-gray-900">
                    <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                  </div>
                </div>
                <video
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                  poster="https://xuot59okd8gfywot.public.blob.vercel-storage.com/Quiz%20Pics-EWYSFJAkHdWgu26ec8LdQMBdaTjBM1.png"
                >
                  <source
                    src="https://xuot59okd8gfywot.public.blob.vercel-storage.com/Quiz%20Pics-EWYSFJAkHdWgu26ec8LdQMBdaTjBM1.png"
                    type="video/mp4"
                  />
                  <track kind="captions" src="" label="English" />
                </video>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <section className="py-32 relative">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4">
                  Everything you need to excel
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Powerful features to supercharge your learning journey
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Study Materials */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                  <div className="relative h-48 mb-6 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
                    <img
                      src="https://xuot59okd8gfywot.public.blob.vercel-storage.com/Quiz%20Pics-EWYSFJAkHdWgu26ec8LdQMBdaTjBM1.png"
                      alt="Study Materials"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">Study Materials on Demand</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    No time to make study materials? No problem! AI-generated
                    flashcards and quizzes to test understanding.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Instant flashcard generation
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Adaptive quizzes
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Personalized study plans
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Note-taking */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                  <div className="relative h-48 mb-6 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20" />
                    <img
                      src="https://xuot59okd8gfywot.public.blob.vercel-storage.com/Select%20Files%20-ba4ojlYSBdtGzY0fZfZfUNk9ptcuQl.png"
                      alt="Note-taking"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">Note-taking on Autopilot</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Turn your lecture notes - video, audio, pdf, ppt - into
                    organized notes instantly.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Multi-format support
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      <span className="text-gray-600 dark:text-gray-300">
                        AI-powered summarization
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Smart organization
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Deep Learning */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                  <div className="relative h-48 mb-6 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
                    <img
                      src="https://xuot59okd8gfywot.public.blob.vercel-storage.com/Quiz%20Pics-EWYSFJAkHdWgu26ec8LdQMBdaTjBM1.png"
                      alt="Deep Learning"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">Deep Learning with Ryzn</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Engaging voice chat AI to prime you into thinking deeper
                    about concepts and problems.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Interactive voice conversations
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Concept exploration
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Adaptive learning paths
                      </span>
                    </li>
                  </ul>
                </div>

                {/* AI Technology */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                  <div className="relative h-48 mb-6 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20" />
                    <img
                      src="https://xuot59okd8gfywot.public.blob.vercel-storage.com/Model%20Selection%20LLM-e8c0C98CkQYdjnlV8DLgSG3TobNCXY.png"
                      alt="AI Technology"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">Latest AI Technology</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Powered by state-of-the-art AI models for engaging learning experiences.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Advanced language models
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Multi-modal AI integration
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Continuous updates
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Voice Chat */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                  <div className="relative h-48 mb-6 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-pink-500/20" />
                    <img
                      src="https://xuot59okd8gfywot.public.blob.vercel-storage.com/Quiz%20Pics-EWYSFJAkHdWgu26ec8LdQMBdaTjBM1.png"
                      alt="Voice Chat"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">Interactive Voice Chat</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Natural conversations with AI to deepen your understanding.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Real-time responses
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Context-aware conversations
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Personalized learning
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Content Generation */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                  <div className="relative h-48 mb-6 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
                    <img
                      src="https://xuot59okd8gfywot.public.blob.vercel-storage.com/Quiz%20Pics-EWYSFJAkHdWgu26ec8LdQMBdaTjBM1.png"
                      alt="Content Generation"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">Smart Content Generation</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Generate high-quality study materials from your content.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Summaries & notes
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Practice questions
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      <span className="text-gray-600 dark:text-gray-300">
                        Key concepts
                      </span>
                    </li>
                  </ul>
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
                    <Button asChild className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700 h-12">
                      <Link href="/sign-up">Sign up today</Link>
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
                      <li className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full" />
                        <span>Full math workspace access</span>
                      </li>
                    </ul>
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12">
                      <Link href="/sign-up">Sign up now!</Link>
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
                    <Button asChild className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-purple-600 dark:hover:bg-purple-700 h-12">
                      <Link href="/contact">Contact Sales</Link>
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
                  <Link href="/dashboard">
                    <Button className="bg-white hover:bg-gray-100 text-gray-900 h-12 px-8 rounded-full text-lg">
                      Try ryznAI today!
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button className="bg-transparent hover:bg-white/10 text-white border-2 border-white h-12 px-8 rounded-full text-lg">
                      Get Started Free
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
