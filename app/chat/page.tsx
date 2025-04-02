"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-switcher";
import Link from "next/link";
import { createAssistant, sendMessage } from "@/app/actions/chat";
import { speechToText, textToSpeech, initializeVoices } from "@/app/utils/audio";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize text-to-speech voices
  useEffect(() => {
    initializeVoices().catch(console.error);
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clean up resources
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        await processAudioInput(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      setError("Failed to access microphone. Please check your permissions.");
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const processAudioInput = async (audioBlob: Blob) => {
    try {
      setIsLoading(true);
      setError(null);

      // Convert speech to text
      const transcribedText = await speechToText(audioBlob);
      
      const userMessage: Message = {
        id: Date.now().toString(),
        content: transcribedText,
        role: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      if (!conversationId) {
        // Create new conversation if none exists
        const response = await createAssistant(topic, "beginner", "user123"); // Replace with actual user ID
        setConversationId(response.conversation_id);
      }

      // Send message to backend
      const aiResponse = await sendMessage(
        transcribedText,
        conversationId!,
        "user123" // Replace with actual user ID
      );

      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: aiResponse.response,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Convert AI response to speech
      await textToSpeech(aiResponse.response);
    } catch (error) {
      setError("Failed to process voice input. Please try again.");
      console.error("Error processing audio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await createAssistant(topic, "beginner", "user123"); // Replace with actual user ID
      setConversationId(response.conversation_id);
      setIsLoading(false);
    } catch (error) {
      setError("Failed to create learning session. Please try again.");
      console.error("Error creating session:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="font-semibold text-lg">Voice Chat with Ryzn</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-6">
        {!conversationId ? (
          // Topic Selection Form
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Start a Learning Session</h2>
            <form onSubmit={handleTopicSubmit} className="space-y-4">
              <div>
                <label htmlFor="topic" className="block text-sm font-medium mb-2">
                  What would you like to learn about?
                </label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter a topic (e.g., Quantum Mechanics, Calculus)"
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !topic.trim()}
              >
                {isLoading ? "Creating Session..." : "Start Learning"}
              </Button>
            </form>
          </div>
        ) : (
          // Chat Interface
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Learning about: {topic}</h2>
            </div>

            {/* Messages */}
            <div className="space-y-4 mb-6 h-[400px] overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-200 dark:bg-gray-700">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"></div>
                      <div
                        className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
                {error}
              </div>
            )}

            {/* Voice Chat Controls */}
            <div className="flex justify-center">
              <div className="relative">
                {/* Animated rings */}
                <div
                  className={`absolute inset-0 rounded-full bg-blue-500/20 animate-ping ${
                    isRecording ? "opacity-100" : "opacity-0"
                  } transition-opacity duration-300`}
                  style={{ animationDuration: "2s" }}
                ></div>
                <div
                  className={`absolute inset-0 rounded-full bg-blue-500/30 animate-ping ${
                    isRecording ? "opacity-100" : "opacity-0"
                  } transition-opacity duration-300`}
                  style={{ animationDuration: "2.5s", animationDelay: "0.2s" }}
                ></div>
                <div
                  className={`absolute inset-0 rounded-full bg-blue-500/10 animate-ping ${
                    isRecording ? "opacity-100" : "opacity-0"
                  } transition-opacity duration-300`}
                  style={{ animationDuration: "3s", animationDelay: "0.4s" }}
                ></div>

                {/* Microphone button */}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`relative z-10 h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600 scale-110"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                  disabled={isLoading}
                >
                  {isRecording ? (
                    <MicOff className="h-6 w-6 text-white" />
                  ) : (
                    <Mic className="h-6 w-6 text-white" />
                  )}
                </button>
              </div>
            </div>

            {/* Recording status */}
            {isRecording && (
              <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Recording... {recordingTime}s
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
