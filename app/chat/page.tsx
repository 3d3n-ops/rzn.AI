"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Mic, MicOff } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface Message {
  id: number
  text: string
  sender: "user" | "bot"
}

interface Question {
  id: number
  text: string
  equation: string
  answers: string[]
  correctAnswer: number
}

export default function ChatPage() {
  const [isListening, setIsListening] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [progress, setProgress] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: 1,
    text: "Find the derivative of this equation:",
    equation: "f(x) = 6x^3 - 5x + 4",
    answers: ["18x² - 5", "6x² - 10", "18x", "5x"],
    correctAnswer: 0,
  })

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm here to help you practice calculus through interactive questions.", sender: "bot" },
    { id: 2, text: "You can use voice commands to answer questions or ask for help.", sender: "bot" },
  ])

  const toggleListening = () => {
    setIsListening(!isListening)
    // Add voice recognition logic here
  }

  const handleAnswerSubmit = (value: string) => {
    setSelectedAnswer(value)
    setProgress((prev) => Math.min(prev + 20, 100))

    // Add new messages to show feedback
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: `I choose option ${value.toUpperCase()}`, sender: "user" },
      {
        id: Date.now() + 1,
        text:
          value === "a"
            ? "Correct! The derivative of 6x³ is 18x², and the derivative of -5x is -5."
            : "Not quite. Let's review the power rule: the derivative of xⁿ is n·x^(n-1)",
        sender: "bot",
      },
    ])
  }

  return (
    <div className="min-h-screen grid grid-cols-[1fr_350px] bg-gray-50">
      <div className="p-6 overflow-auto">
        <Card className="mb-4">
          <div className="p-4 border-b">
            <Progress value={progress} className="mb-2" />
            <div className="text-sm text-muted-foreground">Question {currentQuestion.id} of 5</div>
          </div>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">Question {currentQuestion.id}</h2>
            <p className="mb-3 text-gray-600">{currentQuestion.text}</p>
            <div className="p-4 bg-gray-50 rounded-lg mb-6 font-mono text-lg">{currentQuestion.equation}</div>

            <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSubmit}>
              <div className="space-y-4">
                {currentQuestion.answers.map((answer, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors
                      ${
                        selectedAnswer === String.fromCharCode(97 + index)
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-gray-50"
                      }`}
                  >
                    <RadioGroupItem value={String.fromCharCode(97 + index)} id={String.fromCharCode(97 + index)} />
                    <Label htmlFor={String.fromCharCode(97 + index)} className="flex-grow cursor-pointer font-mono">
                      {answer}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        </Card>
      </div>

      <div className="border-l bg-white flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Chat Assistant</h3>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-2xl px-4 py-2 max-w-[90%] ${
                    message.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t">
          <div className="flex justify-center">
            <Button
              onClick={toggleListening}
              className={`w-16 h-16 rounded-full transition-all ${
                isListening
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700"
              }`}
            >
              {isListening ? <MicOff className="h-6 w-6 text-white" /> : <Mic className="h-6 w-6 text-white" />}
            </Button>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            {isListening ? "Listening..." : "Press to speak"}
          </p>
        </div>
      </div>
    </div>
  )
}

