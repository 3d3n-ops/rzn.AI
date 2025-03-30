"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Square, Loader2, Save, Copy, AlertCircle, StopCircle } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion, AnimatePresence } from "framer-motion";
import { transcribeAudio } from "../actions/transcribe";

type CodeProps = {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  style?: any;
} & React.HTMLAttributes<HTMLElement>;

export function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [fileName, setFileName] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check for microphone permission on component mount
  useEffect(() => {
    checkMicrophonePermission();
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setHasPermission(result.state === 'granted');
      
      result.addEventListener('change', () => {
        setHasPermission(result.state === 'granted');
      });
    } catch (error) {
      console.error('Error checking microphone permission:', error);
      setHasPermission(false);
    }
  };

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
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processRecording(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setError("Failed to access microphone. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const processRecording = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Convert audio to a compressed format
      const compressedBlob = await compressAudio(audioBlob);
      const reader = new FileReader();
      reader.readAsDataURL(compressedBlob);

      reader.onloadend = async () => {
        try {
          const base64Audio = reader.result as string;
          // Remove the data URL prefix
          const base64Data = base64Audio.split(',')[1];
          const data = await transcribeAudio(base64Data);
          
          setTranscript(data.transcript);
          setNotes(data.notes);
        } catch (error) {
          console.error("Error processing recording:", error);
          setError("Failed to process recording. Please try again.");
        } finally {
          setIsProcessing(false);
        }
      };
    } catch (error) {
      console.error("Error reading audio file:", error);
      setError("Failed to read audio file. Please try again.");
      setIsProcessing(false);
    }
  };

  const compressAudio = async (blob: Blob): Promise<Blob> => {
    // Create an audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Convert blob to array buffer
    const arrayBuffer = await blob.arrayBuffer();
    
    // Decode audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Create offline context for processing
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );
    
    // Create source and connect to offline context
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    
    // Process audio
    const renderedBuffer = await offlineContext.startRendering();
    
    // Convert to WAV format with lower quality
    const wavBlob = await audioBufferToWav(renderedBuffer, {
      sampleRate: 16000, // Lower sample rate
      bitDepth: 16,
      channels: 1 // Mono audio
    });
    
    return new Blob([wavBlob], { type: 'audio/wav' });
  };

  const audioBufferToWav = (buffer: AudioBuffer, options: { sampleRate: number; bitDepth: number; channels: number }): Uint8Array => {
    const { sampleRate, bitDepth, channels } = options;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = channels * bytesPerSample;
    
    const wav = new ArrayBuffer(44 + buffer.length * blockAlign);
    const view = new DataView(wav);
    
    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + buffer.length * blockAlign, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, buffer.length * blockAlign, true);
    
    // Write audio data
    const data = new Float32Array(buffer.length);
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const channel = buffer.getChannelData(i);
      for (let j = 0; j < channel.length; j++) {
        data[j] += channel[j];
      }
    }
    
    let offset = 44;
    for (let i = 0; i < data.length; i++) {
      const sample = Math.max(-1, Math.min(1, data[i] / buffer.numberOfChannels));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
    
    return new Uint8Array(wav);
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const handleSaveToFile = async () => {
    if (!fileName) return;

    let content = "";
    const timestamp = new Date().toISOString().split("T")[0];
    const defaultFileName = `${fileName.trim() || "lecture-notes"}-${timestamp}`;

    if (transcript && notes) {
      content = `# Lecture Notes\n\n## Transcript\n\n${transcript}\n\n## Generated Notes\n\n${notes}`;
    }

    if (!content) {
      toast.error("No content to save");
      return;
    }

    try {
      const blob = new Blob([content], { type: "text/markdown" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${defaultFileName}.md`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setShowSaveDialog(false);
      setFileName("");
      toast.success("Notes saved successfully!");
    } catch (error) {
      toast.error("Failed to save file");
    }
  };

  if (hasPermission === false) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Microphone Access Required</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            <p>Please allow microphone access to use the lecture recorder.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="lg"
          onClick={isRecording ? stopRecording : startRecording}
          className={isRecording ? "text-red-500" : ""}
          disabled={isProcessing}
        >
          {isRecording ? (
            <>
              <StopCircle className="h-5 w-5 mr-2" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="h-5 w-5 mr-2" />
              Start Recording
            </>
          )}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Processing your recording...
            </p>
          </motion.div>
        )}

        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-lg font-medium mb-2">Transcript</h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="whitespace-pre-wrap">{transcript}</p>
              </div>
            </div>

            {notes && (
              <div>
                <h3 className="text-lg font-medium mb-2">Generated Notes</h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="prose dark:prose-invert max-w-none">
                    {notes}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 