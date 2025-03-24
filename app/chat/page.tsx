"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  ArrowLeft,
  Mic,
  MicOff,
  Plus,
  Search,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModelSelector } from "@/components/model-selector";
import { ThemeToggle } from "@/components/theme-switcher";
import Link from "next/link";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  preview: string;
  date: Date;
  messages: Message[];
}

export default function ChatPage() {
  const { user, isLoaded } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [newTopicInput, setNewTopicInput] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("beginner");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<
    string | null
  >(null);

  // Fetch user conversations on initial load
  useEffect(() => {
    if (isLoaded && user) {
      fetchUserConversations();
    }
  }, [isLoaded, user]);

  const fetchUserConversations = async () => {
    if (!isLoaded || !user) return;

    try {
      const response = await fetch(`/api/chat?user_id=${user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }

      const data = await response.json();

      if (data.conversations) {
        // Transform the conversation data into our local format
        const formattedConversations: Conversation[] = Object.entries(
          data.conversations
        ).map(([id, conv]: [string, any]) => ({
          id,
          title: conv.topic || "New Conversation",
          preview: "", // We'll need to get this from the messages if available
          date: new Date(),
          messages: [], // We'll load messages when selecting a conversation
        }));

        setConversations(formattedConversations);

        // If there are conversations, set the first one as active
        if (formattedConversations.length > 0) {
          setActiveConversation(formattedConversations[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  // Load messages for active conversation
  useEffect(() => {
    if (activeConversation) {
      // In a production app, you would fetch messages for this conversation
      // For now, we'll just initialize with a welcome message
      setMessages([
        {
          id: uuidv4(),
          content:
            "Hi! I'm Ryzn, your AI learning assistant. I can help you understand complex concepts, solve problems, and generate code examples. What would you like to learn today?",
          role: "assistant",
          timestamp: new Date(),
        },
      ]);
    }
  }, [activeConversation]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clean up recording timer when component unmounts
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // Create a new conversation
  const createNewConversation = async () => {
    setIsCreatingConversation(true);
  };

  const handleCreateConversation = async () => {
    if (!newTopicInput.trim() || !isLoaded || !user) return;

    try {
      setIsLoading(true);

      const response = await fetch("/api/chat", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: newTopicInput,
          difficulty_level: difficultyLevel,
          user_id: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const data = await response.json();

      // Add the new conversation to our list
      const newConversation: Conversation = {
        id: data.conversation_id,
        title: newTopicInput,
        preview: "",
        date: new Date(),
        messages: [],
      };

      setConversations((prev) => [newConversation, ...prev]);
      setActiveConversation(newConversation.id);

      // Reset form
      setNewTopicInput("");
      setDifficultyLevel("beginner");
      setIsCreatingConversation(false);

      // Load initial messages for this conversation
      setMessages([
        {
          id: uuidv4(),
          content: `Hi! I'm your Feynman Learning Assistant for ${newTopicInput}. What would you like to learn about this topic?`,
          role: "assistant",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the conversation selection
    setConversationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!conversationToDelete || !isLoaded || !user) return;

    try {
      const response = await fetch("/api/chat", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_id: conversationToDelete,
          user_id: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete conversation");
      }

      // Remove the conversation locally
      setConversations((prevConversations) =>
        prevConversations.filter((conv) => conv.id !== conversationToDelete)
      );

      // If the deleted conversation was active, switch to another one
      if (activeConversation === conversationToDelete) {
        const remainingConversations = conversations.filter(
          (conv) => conv.id !== conversationToDelete
        );

        if (remainingConversations.length > 0) {
          setActiveConversation(remainingConversations[0].id);
        } else {
          setActiveConversation(null);
        }
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    } finally {
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      setRecordingTime(0);

      // TODO: In production, implement actual speech recognition
      // For now, we'll just show a placeholder message
      alert("Speech recognition would be implemented here");
    } else {
      // Start recording
      setIsRecording(true);
      setRecordingTime(0);

      // Start a timer to track recording duration
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (isRecording) {
          toggleRecording();
        }
      }, 10000);
    }
  };

  // Update conversation preview when a new message is sent
  const updateConversationPreview = (
    conversationId: string,
    preview: string
  ) => {
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.id === conversationId
          ? { ...conv, preview, date: new Date() }
          : conv
      )
    );
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeConversation || !isLoaded || !user) return;

    // Add user message to UI immediately
    const userMessage: Message = {
      id: uuidv4(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Update conversation preview
    updateConversationPreview(activeConversation, inputValue);

    // Clear input and show loading
    setInputValue("");
    setIsLoading(true);

    try {
      // Send message to backend
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversation_id: activeConversation,
          user_id: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      // Add assistant response to messages
      const botResponse: Message = {
        id: uuidv4(),
        content: data.response,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          content:
            "Sorry, there was an error processing your message. Please try again.",
          role: "assistant",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(
    (conv) =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <h1 className="font-semibold text-lg">Chat with Ryzn</h1>
          </div>
          <div className="flex items-center gap-4">
            <ModelSelector />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar and Chat */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div
          className={`bg-gray-50 dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col w-80 transition-all duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
            <h2 className="font-semibold">Conversations</h2>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={createNewConversation}
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations"
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* New conversation form */}
          {isCreatingConversation && (
            <div className="p-4 border-b dark:border-gray-700">
              <h3 className="font-medium mb-2">Create new learning session</h3>
              <Input
                placeholder="What topic are you learning about?"
                className="mb-2"
                value={newTopicInput}
                onChange={(e) => setNewTopicInput(e.target.value)}
              />
              <select
                className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value)}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreatingConversation(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateConversation}
                  disabled={!newTopicInput.trim() || isLoading}
                >
                  Create
                </Button>
              </div>
            </div>
          )}

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No conversations yet. Create a new one to get started!
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div key={conversation.id} className="relative group">
                  <button
                    className={`w-full text-left p-4 border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      activeConversation === conversation.id
                        ? "bg-gray-100 dark:bg-gray-700"
                        : ""
                    }`}
                    onClick={() => setActiveConversation(conversation.id)}
                  >
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="font-medium truncate">
                            {conversation.title}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {format(conversation.date, "MMM d")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {conversation.preview || "New conversation"}
                        </p>
                      </div>
                    </div>
                  </button>
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                    onClick={(e) =>
                      handleDeleteConversation(conversation.id, e)
                    }
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col pb-20">
          {/* Mobile Sidebar Toggle */}
          <div className="md:hidden p-2 border-b dark:border-gray-700">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? "Hide Conversations" : "Show Conversations"}
            </Button>
          </div>

          {/* Authentication check - show login prompt if not authenticated */}
          {!isLoaded || !user ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-6">
                <h2 className="text-xl font-bold mb-2">Welcome to Ryzn Chat</h2>
                <p className="text-gray-500 mb-4">
                  Please sign in to start your learning sessions.
                </p>
                <Link href="/sign-in">
                  <Button>Sign In</Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* No active conversation message */}
              {!activeConversation && !isCreatingConversation && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center p-6">
                    <h2 className="text-xl font-bold mb-2">
                      Welcome to Ryzn Chat
                    </h2>
                    <p className="text-gray-500 mb-4">
                      Select a conversation or create a new one to get started.
                    </p>
                    <Button onClick={createNewConversation}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Conversation
                    </Button>
                  </div>
                </div>
              )}

              {/* Messages Area */}
              {activeConversation && (
                <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-800">
                  <div className="max-w-3xl mx-auto space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
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
                </div>
              )}

              {/* Voice Chat Component */}
              {activeConversation && (
                <div className="border-t dark:border-gray-700 p-6 flex justify-center items-center bg-white dark:bg-gray-800">
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
                      style={{
                        animationDuration: "2.5s",
                        animationDelay: "0.2s",
                      }}
                    ></div>
                    <div
                      className={`absolute inset-0 rounded-full bg-blue-500/10 animate-ping ${
                        isRecording ? "opacity-100" : "opacity-0"
                      } transition-opacity duration-300`}
                      style={{
                        animationDuration: "3s",
                        animationDelay: "0.4s",
                      }}
                    ></div>

                    {/* Microphone button */}
                    <button
                      onClick={toggleRecording}
                      className={`relative z-10 h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isRecording
                          ? "bg-red-500 hover:bg-red-600 scale-110"
                          : "bg-blue-500 hover:bg-blue-600"
                      }`}
                    >
                      {isRecording ? (
                        <MicOff className="h-6 w-6 text-white" />
                      ) : (
                        <Mic className="h-6 w-6 text-white" />
                      )}
                    </button>
                  </div>

                  {/* Recording status */}
                  {isRecording && (
                    <div className="absolute bottom-24 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
                      <span className="h-2 w-2 rounded-full bg-red-500"></span>
                      <span className="text-sm font-medium">
                        Recording... {recordingTime}s
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Text Input Area - Fixed at bottom */}
              {activeConversation && (
                <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4 shadow-lg">
                  <div className="container mx-auto max-w-3xl">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1"
                        disabled={isLoading || isRecording}
                      />
                      <Button
                        type="submit"
                        disabled={
                          isLoading || !inputValue.trim() || isRecording
                        }
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
