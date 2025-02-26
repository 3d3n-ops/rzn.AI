"use client"

import { useState } from "react"
import { useChat } from "ai/react"
import { Home, FileText, Settings, Send, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

export default function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()
  const [isRecording, setIsRecording] = useState(false)

  const handleVoiceInput = () => {
    setIsRecording(!isRecording)
    // Add voice recording logic here
  }

  return (
    <div className="flex h-[600px]">
      <div className="w-16 border-r bg-gray-50 flex flex-col items-center py-4 gap-6">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Home className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <FileText className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="border-b p-4">
          <h2 className="font-semibold">Chats</h2>
        </div>

        <Tabs defaultValue="answer" className="flex-1">
          <TabsList className="px-4 py-2">
            <TabsTrigger value="answer">Answer</TabsTrigger>
            <TabsTrigger value="ranked">Ranked Citations</TabsTrigger>
            <TabsTrigger value="all">All Citations</TabsTrigger>
          </TabsList>

          <TabsContent value="answer" className="flex-1 p-4 overflow-auto">
            {messages.map((message) => (
              <div key={message.id} className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}>
                <span
                  className={`inline-block p-3 rounded-lg ${
                    message.role === "user" ? "bg-purple-600 text-white" : "bg-gray-100"
                  }`}
                >
                  {message.content}
                </span>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="ranked" className="flex-1 p-4">
            Ranked citations will appear here
          </TabsContent>

          <TabsContent value="all" className="flex-1 p-4">
            All citations will appear here
          </TabsContent>
        </Tabs>

        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message here..."
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleVoiceInput}
              className={isRecording ? "bg-red-100" : ""}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button type="submit" size="icon" className="bg-purple-600 hover:bg-purple-700">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

