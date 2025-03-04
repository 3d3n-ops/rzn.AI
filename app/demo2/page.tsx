"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Mic,
  MicOff,
  Info,
  BookOpen,
  BarChart2,
  Clock,
  Award,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
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

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

interface Question {
  id: number;
  text: string;
  equation: string | null;
  answers: string[];
  correctAnswer: number;
  category: "calculus" | "algebra" | "trigonometry";
  difficulty: "easy" | "medium" | "hard";
  timeTaken?: number;
}

interface PerformanceData {
  category: string;
  correct: number;
  total: number;
  averageTime: number;
}

export default function StudyAssistant() {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [progress, setProgress] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showHint, setShowHint] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([
    { category: "calculus", correct: 3, total: 4, averageTime: 45 },
    { category: "algebra", correct: 2, total: 3, averageTime: 32 },
    { category: "trigonometry", correct: 1, total: 3, averageTime: 56 },
  ]);

  // Track answered questions for analytics
  const [answeredQuestions, setAnsweredQuestions] = useState<Question[]>([]);

  // Sample study questions
  const studyQuestions: Question[] = [
    {
      id: 1,
      text: "Find the derivative of this equation:",
      equation: "f(x) = 6x^3 - 5x + 4",
      answers: ["18x² - 5", "6x² - 10", "18x", "5x"],
      correctAnswer: 0,
      category: "calculus",
      difficulty: "medium",
    },
    {
      id: 2,
      text: "Solve for x:",
      equation: "2x² + 5x - 3 = 0",
      answers: [
        "x = 0.5, x = -3",
        "x = 0.5, x = -3.5",
        "x = 1, x = -3",
        "x = -0.5, x = 3",
      ],
      correctAnswer: 1,
      category: "algebra",
      difficulty: "medium",
    },
    {
      id: 3,
      text: "What is the integral of this function?",
      equation: "f(x) = 4x³ + 2x",
      answers: ["x⁴ + x² + C", "x⁴ + x² - 7", "16x² + 2", "x⁴ + x² + 4"],
      correctAnswer: 0,
      category: "calculus",
      difficulty: "hard",
    },
    {
      id: 4,
      text: "Find the value of sin(30°) + cos(60°)",
      equation: null,
      answers: ["1", "1.5", "0.5", "2"],
      correctAnswer: 0,
      category: "trigonometry",
      difficulty: "easy",
    },
    {
      id: 5,
      text: "Simplify the expression:",
      equation: "(3x² - 2x + 4) - (x² + 3x - 5)",
      answers: ["2x² - 5x + 9", "4x² - 5x - 1", "2x² - 5x - 1", "2x² + x + 9"],
      correctAnswer: 0,
      category: "algebra",
      difficulty: "medium",
    },
  ];

  const [currentQuestion, setCurrentQuestion] = useState<Question>(
    studyQuestions[0]
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI study assistant. I'll help you practice problems from your materials.",
      sender: "bot",
    },
    {
      id: 2,
      text: "You can use voice commands to answer questions or say 'hint' if you need help.",
      sender: "bot",
    },
  ]);

  // Auto-scroll to the bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate voice recognition
  const toggleListening = () => {
    setIsListening(!isListening);

    if (!isListening) {
      // Simulating voice input after 2 seconds
      setTimeout(() => {
        const responses = ["a", "b", "c", "d", "hint", "explain", "skip"];
        const randomResponse =
          responses[Math.floor(Math.random() * responses.length)];

        if (randomResponse === "hint") {
          handleHintRequest();
        } else if (randomResponse === "explain") {
          handleExplainRequest();
        } else if (randomResponse === "skip") {
          handleSkipQuestion();
        } else {
          handleVoiceAnswer(randomResponse);
        }

        setIsListening(false);
      }, 2000);
    }
  };

  const handleVoiceAnswer = (answer: string) => {
    // Add message to show what user said
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: `I said: "${answer}"`,
        sender: "user",
      },
    ]);

    // Map voice input to answer choice
    if (["a", "b", "c", "d"].includes(answer.toLowerCase())) {
      handleAnswerSubmit(answer.toLowerCase());
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "Sorry, I didn't catch that. Please say A, B, C, or D for your answer, or 'hint' if you need help.",
          sender: "bot",
        },
      ]);
    }
  };

  const handleHintRequest = () => {
    setShowHint(true);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: "I need a hint please.",
        sender: "user",
      },
      {
        id: Date.now() + 1,
        text: getHintForQuestion(currentQuestion),
        sender: "bot",
      },
    ]);
  };

  const handleExplainRequest = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: "Can you explain this concept?",
        sender: "user",
      },
      {
        id: Date.now() + 1,
        text: getExplanationForQuestion(currentQuestion),
        sender: "bot",
      },
    ]);
  };

  const handleSkipQuestion = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: "I want to skip this question.",
        sender: "user",
      },
      {
        id: Date.now() + 1,
        text: "I'll mark this for review later. Let's move on to the next question.",
        sender: "bot",
      },
    ]);

    moveToNextQuestion(false);
  };

  const getHintForQuestion = (question: Question): string => {
    const hints = {
      1: "Remember the power rule for derivatives: if f(x) = x^n, then f'(x) = n·x^(n-1).",
      2: "You can use the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a where a=2, b=5, c=-3.",
      3: "For integration, increase the power by 1 and divide by the new power: ∫x^n dx = x^(n+1)/(n+1) + C.",
      4: "Recall that sin(30°) = 1/2 and cos(60°) = 1/2.",
      5: "Combine like terms. Pay attention to the negative sign before the second parentheses.",
    };

    return (
      hints[question.id as keyof typeof hints] ||
      "Focus on the fundamentals of this topic."
    );
  };

  const getExplanationForQuestion = (question: Question): string => {
    const explanations = {
      1: "For the derivative of f(x) = 6x³ - 5x + 4, we apply the power rule and constant rule. The derivative of 6x³ is 18x², the derivative of -5x is -5, and the derivative of 4 is 0. So f'(x) = 18x² - 5.",
      2: "Using the quadratic formula for 2x² + 5x - 3 = 0: x = (-5 ± √(5² - 4×2×(-3))) / (2×2) = (-5 ± √(25 + 24)) / 4 = (-5 ± √49) / 4 = (-5 ± 7) / 4, which gives x = 0.5 or x = -3.",
      3: "To find the integral of f(x) = 4x³ + 2x, we use the power rule for integration: ∫x^n dx = x^(n+1)/(n+1) + C. So ∫(4x³ + 2x)dx = 4(x⁴/4) + 2(x²/2) + C = x⁴ + x² + C.",
      4: "We know that sin(30°) = 1/2 and cos(60°) = 1/2. So sin(30°) + cos(60°) = 1/2 + 1/2 = 1.",
      5: "To simplify (3x² - 2x + 4) - (x² + 3x - 5), we distribute the negative: 3x² - 2x + 4 - x² - 3x + 5 = (3x² - x²) + (-2x - 3x) + (4 + 5) = 2x² - 5x + 9.",
    };

    return (
      explanations[question.id as keyof typeof explanations] ||
      "This involves applying core principles of the subject."
    );
  };

  const getFeedbackForAnswer = (
    question: Question,
    isCorrect: boolean
  ): string => {
    if (isCorrect) {
      const correctResponses = [
        `Excellent! That's correct.`,
        `Great job! You've got it right.`,
        `Perfect! You're understanding this concept well.`,
        `That's right! Well done.`,
        `Correct! You're making good progress.`,
      ];
      return correctResponses[
        Math.floor(Math.random() * correctResponses.length)
      ];
    } else {
      const incorrectResponses = {
        1: "Not quite. Remember that when finding the derivative of a polynomial, you multiply each term by its exponent and reduce the exponent by 1.",
        2: "That's not right. When solving quadratic equations, double-check your calculations in the quadratic formula.",
        3: "That's incorrect. For integration, we increase the power by 1 and divide by the new power.",
        4: "That's not correct. Remember the special angle values in trigonometry.",
        5: "Not right. When combining like terms with parentheses, be careful with the signs.",
      };

      return (
        incorrectResponses[question.id as keyof typeof incorrectResponses] ||
        "Not quite right. Let's review this concept."
      );
    }
  };

  const handleAnswerSubmit = (value: string) => {
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    const answerIndex = value.charCodeAt(0) - 97; // Convert a-d to 0-3
    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    // Update current question with time taken
    const answeredQuestion = {
      ...currentQuestion,
      timeTaken,
    };

    // Add to answered questions
    setAnsweredQuestions((prev) => [...prev, answeredQuestion]);

    setSelectedAnswer(value);

    // Add new messages to show feedback
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: `I choose option ${value.toUpperCase()}`,
        sender: "user",
      },
      {
        id: Date.now() + 1,
        text: getFeedbackForAnswer(currentQuestion, isCorrect),
        sender: "bot",
      },
    ]);

    // Show toast for feedback
    toast({
      title: isCorrect ? "Correct!" : "Incorrect",
      description: isCorrect ? "You're doing great!" : "Let's learn from this.",
      variant: isCorrect ? "default" : "destructive",
    });

    // Move to next question after a short delay
    setTimeout(() => {
      moveToNextQuestion(true);
    }, 2000);
  };

  const moveToNextQuestion = (updateProgress: boolean) => {
    if (updateProgress) {
      setProgress((prev) => {
        const newProgress = prev + 100 / studyQuestions.length;
        if (newProgress >= 100) {
          setSessionComplete(true);
          setShowPerformance(true);
        }
        return Math.min(newProgress, 100);
      });
    }

    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < studyQuestions.length) {
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(studyQuestions[nextIndex]);
      setSelectedAnswer("");
      setShowHint(false);
      setQuestionStartTime(Date.now());

      // Add transition message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: `Moving on to question ${nextIndex + 1}...`,
          sender: "bot",
        },
      ]);
    } else {
      // End of questions
      setSessionComplete(true);
      setShowPerformance(true);

      // Final message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "Great job completing all the questions! Let's take a look at your performance.",
          sender: "bot",
        },
      ]);
    }
  };

  // Calculate performance metrics for heatmap
  useEffect(() => {
    if (answeredQuestions.length > 0) {
      // Organize by category
      const categoryData: {
        [key: string]: { correct: number; total: number; totalTime: number };
      } = {};

      answeredQuestions.forEach((q) => {
        if (!categoryData[q.category]) {
          categoryData[q.category] = { correct: 0, total: 0, totalTime: 0 };
        }

        categoryData[q.category].total += 1;
        categoryData[q.category].totalTime += q.timeTaken || 0;

        const answerIndex = Object.keys("abcd")[q.correctAnswer];
        if (selectedAnswer === answerIndex) {
          categoryData[q.category].correct += 1;
        }
      });

      // Format data for the performance chart
      const formattedData = Object.entries(categoryData).map(
        ([category, data]) => ({
          category,
          correct: data.correct,
          total: data.total,
          averageTime: Math.round(data.totalTime / data.total),
        })
      );

      setPerformanceData(formattedData);
    }
  }, [answeredQuestions, selectedAnswer]);

  // Calculate color for performance heatmap
  const getPerformanceColor = (ratio: number) => {
    if (ratio >= 0.8) return "bg-green-500";
    if (ratio >= 0.6) return "bg-green-300";
    if (ratio >= 0.4) return "bg-yellow-300";
    if (ratio >= 0.2) return "bg-orange-300";
    return "bg-red-300";
  };

  // Get recommendation based on performance
  const getRecommendation = (data: PerformanceData) => {
    const ratio = data.correct / data.total;
    const recommendations = {
      calculus: [
        "Review the power rule and chain rule for derivatives.",
        "Practice more integration problems with substitution.",
        "Work on understanding the relationship between derivatives and integrals.",
      ],
      algebra: [
        "Focus on factoring polynomials and solving quadratic equations.",
        "Review systems of equations and how to solve them.",
        "Practice simplifying complex algebraic expressions.",
      ],
      trigonometry: [
        "Memorize the common angle values for sine, cosine, and tangent.",
        "Practice the trigonometric identities, especially the Pythagorean identities.",
        "Work on applying trigonometry to real-world problems.",
      ],
    };

    const categoryRecs =
      recommendations[data.category as keyof typeof recommendations] || [];

    if (ratio < 0.5) {
      return `Needs improvement: ${categoryRecs[0]}`;
    } else if (ratio < 0.8) {
      return `Good progress: ${categoryRecs[1]}`;
    } else {
      return `Excellent: ${categoryRecs[2] || "Keep up the good work!"}`;
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[1fr_350px] bg-gray-50">
      <Tabs defaultValue="questions" className="h-full flex flex-col">
        <TabsList className="mx-6 mt-6 mb-2">
          <TabsTrigger value="questions">
            <BookOpen className="mr-2 h-4 w-4" /> Questions
          </TabsTrigger>
          <TabsTrigger value="performance" disabled={!showPerformance}>
            <BarChart2 className="mr-2 h-4 w-4" /> Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="flex-1 p-6 overflow-auto">
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <Progress value={progress} className="mb-2" />
              <div className="text-sm text-muted-foreground flex justify-between">
                <span>
                  Question {currentQuestionIndex + 1} of {studyQuestions.length}
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {Math.floor((Date.now() - questionStartTime) / 1000)}s
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center mb-2">
                <h2 className="text-xl font-semibold">
                  Question {currentQuestionIndex + 1}
                </h2>
                <span className="ml-2 px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                  {currentQuestion.category}
                </span>
                <span className="ml-2 px-2 py-1 text-xs rounded bg-purple-100 text-purple-800">
                  {currentQuestion.difficulty}
                </span>
              </div>

              <p className="mb-3 text-gray-600">{currentQuestion.text}</p>
              {currentQuestion.equation && (
                <div className="p-4 bg-gray-50 rounded-lg mb-6 font-mono text-lg">
                  {currentQuestion.equation}
                </div>
              )}

              {showHint && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4 text-sm">
                  <div className="flex items-center text-yellow-800 font-medium mb-1">
                    <Info className="h-4 w-4 mr-1" /> Hint:
                  </div>
                  <p>{getHintForQuestion(currentQuestion)}</p>
                </div>
              )}

              <RadioGroup
                value={selectedAnswer}
                onValueChange={handleAnswerSubmit}
                className="mt-4"
              >
                <div className="space-y-4">
                  {currentQuestion.answers.map((answer, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors
                        ${
                          selectedAnswer === String.fromCharCode(97 + index)
                            ? "bg-blue-50 border border-blue-200"
                            : "hover:bg-gray-50 border border-transparent"
                        }`}
                    >
                      <RadioGroupItem
                        value={String.fromCharCode(97 + index)}
                        id={String.fromCharCode(97 + index)}
                        disabled={!!selectedAnswer}
                      />
                      <Label
                        htmlFor={String.fromCharCode(97 + index)}
                        className="flex-grow cursor-pointer font-medium"
                      >
                        <span className="font-mono mr-2">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        {answer}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button
                variant="outline"
                onClick={handleHintRequest}
                disabled={showHint || !!selectedAnswer}
              >
                <Info className="mr-2 h-4 w-4" />
                Need a hint?
              </Button>
              <Button
                variant="outline"
                onClick={handleSkipQuestion}
                disabled={!!selectedAnswer}
              >
                Skip question
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="flex-1 p-6 overflow-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-medium mb-4">Subject Performance</h3>
              <div className="space-y-6">
                {performanceData.map((data, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium capitalize">
                        {data.category}
                      </h4>
                      <span className="text-sm">
                        {data.correct}/{data.total} correct (
                        {Math.round((data.correct / data.total) * 100)}%)
                      </span>
                    </div>
                    <div className="h-8 w-full bg-gray-100 rounded-md overflow-hidden flex">
                      <div
                        className={`${getPerformanceColor(
                          data.correct / data.total
                        )} h-full flex items-center justify-center text-xs font-medium text-white`}
                        style={{
                          width: `${(data.correct / data.total) * 100}%`,
                        }}
                      >
                        {Math.round((data.correct / data.total) * 100)}%
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Avg. time: {data.averageTime}s per question</span>
                      {data.averageTime > 45 && (
                        <span className="text-orange-500">
                          Consider reviewing for speed
                        </span>
                      )}
                    </div>
                    <div className="mt-1 p-2 bg-gray-50 text-sm rounded border">
                      <strong>Recommendation:</strong> {getRecommendation(data)}
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-medium mt-8 mb-4">Skill Heatmap</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  "Derivatives",
                  "Integrals",
                  "Factoring",
                  "Equations",
                  "Trigonometry",
                  "Functions",
                ].map((skill, i) => {
                  const score = Math.random(); // In real app, calculate from actual performance
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded ${getPerformanceColor(
                        score
                      )} text-center`}
                    >
                      <div className="text-white font-medium">{skill}</div>
                      <div className="text-white text-xs">
                        {Math.round(score * 100)}%
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-800 mb-2">
                  Study Recommendations:
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="inline-block bg-blue-200 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                      1
                    </span>
                    <span>
                      Focus on improving your understanding of integration
                      techniques
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block bg-blue-200 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                      2
                    </span>
                    <span>
                      Review trigonometric identities and special angles
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block bg-blue-200 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                      3
                    </span>
                    <span>
                      Practice solving quadratic equations more quickly
                    </span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="border-l bg-white flex flex-col h-screen">
        {/* Fixed height chat container with its own scrollbar */}
        <div
          className="flex-1 overflow-y-auto p-4"
          style={{ height: "calc(100vh - 80px)" }}
        >
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-2 max-w-[90%] ${
                    message.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {/* Empty div for auto-scrolling to bottom */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="p-4 border-t mt-auto">
          <div className="flex justify-center">
            <Button
              onClick={toggleListening}
              className={`w-16 h-16 rounded-full transition-all ${
                isListening
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700"
              }`}
              disabled={sessionComplete}
            >
              {isListening ? (
                <MicOff className="h-6 w-6 text-white" />
              ) : (
                <Mic className="h-6 w-6 text-white" />
              )}
            </Button>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            {isListening ? "Listening..." : "Press to speak"}
          </p>
          <div className="text-center text-xs text-muted-foreground mt-1">
            Try saying: "A", "B", "C", "D", "hint", or "explain"
          </div>
        </div>
      </div>

      {/* Session Complete Dialog */}
      <AlertDialog open={sessionComplete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Study Session Complete!</AlertDialogTitle>
            <AlertDialogDescription>
              Great job completing your study session. You answered{" "}
              {performanceData.reduce((acc, item) => acc + item.correct, 0)}{" "}
              questions correctly out of{" "}
              {performanceData.reduce((acc, item) => acc + item.total, 0)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setSessionComplete(false)}>
              View Performance
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
