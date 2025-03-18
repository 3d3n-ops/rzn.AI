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
            <div className="absolute inset-0 bg-gradient-to-t from-[#fafafa] dark:from-gray-900 to-transparent z-10 h-40 bottom-0" />
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-w-5xl mx-auto">
              <div className="aspect-[16/9] relative">
                <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 animate-pulse" />
                <video
                  className="w-full h-full object-cover absolute inset-0"
                  controls
                  preload="none"
                >
                  <source
                    src="https://xuot59okd8gfywot.public.blob.vercel-storage.com/Quiz%20Pics-EWYSFJAkHdWgu26ec8LdQMBdaTjBM1.png"
                    type="video/mp4"
                  />
                  <track src="" kind="src/Lang" label="English" />
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
              <div className="space-y-16 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-center gap-12">
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold mb-4">
                      Study Materials on Demand
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      No time to make study materials? No problem! AI-generated
                      flashcards and quizzes to test understanding.
                    </p>
                    <ul className="space-y-2">
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
                  <div className="flex-1">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg aspect-video">
                      <img
                        src="https://xuot59okd8gfywot.public.blob.vercel-storage.com/Quiz%20Pics-EWYSFJAkHdWgu26ec8LdQMBdaTjBM1.png"
                        alt="Ryzn Generated Notes"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-12">
                  <div className="flex-1 order-2 md:order-1">
                    <h3 className="text-2xl font-semibold mb-4">
                      Note-taking on Autopilot
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Turn your lecture notes - video, audio, pdf, ppt - into
                      organized notes instantly.
                    </p>
                    <ul className="space-y-2">
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
                  <div className="flex-1 order-1 md:order-2">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg aspect-video">
                      <img
                        src="https://xuot59okd8gfywot.public.blob.vercel-storage.com/Select%20Files%20-ba4ojlYSBdtGzY0fZfZfUNk9ptcuQl.png"
                        alt="Ryzn Generated Notes"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-12">
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold mb-4">
                      Deep Learning with Ryzn
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Engaging voice chat AI to prime you into thinking deeper
                      about concepts and problems.
                    </p>
                    <ul className="space-y-2">
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
                  <div className="flex-1">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg aspect-video">
                      <img
                        src="https://xuot59okd8gfywot.public.blob.vercel-storage.com/Quiz%20Pics-EWYSFJAkHdWgu26ec8LdQMBdaTjBM1.png"
                        alt="Ryzn Generated Quiz"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-12">
                  <div className="flex-1 order-2 md:order-1">
                    <h3 className="text-2xl font-semibold mb-4">
                      Latest Technology
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Ryzn is powered by the best AI models available at your
                      choice for engaging learning.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-3">
                        <div className="h-2 w-2 bg-blue-500 rounded-full" />
                        <span className="text-gray-600 dark:text-gray-300">
                          State-of-the-art language models
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
                          Continuous learning and updates
                        </span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="h-2 w-2 bg-blue-500 rounded-full" />
                        <span className="text-gray-600 dark:text-gray-300">
                          Customizable AI model selection
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div className="flex-1 order-1 md:order-2">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg aspect-video">
                      <img
                        src="https://xuot59okd8gfywot.public.blob.vercel-storage.com/Model%20Selection%20LLM-e8c0C98CkQYdjnlV8DLgSG3TobNCXY.png"
                        alt="Ryzn AI Model Integration"
                        className="w-full h-full object-cover rounded-lg"
                      />
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
                  Get exclusive access to all features!
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Choose the plan that works best for you
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
                  <h3 className="text-2xl font-semibold mb-2">Annual Plan</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold">$4.99</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      /month
                    </span>
                  </div>
                  <p className="text-blue-600 dark:text-blue-400 mb-6">
                    3-day free trial
                  </p>
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700">
                    Choose Annual
                  </Button>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
                  <h3 className="text-2xl font-semibold mb-2">Monthly Plan</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold">$9.99</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      /month
                    </span>
                  </div>
                  <p className="text-blue-600 dark:text-blue-400 mb-6">
                    3-day free trial
                  </p>
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700">
                    Choose Monthly
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Footer CTA */}
          <section className="py-32 bg-gray-900 dark:bg-black relative rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent opacity-50 rounded-xl" />
            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-4xl font-bold text-white mb-6">
                  With RyznAI, you no longer have a reason to not study.
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                  RyznAI: Deep Learning through Reason.
                </p>
                <Link href="/dashboard">
                  {" "}
                  <Button className="bg-white hover:bg-gray-100 text-gray-900 h-12 px-8 rounded-full text-lg">
                    Try ryznAI today!
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
