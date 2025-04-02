"use client";

import { useState } from "react";
import {
  Upload,
  Mic,
  FileText,
  List,
  BookOpen,
  Save,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { ChatInterface } from "../components/ChatInterface";
import { Header } from "../components/Header";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { summarizeContent } from "../actions/summarize";
import { transcribeAudio } from "../actions/transcribe";

type StudyFormatType = "notes" | "summary" | "quiz" | "record";
type OutputType = StudyFormatType;

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

type Quiz = {
  title: string;
  description: string;
  questions: QuizQuestion[];
};

type StudyResponse = {
  summary?: string;
  notes?: string;
  quiz?: Quiz;
  transcript?: string;
};

const studyFormats = [
  { id: "notes", label: "Notes", icon: FileText },
  { id: "summary", label: "Summary", icon: List },
  { id: "quiz", label: "Quiz", icon: BookOpen },
  { id: "record", label: "Upload Audio", icon: Upload },
];

type CodeProps = {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  style?: any;
} & React.HTMLAttributes<HTMLElement>;

export default function Notes() {
  const { user, isLoaded } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [outputType, setOutputType] = useState<StudyFormatType>("summary");
  const [response, setResponse] = useState<StudyResponse>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [fileName, setFileName] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [showAudioUpload, setShowAudioUpload] = useState(false);

  // Handle format selection
  const handleFormatSelect = (format: StudyFormatType) => {
    setOutputType(format);
    setFile(null); // Clear any existing file
    setResponse({}); // Clear any existing response
    
    if (format === "record") {
      setShowAudioUpload(true);
    } else {
      setShowAudioUpload(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (outputType === "record") {
        if (!selectedFile.type.startsWith('audio/')) {
          setError("Please select an audio file (MP3, WAV, M4A, etc.)");
          return;
        }
        if (selectedFile.size > 50 * 1024 * 1024) {
          setError("Audio file size must be less than 50MB");
          return;
        }
      }
      setFile(selectedFile);
      setError(""); // Clear any previous errors
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (!file) {
        throw new Error("No file selected");
      }

      let data;
      if (outputType === "record") {
        data = await transcribeAudio(file);
      } else {
        data = await summarizeContent(file, outputType);
      }

      setResponse(data);

      if (outputType === "quiz" && !data.quiz) {
        throw new Error("No quiz data received");
      }

      if (outputType === "quiz") {
        setQuiz(data.quiz);
      }
    } catch (error) {
      console.error("Error generating content:", error);
      setError(error instanceof Error ? error.message : "Failed to generate content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordLecture = () => {
    setOutputType("record");
    setResponse({}); // Clear any previous responses
    setFile(null); // Clear any uploaded file
  };

  const handleSaveToFile = async () => {
    if (!fileName) return;

    let content = "";
    const timestamp = new Date().toISOString().split("T")[0];
    const defaultFileName = `${
      fileName.trim() || "study-material"
    }-${timestamp}`;

    if (outputType === "notes" || outputType === "summary") {
      content =
        outputType === "notes" ? response.notes || "" : response.summary || "";
    } else if (outputType === "record") {
      // For audio transcription, include both transcript and notes
      content = `# Audio Transcription Notes\n\n`;
      if (response.transcript) {
        content += `## Transcript\n\n${response.transcript}\n\n`;
      }
      if (response.notes) {
        content += `## Generated Notes\n\n${response.notes}`;
      }
    }

    if (!content) {
      setError("No content to save");
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
    } catch (error) {
      setError("Failed to save file");
    }
  };

  const renderQuiz = () => {
    if (!response.quiz) {
      console.log("No quiz data available in response");
      return null;
    }

    console.log("Rendering quiz with data:", response.quiz);

    try {
      const quiz = response.quiz;
      if (
        !quiz.questions ||
        !Array.isArray(quiz.questions) ||
        quiz.questions.length === 0
      ) {
        console.error("Invalid quiz questions format:", quiz.questions);
        return (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
            Quiz format is invalid. Please try again.
          </div>
        );
      }

      const currentQuestion = quiz.questions[currentQuestionIndex];
      if (!currentQuestion) {
        console.error("Cannot access question at index:", currentQuestionIndex);
        return (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg">
            Unable to load question. Please try again.
          </div>
        );
      }

      console.log("Current question:", currentQuestion);

      const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
      const hasAnsweredCurrent =
        selectedAnswers[currentQuestion.id] !== undefined;
      const isCorrect =
        selectedAnswers[currentQuestion.id] === currentQuestion.correctAnswer;

      return (
        <div className="space-y-6">
          {!showResults ? (
            <>
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">{quiz.title}</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {quiz.description}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-500">
                    Question {currentQuestionIndex + 1} of{" "}
                    {quiz.questions.length}
                  </span>
                  <div className="h-1 flex-1 mx-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{
                        width: `${
                          ((currentQuestionIndex + 1) / quiz.questions.length) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium mb-4">
                  {currentQuestion.question}
                </h3>
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (!hasAnsweredCurrent) {
                          setSelectedAnswers((prev) => ({
                            ...prev,
                            [currentQuestion.id]: option,
                          }));
                        }
                      }}
                      disabled={hasAnsweredCurrent}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        hasAnsweredCurrent
                          ? option === currentQuestion.correctAnswer
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : option === selectedAnswers[currentQuestion.id]
                            ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                            : "border-gray-200 dark:border-gray-700"
                          : selectedAnswers[currentQuestion.id] === option
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {hasAnsweredCurrent && (
                  <div
                    className={`mt-4 p-4 rounded-lg ${
                      isCorrect
                        ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                        : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                    }`}
                  >
                    <p className="font-medium mb-2">
                      {isCorrect ? "Correct!" : "Incorrect"}
                    </p>
                    <p>{currentQuestion.explanation}</p>
                  </div>
                )}

                <div className="mt-6 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>
                  {hasAnsweredCurrent && (
                    <Button
                      onClick={() => {
                        if (isLastQuestion) {
                          setShowResults(true);
                        } else {
                          setCurrentQuestionIndex((prev) => prev + 1);
                        }
                      }}
                    >
                      {isLastQuestion ? "Show Results" : "Next Question"}
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Quiz Results</h2>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span>Score</span>
                  <span className="text-2xl font-bold">
                    {
                      Object.entries(selectedAnswers).filter(
                        ([id, answer]) =>
                          answer ===
                          quiz.questions.find((q) => q.id === id)?.correctAnswer
                      ).length
                    }{" "}
                    / {quiz.questions.length}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${
                        (Object.entries(selectedAnswers).filter(
                          ([id, answer]) =>
                            answer ===
                            quiz.questions.find((q) => q.id === id)
                              ?.correctAnswer
                        ).length /
                          quiz.questions.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-6">
                {quiz.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="border-b dark:border-gray-700 last:border-0 pb-4 last:pb-0"
                  >
                    <h3 className="font-medium mb-2">
                      {index + 1}. {question.question}
                    </h3>
                    <p
                      className={`mb-2 ${
                        selectedAnswers[question.id] === question.correctAnswer
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      Your answer:{" "}
                      {selectedAnswers[question.id] || "Not answered"}
                    </p>
                    <p className="text-green-600 dark:text-green-400">
                      Correct answer: {question.correctAnswer}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      {question.explanation}
                    </p>
                  </div>
                ))}
              </div>

              <Button
                className="mt-6"
                onClick={() => {
                  setShowResults(false);
                  setCurrentQuestionIndex(0);
                  setSelectedAnswers({});
                }}
              >
                Retake Quiz
              </Button>
            </div>
          )}
        </div>
      );
    } catch (error) {
      console.error("Error rendering quiz:", error);
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          There was an error rendering the quiz. Please check the console for
          details.
        </div>
      );
    }
  };

  const renderContent = () => {
    console.log("Current outputType:", outputType);
    console.log("Current response:", response);

    if (outputType === "record") {
      if (!response.transcript && !response.notes) {
        return (
          <div className="text-center text-gray-500">
            Upload an audio file and click "Transcribe Audio" to get started
          </div>
        );
      }

      return (
        <div className="space-y-6">
          {response.transcript && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Transcript</h2>
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold mb-4">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-bold mb-3">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-bold mb-2">{children}</h3>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-6 mb-4">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-6 mb-4">{children}</ol>
                    ),
                    li: ({ children }) => <li className="mb-2">{children}</li>,
                    p: ({ children }) => <p className="mb-4">{children}</p>,
                  }}
                >
                  {response.transcript}
                </ReactMarkdown>
              </div>
            </div>
          )}
          {response.notes && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Generated Notes</h2>
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold mb-4">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-bold mb-3">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-bold mb-2">{children}</h3>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-6 mb-4">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-6 mb-4">{children}</ol>
                    ),
                    li: ({ children }) => <li className="mb-2">{children}</li>,
                    p: ({ children }) => <p className="mb-4">{children}</p>,
                  }}
                >
                  {response.notes}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (Object.keys(response).length === 0) {
      return (
        <div className="text-center text-gray-500">
          Upload a file and select a study format to get started
        </div>
      );
    }

    const getContent = () => {
      switch (outputType) {
        case "summary":
          return response.summary || "";
        case "notes":
          return response.notes || "";
        default:
          return "";
      }
    };

    if (outputType === "quiz") {
      return renderQuiz();
    }

    if (outputType === "notes" || outputType === "summary") {
      const content = getContent();
      return content ? (
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: ({ inline, className, children }: CodeProps) => {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={tomorrow as any}
                    language={match[1]}
                    PreTag="div"
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className}>{children}</code>
                );
              },
              h1: ({ children, ...props }) => (
                <h1 className="text-2xl font-bold mb-4" {...props}>
                  {children}
                </h1>
              ),
              h2: ({ children, ...props }) => (
                <h2 className="text-xl font-semibold mb-3" {...props}>
                  {children}
                </h2>
              ),
              h3: ({ children, ...props }) => (
                <h3 className="text-lg font-medium mb-2" {...props}>
                  {children}
                </h3>
              ),
              ul: ({ children, ...props }) => (
                <ul className="list-disc pl-6 mb-4" {...props}>
                  {children}
                </ul>
              ),
              ol: ({ children, ...props }) => (
                <ol className="list-decimal pl-6 mb-4" {...props}>
                  {children}
                </ol>
              ),
              li: ({ children, ...props }) => (
                <li className="mb-1" {...props}>
                  {children}
                </li>
              ),
              p: ({ children, ...props }) => (
                <p className="mb-4" {...props}>
                  {children}
                </p>
              ),
              blockquote: ({ children, ...props }) => (
                <blockquote
                  className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4"
                  {...props}
                >
                  {children}
                </blockquote>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      ) : null;
    }

    return null;
  };

  return (
    <div className="min-h-screen relative">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-20 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">
              What's up,{" "}
              <span className="text-blue-600">
                {isLoaded ? (
                  user?.firstName || user?.username || "there"
                ) : (
                  <span className="animate-pulse">...</span>
                )}
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              What would you like to learn today?
            </p>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Upload and Study Format */}
            <div className="col-span-3 space-y-4">
              {/* File Upload Section */}
              <Card className="p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Study Format Selection */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Study Format</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {studyFormats.map((format) => {
                        const Icon = format.icon;
                        return (
                          <button
                            key={format.id}
                            type="button"
                            onClick={() => handleFormatSelect(format.id as StudyFormatType)}
                            className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all text-sm ${
                              outputType === format.id
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{format.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* File Upload Section - Only show if format is selected */}
                  {outputType && (
                    <div>
                      <label htmlFor="file-upload" className="cursor-pointer block">
                        <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                          {outputType === "record" ? <Mic className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
                          <span className="text-sm">
                            {outputType === "record" ? "Upload audio file" : "Upload study material"}
                          </span>
                        </div>
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept={outputType === "record" ? "audio/*" : ".pdf,.doc,.docx,.txt"}
                        />
                      </label>
                      {outputType === "record" && (
                        <p className="text-xs text-gray-500 mt-2">
                          Supported formats: MP3, WAV, M4A, etc. (max 50MB)
                        </p>
                      )}
                    </div>
                  )}

                  {/* File Preview */}
                  {file && (
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {outputType === "record" ? (
                            <Mic className="h-4 w-4 text-blue-500" />
                          ) : (
                            <FileText className="h-4 w-4 text-blue-500" />
                          )}
                          <div>
                            <p className="text-sm font-medium truncate max-w-[150px]">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFile(null)}
                          className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Generate button - Only show if file is selected */}
                  {file && (
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        outputType === "record" ? "Transcribe Audio" : "Generate"
                      )}
                    </Button>
                  )}
                </form>
              </Card>
            </div>

            {/* Middle Column - Content Display */}
            <div className="col-span-6">
              <Card className="flex flex-col h-[calc(100vh-12rem)] max-h-[800px]">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                  <h3 className="font-semibold">
                    {outputType === "record" ? "Lecture Recorder" : "Generated Study Material"}
                  </h3>
                  {outputType !== "quiz" &&
                    outputType !== "record" &&
                    (response.summary || response.notes) && (
                      <div className="flex items-center gap-2">
                        {showSaveDialog ? (
                          <>
                            <input
                              type="text"
                              placeholder="Enter file name"
                              value={fileName}
                              onChange={(e) => setFileName(e.target.value)}
                              className="px-2 py-1 text-sm border rounded-md dark:bg-gray-800 dark:border-gray-700"
                            />
                            <Button
                              size="sm"
                              onClick={handleSaveToFile}
                              className="flex items-center gap-1"
                            >
                              <Save className="h-4 w-4" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setShowSaveDialog(false);
                                setFileName("");
                              }}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowSaveDialog(true)}
                            className="flex items-center gap-1"
                          >
                            <Copy className="h-4 w-4" />
                            Copy to File
                          </Button>
                        )}
                      </div>
                    )}
                </div>
                <div className="flex-1 overflow-auto p-4">
                  <AnimatePresence mode="wait">
                    {error ? (
                      <motion.div
                        key="error"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg"
                      >
                        {error}
                      </motion.div>
                    ) : isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-12"
                      >
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                          {outputType === "quiz"
                            ? "Generating quiz..."
                            : "Processing your file..."}
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        {renderContent()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </div>

            {/* Right Column - Chat Interface */}
            <div className="col-span-3">
              <ChatInterface />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
