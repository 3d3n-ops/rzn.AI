import { useState, useRef, useEffect } from "react";
import { Mic, Send, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { getResponse } from "../actions/response";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

type ChatInterfaceProps = {
  content?: {
    transcript?: string;
    notes?: string;
    summary?: string;
  };
};

// Get the API URL from environment variables with a fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function ChatInterface({ content }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isProcessing) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    setIsProcessing(true);
    setIsTyping(true);

    try {
      const data = await getResponse(content || {}, newMessage.content);

      // Simulate typing effect
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsTyping(false);
      await new Promise((resolve) => setTimeout(resolve, 300));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || "I apologize, but I couldn't generate a response. Please try again.",
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I couldn't process your message. Please try again.",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceMessage = async (audioBlob: Blob) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onload = async () => {
        const base64Audio = reader.result as string;
        const data = await getResponse({}, "Process this voice message");
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          role: "assistant",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      };
    } catch (error) {
      console.error("Error processing voice message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Sorry, I couldn't process your voice message. Please try again.",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        setIsProcessingVoice(true);

        const newMessage: Message = {
          id: Date.now().toString(),
          content: "🎤 Voice message",
          role: "user",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, newMessage]);

        await handleVoiceMessage(audioBlob);
        setIsProcessingVoice(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-12rem)] max-h-[800px]">
      <div className="p-4 border-b dark:border-gray-700">
        <h3 className="font-semibold">Chat Assistant</h3>
      </div>

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-auto p-4 space-y-4"
      >
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 overflow-x-auto ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </motion.div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 flex gap-1">
                <motion.span
                  className="w-2 h-2 bg-gray-500 rounded-full"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.span
                  className="w-2 h-2 bg-gray-500 rounded-full"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.span
                  className="w-2 h-2 bg-gray-500 rounded-full"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-900">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isProcessing}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={isRecording ? stopRecording : startRecording}
            className={isRecording ? "text-red-500" : ""}
            disabled={isProcessing}
          >
            {isRecording ? (
              <StopCircle className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
          <Button
            type="submit"
            size="icon"
            disabled={isProcessing || !inputMessage.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
