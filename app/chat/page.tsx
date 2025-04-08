"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, ArrowLeft, Settings, Volume2, VolumeX, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-switcher";
import Link from "next/link";
import { createAssistant, sendMessage, transcribeAudio } from "@/app/actions/chat";
import { 
  streamTextWithTTS,
  textToSpeech,
  playAudio
} from "@/app/utils/tts";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isStreaming?: boolean;
}

interface VoiceSettings {
  autoSpeak: boolean;
}

export default function ChatPage() {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    autoSpeak: true
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const streamingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Clean up resources
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (streamingTimeoutRef.current) {
        clearTimeout(streamingTimeoutRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      console.log("Starting recording...");
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create MediaRecorder instance
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        // Create a single blob from all chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // Process the audio
        await processAudioInput(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      
      console.log("Recording started successfully");
    } catch (error) {
      console.error("Error starting recording:", error);
      setError("Failed to access microphone. Please check your permissions.");
      toast.error("Microphone access denied. Please check your browser permissions.");
    }
  };

  const stopRecording = () => {
    console.log("Stopping recording...");
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    console.log("Recording stopped successfully");
  };

  const processTranscribedText = async (transcribedText: string) => {
    try {
      console.log("Processing transcribed text...");
      setIsLoading(true);
      setError(null);
      
      if (!transcribedText.trim() || !userId) {
        console.error("No transcribed text or no user ID");
        toast.error("No speech detected. Please try again.");
        setIsLoading(false);
        return;
      }
      
      console.log("Creating user message...");
      const userMessage: Message = {
        id: Date.now().toString(),
        content: transcribedText,
        role: "user",
        timestamp: new Date(),
      };

      console.log("Adding user message to chat...");
      setMessages((prev) => [...prev, userMessage]);

      if (!conversationId) {
        console.log("No conversation ID, creating new assistant...");
        // Create new conversation if none exists
        const response = await createAssistant(topic, "beginner", userId);
        console.log("Assistant created:", response);
        setConversationId(response.conversationId);
      }

      console.log("Sending message to backend...");
      // Send message to backend
      const aiResponse = await sendMessage(
        transcribedText,
        conversationId!,
        userId
      );
      console.log("Received response from backend:", aiResponse);

      console.log("Creating assistant message...");
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: aiResponse.response,
        role: "assistant",
        timestamp: new Date(),
        isStreaming: true,
      };

      setStreamingMessageId(assistantMessage.id);
      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingContent("");

      // Convert AI response to speech if autoSpeak is enabled
      if (voiceSettings.autoSpeak) {
        console.log("Converting AI response to speech using Deepgram...");
        setIsStreaming(true);
        try {
          await streamTextWithTTS(
            aiResponse.response,
            (chunk) => {
              // Update the streaming content
              setStreamingContent(chunk);
            },
            {
              delayBetweenChunks: 50
            }
          );
        } catch (error) {
          console.error("Error streaming TTS:", error);
          toast.error("Error with text-to-speech. Displaying text only.");
          // Still show the full text even if TTS failed
          setStreamingContent(aiResponse.response);
        } finally {
          setIsStreaming(false);
          setStreamingMessageId(null);
          
          // Update the message to mark it as no longer streaming
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id ? { ...msg, isStreaming: false } : msg
            )
          );
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error processing transcribed text:", error);
      setError(`Failed to process voice input: ${errorMessage}`);
      toast.error(`Failed to process voice input: ${errorMessage}`);
    } finally {
      console.log("Text processing completed");
      setIsLoading(false);
      setStreamingContent("");
    }
  };

  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !userId) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('Creating assistant with topic:', topic);
      const response = await createAssistant(topic, 'beginner', userId);
      console.log('Assistant created:', response);

      if (!response.conversationId) {
        throw new Error('Invalid response from server: missing conversationId');
      }

      setConversationId(response.conversationId);
      setMessages([
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `I'll help you learn about ${topic} using Groq's Llama 3 model. What would you like to know?`,
          timestamp: new Date(),
        }
      ]);
    } catch (error) {
      console.error('Error creating assistant:', error);
      setError(error instanceof Error ? error.message : 'Failed to create assistant');
      toast.error(error instanceof Error ? error.message : 'Failed to create assistant');
    } finally {
      setIsLoading(false);
    }
  };

  const processAudioInput = async (audioBlob: Blob) => {
    if (!userId || !conversationId) {
      toast.error('Please start a conversation first');
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      
      // Convert Blob to File
      const audioFile = new File([audioBlob], 'audio.wav', { type: 'audio/wav' });
      formData.append('file', audioFile);
      formData.append('user_id', userId);

      const transcription = await transcribeAudio(formData);
      if (!transcription.text) {
        throw new Error('No transcription received');
      }

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content: transcription.text,
        role: "user",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Send to backend
      const response = await sendMessage(transcription.text, conversationId, userId);
      
      // Add assistant response
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: response.response,
        role: "assistant",
        timestamp: new Date(),
        isStreaming: true,
      };
      
      setStreamingMessageId(assistantMessage.id);
      setMessages(prev => [...prev, assistantMessage]);
      setStreamingContent("");
      
      // Convert AI response to speech if autoSpeak is enabled
      if (voiceSettings.autoSpeak) {
        console.log("Converting AI response to speech using Deepgram...");
        setIsStreaming(true);
        try {
          await streamTextWithTTS(
            response.response,
            (chunk) => {
              // Update the streaming content
              setStreamingContent(chunk);
            },
            {
              delayBetweenChunks: 50
            }
          );
        } catch (error) {
          console.error("Error streaming TTS:", error);
          toast.error("Error with text-to-speech. Displaying text only.");
          // Still show the full text even if TTS failed
          setStreamingContent(response.response);
        } finally {
          setIsStreaming(false);
          setStreamingMessageId(null);
          
          // Update the message to mark it as no longer streaming
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id ? { ...msg, isStreaming: false } : msg
            )
          );
        }
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process audio');
    } finally {
      setIsLoading(false);
      setStreamingContent("");
    }
  };

  const speakMessage = async (message: Message) => {
    try {
      setIsStreaming(true);
      setStreamingMessageId(message.id);
      setStreamingContent("");
      
      await streamTextWithTTS(
        message.content,
        (chunk) => {
          // Update the streaming content
          setStreamingContent(chunk);
        },
        {
          delayBetweenChunks: 50
        }
      );
    } catch (error) {
      toast.error("Failed to speak message");
      console.error("Error speaking message:", error);
      // Show full text even if TTS failed
      setStreamingContent(message.content);
    } finally {
      setIsStreaming(false);
      setStreamingMessageId(null);
      setStreamingContent("");
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Custom renderer for code blocks in markdown
  const CodeBlock = ({ language, value }: { language: string; value: string }) => {
    return (
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          borderRadius: '0.5rem',
          margin: '1rem 0',
          padding: '1rem',
          fontSize: '0.875rem',
        }}
      >
        {value}
      </SyntaxHighlighter>
    );
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
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Voice Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="autoSpeak" 
                      checked={voiceSettings.autoSpeak} 
                      onCheckedChange={(checked) => setVoiceSettings(prev => ({ ...prev, autoSpeak: checked }))}
                    />
                    <Label htmlFor="autoSpeak">Auto-speak responses using Deepgram</Label>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>Deepgram's TTS uses their default voice. Voice selection is not available in the current API version.</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <ThemeToggle />
          </div>
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
                    {message.role === "assistant" && streamingMessageId === message.id ? (
                      <div className="prose dark:prose-invert max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code: ({ className, children, ...props }) => {
                              const match = /language-(\w+)/.exec(className || '');
                              return match ? (
                                <CodeBlock
                                  language={match[1]}
                                  value={String(children).replace(/\n$/, '')}
                                />
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            }
                          } as Components}
                        >
                          {streamingContent || message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="prose dark:prose-invert max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code: ({ className, children, ...props }) => {
                              const match = /language-(\w+)/.exec(className || '');
                              return match ? (
                                <CodeBlock
                                  language={match[1]}
                                  value={String(children).replace(/\n$/, '')}
                                />
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            }
                          } as Components}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                    {message.role === "assistant" && (
                      <div className="mt-2 flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          onClick={() => speakMessage(message)}
                          disabled={isStreaming}
                        >
                          {isStreaming && streamingMessageId === message.id ? (
                            <VolumeX className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
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
                  aria-label={isRecording ? "Stop recording" : "Start recording"}
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
                Recording... {formatTime(recordingTime)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
