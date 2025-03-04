"use client";

// pages/voice-tutor.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ErrorState = {
  message: string;
  type:
    | "microphone"
    | "transcription"
    | "ai-response"
    | "text-to-speech"
    | null;
};

export default function VoiceTutor() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [audioPlayback, setAudioPlayback] = useState<HTMLAudioElement | null>(
    null
  );
  const [error, setError] = useState<ErrorState>({ message: "", type: null });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize audio element
  useEffect(() => {
    setAudioPlayback(new Audio());

    // Cleanup function
    return () => {
      if (mediaRecorderRef.current) {
        const tracks = mediaRecorderRef.current.stream?.getTracks();
        tracks?.forEach((track) => track.stop());
      }
      if (audioPlayback) {
        audioPlayback.pause();
        audioPlayback.src = "";
      }
    };
  }, []);

  // Start recording user's voice
  const startRecording = async () => {
    try {
      setError({ message: "", type: null });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = handleAudioSubmission;

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setError({
        message: "Cannot access your microphone. Please check permissions.",
        type: "microphone",
      });
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  // Process audio after recording stops
  const handleAudioSubmission = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

    try {
      const transcription = await transcribeAudio(audioBlob);
      setTranscript(transcription);

      const newUserMessage: Message = { role: "user", content: transcription };
      const updatedConversation: Message[] = [...conversation, newUserMessage];
      setConversation(updatedConversation);

      const response = await getClaudeResponse(updatedConversation);
      const assistantMessage: Message = {
        role: "assistant",
        content: response,
      };
      setConversation([...updatedConversation, assistantMessage]);

      await speakResponse(response);
    } catch (error) {
      console.error("Error in audio submission process:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Memoize API calls to prevent unnecessary re-renders
  const memoizedTranscribeAudio = useCallback(
    async (audioBlob: Blob): Promise<string> => {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");

      try {
        const response = await axios.post(
          "http://localhost:8000/api/transcribe",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Accept: "application/json",
            },
            withCredentials: true,
          }
        );

        if (!response.data.text) {
          throw new Error("No transcription received from the server");
        }

        return response.data.text;
      } catch (error) {
        console.error("Error transcribing audio:", error);
        if (axios.isAxiosError(error)) {
          if (error.code === "ERR_NETWORK") {
            setError({
              message:
                "Cannot connect to transcription service. Please check if the backend server is running.",
              type: "transcription",
            });
          } else if (error.response?.status === 404) {
            setError({
              message:
                "Transcription service not found. Please check your API configuration.",
              type: "transcription",
            });
          } else if (error.response?.status === 500) {
            setError({
              message: "Server error during transcription. Please try again.",
              type: "transcription",
            });
          } else {
            setError({
              message:
                error.response?.data?.detail ||
                "Failed to transcribe your speech. Please try again.",
              type: "transcription",
            });
          }
        } else {
          setError({
            message: "Failed to transcribe your speech. Please try again.",
            type: "transcription",
          });
        }
        throw error;
      }
    },
    []
  );

  const memoizedGetClaudeResponse = useCallback(
    async (messages: Message[]): Promise<string> => {
      try {
        const response = await axios.post(
          "http://localhost:8000/api/chat",
          {
            messages: messages,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            withCredentials: true,
          }
        );

        return response.data.response;
      } catch (error) {
        console.error("Error getting Claude response:", error);
        if (axios.isAxiosError(error)) {
          if (error.code === "ERR_NETWORK") {
            setError({
              message:
                "Cannot connect to AI service. Please check if the backend server is running.",
              type: "ai-response",
            });
          } else {
            setError({
              message:
                error.response?.data?.detail ||
                "Failed to get AI response. Please try again.",
              type: "ai-response",
            });
          }
        } else {
          setError({
            message: "Failed to get AI response. Please try again.",
            type: "ai-response",
          });
        }
        throw error;
      }
    },
    []
  );

  // Loading state component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" />
      <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-100" />
      <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-200" />
    </div>
  );

  // Send audio to backend for Whisper transcription
  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    return memoizedTranscribeAudio(audioBlob);
  };

  // Get response from Claude via backend
  const getClaudeResponse = async (messages: Message[]): Promise<string> => {
    return memoizedGetClaudeResponse(messages);
  };

  // Convert text to speech via backend
  const speakResponse = async (text: string): Promise<void> => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/text-to-speech",
        { text },
        {
          responseType: "blob",
          headers: {
            "Content-Type": "application/json",
            Accept: "audio/mpeg",
          },
          withCredentials: true,
        }
      );

      const audioBlob = response.data;
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioPlayback) {
        audioPlayback.src = audioUrl;
        await audioPlayback.play();
      }
    } catch (error) {
      console.error("Error converting text to speech:", error);
      if (axios.isAxiosError(error)) {
        setError({
          message:
            error.response?.data?.detail || "Error playing audio response",
          type: "text-to-speech",
        });
      } else {
        setError({
          message: "Error playing audio response",
          type: "text-to-speech",
        });
      }
      throw error;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">AI Study Assistant</h1>

      {error.message && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p className="font-semibold">Error: {error.message}</p>
        </div>
      )}

      <div className="bg-gray-100 p-4 rounded-lg mb-6 h-96 overflow-y-auto">
        {conversation.length === 0 ? (
          <p className="text-gray-500 italic">
            Start a conversation with your AI tutor...
          </p>
        ) : (
          conversation.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 p-3 rounded-lg ${
                msg.role === "user" ? "bg-blue-100" : "bg-green-100"
              }`}
            >
              <p className="font-semibold">
                {msg.role === "user" ? "You" : "AI Tutor"}
              </p>
              <p>{msg.content}</p>
            </div>
          ))
        )}
      </div>

      {transcript && (
        <div className="mb-4 p-3 bg-gray-200 rounded-lg">
          <p className="font-semibold">Recognized Speech:</p>
          <p>{transcript}</p>
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`px-6 py-3 rounded-full font-semibold transition-all ${
            isRecording
              ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
      </div>

      {isProcessing && (
        <div className="text-center mt-4">
          <LoadingSpinner />
          <p className="text-gray-600 mt-2">Processing your question...</p>
        </div>
      )}
    </div>
  );
}
