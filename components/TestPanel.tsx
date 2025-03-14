"use client"

import { useState, useRef, useEffect } from "react"
import type { Node, Edge } from "reactflow"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Phone, MessageSquare, ChevronDown, Edit, Copy, Trash } from "lucide-react"
import { cn } from "@/lib/utils"
import { OpenAI } from "openai"

interface TestPanelProps {
  nodes: Node[]
  edges: Edge[]
  currentState: string | null
  setCurrentState: (state: string | null) => void
  globalPrompt: string
}

interface Message {
  role: "user" | "assistant"
  content: string
}

export function TestPanel({ nodes, edges, currentState, setCurrentState, globalPrompt }: TestPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [testName, setTestName] = useState("New test template")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentStateNode = nodes.find((node) => node.id === currentState)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!input.trim() || !currentState) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const stateNode = nodes.find((node) => node.id === currentState)
      if (!stateNode) throw new Error("Current state not found")

      const statePrompt = stateNode.data.prompt || ""
      const systemPrompt = globalPrompt
        ? `${globalPrompt}\n\nCurrent state: ${stateNode.data.label}\n${statePrompt}`
        : `You are in the "${stateNode.data.label}" state.\n${statePrompt}`

      // Using OpenAI directly instead of AI SDK
      console.log(process.env.NEXT_PUBLIC_OPENAI_API_KEY);
      const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
        dangerouslyAllowBrowser: true,
      })

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: input,
          },
        ],
      })

      const text = response.choices[0]?.message.content || "Sorry, I couldn't generate a response."

      const assistantMessage: Message = { role: "assistant", content: text }
      setMessages((prev) => [...prev, assistantMessage])

      // Determine next state based on edges
      // In a real implementation, you would use the LLM to determine the next state
      // or implement logic to transition based on conditions
      const outgoingEdges = edges.filter((edge) => edge.source === currentState)
      if (outgoingEdges.length > 0) {
        // For demo purposes, just move to the next state
        setCurrentState(outgoingEdges[0].target)
      }
    } catch (error) {
      console.error("Error generating response:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-96 border-l flex flex-col h-full bg-background">
      <div className="border-b p-4">
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" size="sm" className="gap-2">
            <Phone className="h-4 w-4" />
            Test Audio
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Test LLM
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{testName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentStateNode && (
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">
            Current state: {currentStateNode.data.label}
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "max-w-[80%] rounded-lg p-4",
              message.role === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted text-muted-foreground",
            )}
          >
            {message.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} disabled={isLoading}>
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}

