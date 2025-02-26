import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export async function POST(req: Request) {
  const { messages, subject } = await req.json()

  // Add system message to guide the AI in generating educational content
  const systemMessage = `You are an educational AI tutor specializing in ${subject}. 
    Generate appropriate practice questions, provide helpful explanations, and give 
    constructive feedback. Use LaTeX notation for mathematical expressions.`

  const result = streamText({
    model: openai("gpt-4-turbo"),
    messages: [{ role: "system", content: systemMessage }, ...messages],
  })

  return result.toDataStreamResponse()
}

