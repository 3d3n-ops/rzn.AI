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
import { ThemeToggle } from "@/components/theme-switcher";

export default function Home() {
  // Placeholder data for graphs
  const retentionData = [
    { name: "Traditional", value: 20 },
    { name: "rzn.AI", value: 80 },
  ];

  const comprehensionData = [
    { name: "Week 1", traditional: 30, rzn: 45 },
    { name: "Week 2", traditional: 40, rzn: 60 },
    { name: "Week 3", traditional: 45, rzn: 75 },
    { name: "Week 4", traditional: 50, rzn: 90 },
  ];

  return (
    <div>
      <div className="min-h-screen bg-[#fafafa] dark:bg-gray-900">
        {/* Header */}
        <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md dark:bg-gray-900/80">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                  rzn.AI
                </span>
              </Link>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <Link
                  href="/blog"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  Blog
                </Link>
                <Button variant="ghost" className="text-sm">
                  Sign in
                </Button>
                <Button
                  asChild
                  className="bg-gray-900 text-white hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  <Link href="/dashboard">Register</Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

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
                <Link href="/dashboard"> Use rzn.AI for free</Link>
              </Button>
            </div>

            {/* Social Proof */}
            <div className="mt-24 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                Relied on by 500,000+ students at
              </p>
              <div className="flex justify-center items-center gap-12 flex-wrap opacity-60">
                {["Stanford", "Harvard", "Princeton", "Columbia"].map(
                  (school) => (
                    <div
                      key={school}
                      className="text-xl font-serif text-gray-400 dark:text-gray-500"
                    >
                      {school}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Product Preview */}
            <div className="mt-24 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-[#fafafa] dark:from-gray-900 to-transparent z-10 h-40 bottom-0" />
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-w-5xl mx-auto">
                <div className="aspect-[16/9] relative">
                  <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 animate-pulse" />
                  {/* Replace with actual product screenshot */}
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
                        No time to make study materials? No problem!
                        AI-generated flashcards and quizzes to test
                        understanding.
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
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900 dark:to-gray-800 rounded-lg" />
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
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900 dark:to-gray-800 rounded-lg" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold mb-4">
                        Deep Learning with rzn
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
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900 dark:to-gray-800 rounded-lg" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 order-2 md:order-1">
                      <h3 className="text-2xl font-semibold mb-4">
                        Latest Technology
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        rzn is powered by the best AI models available at your
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
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-25%20141015-LESjlHsm8JM1YhNG1TvJiXhwmlAlyS.png"
                          alt="AI Models Integration"
                          className="max-w-md"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            {/* Evidence-Based Research Section */}
            <section className="py-32 bg-gray-50 dark:bg-gray-800/50 relative">
              <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold mb-8 text-center">
                  Evidence-Based Learning
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto text-center">
                  Research shows that communicating your thought process, like
                  in the Feynman Technique, significantly improves learning
                  outcomes. rzn.AI leverages this principle to supercharge your
                  studies.
                </p>

                <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                  <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg">
                    <h3 className="text-2xl font-semibold mb-4">
                      Information Retention
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={retentionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                      Students using rzn.AI show a 300% increase in information
                      retention compared to traditional methods.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg">
                    <h3 className="text-2xl font-semibold mb-4">
                      Comprehension Over Time
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={comprehensionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                          dataKey="traditional"
                          fill="#9ca3af"
                          name="Traditional"
                        />
                        <Bar dataKey="rzn" fill="#3b82f6" name="rzn.AI" />
                      </BarChart>
                    </ResponsiveContainer>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                      rzn.AI users consistently outperform traditional learners
                      in comprehension tests over time.
                    </p>
                  </div>

                  <div className="md:col-span-2 bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg">
                    <h3 className="text-2xl font-semibold mb-4">Key Metrics</h3>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                          94%
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                          of users report improved grades
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                          78%
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                          reduction in study time
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                          3.2x
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                          increase in learning speed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-16 text-center">
                  <Link href="/dashboard">
                    {" "}
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 rounded-full text-lg">
                      Experience the Difference
                    </Button>
                  </Link>
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
                    <h3 className="text-2xl font-semibold mb-2">
                      Monthly Plan
                    </h3>
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
            <section className="py-32 bg-gray-900 dark:bg-black relative">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent opacity-50" />
              <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto">
                  <h2 className="text-4xl font-bold text-white mb-6">
                    With rzn, you no longer have a reason to not study.
                  </h2>
                  <p className="text-xl text-gray-300 mb-8">
                    Rzn: Deep Learning through Reason.
                  </p>
                  <Link href="/dashboard">
                    {" "}
                    <Button className="bg-white hover:bg-gray-100 text-gray-900 h-12 px-8 rounded-full text-lg">
                      Try rzn today!
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
