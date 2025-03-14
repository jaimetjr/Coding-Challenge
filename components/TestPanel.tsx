"use client"

import { useState, useRef, useEffect } from "react"
import type { Node, Edge } from "reactflow"
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
  stateId?: string
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

    const userMessage: Message = {
      role: "user",
      content: input,
      stateId: currentState,
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const stateNode = nodes.find((node) => node.id === currentState)
      if (!stateNode) throw new Error("Current state not found")

      // Check if current state is an end state
      if (stateNode.data.isEndState) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "This is an end state. The conversation has ended.",
            stateId: currentState,
          },
        ])
        setIsLoading(false)
        return
      }

      const statePrompt = stateNode.data.prompt || ""
      const systemPrompt = globalPrompt
        ? `${globalPrompt}\n\nCurrent state: ${stateNode.data.label}\n${statePrompt}`
        : `You are in the "${stateNode.data.label}" state.\n${statePrompt}`

      // Using OpenAI directly instead of AI SDK
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

      const assistantMessage: Message = {
        role: "assistant",
        content: text,
        stateId: currentState,
      }
      setMessages((prev) => [...prev, assistantMessage])

      // Determine next state based on edges
      // In a real implementation, you would use the LLM to determine the next state
      // or implement logic to transition based on conditions
      const outgoingEdges = edges.filter((edge) => edge.source === currentState)
      if (outgoingEdges.length > 0) {
        // For demo purposes, just move to the next state
        const nextState = outgoingEdges[0].target
        setCurrentState(nextState)

        // Add a state transition message
        const nextStateNode = nodes.find((node) => node.id === nextState)
        if (nextStateNode) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `[Transitioning to state: ${nextStateNode.data.label}]`,
              stateId: nextState,
            },
          ])
        }
      }
    } catch (error) {
      console.error("Error generating response:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error: Could not generate a response. Please check your API key and try again.",
          stateId: currentState,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-96 border-l flex flex-col h-full bg-white">
      <div className="border-b p-4">
        <div className="flex justify-between items-center mb-4">
          <button className="px-3 py-1 bg-white border border-gray-300 rounded-md flex items-center gap-1 hover:bg-gray-100 text-gray-700">
            <Phone className="h-4 w-4" />
            Test Audio
          </button>
          <button className="px-3 py-1 bg-white border border-gray-300 rounded-md flex items-center gap-1 hover:bg-gray-100 text-gray-700">
            <MessageSquare className="h-4 w-4" />
            Test LLM
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChevronDown className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-900">{testName}</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded-md hover:bg-gray-100 text-gray-700">
              <Edit className="h-4 w-4" />
            </button>
            <button className="p-1 rounded-md hover:bg-gray-100 text-gray-700">
              <Copy className="h-4 w-4" />
            </button>
            <button className="p-1 rounded-md hover:bg-gray-100 text-gray-700">
              <Trash className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentStateNode && (
          <div
            className={`text-sm font-medium ${
              currentStateNode.data.isEndState
                ? "text-red-600"
                : currentStateNode.data.isStartingState
                  ? "text-green-600"
                  : "text-blue-600"
            }`}
          >
            Current state: {currentStateNode.data.label}
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "max-w-[80%] rounded-lg p-4",
              message.role === "user"
                ? "bg-blue-600 text-white ml-auto"
                : message.content.startsWith("[Transitioning")
                  ? "bg-gray-200 text-gray-800 italic text-sm"
                  : "bg-gray-100 text-gray-900",
            )}
          >
            {message.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200">
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
            disabled={isLoading || (currentStateNode && currentStateNode.data.isEndState)}
            className="border-gray-300 bg-white text-gray-900"
          />
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSendMessage}
            disabled={isLoading || (currentStateNode && currentStateNode.data.isEndState)}
          >
            Send
          </button>
        </div>
        {currentStateNode && currentStateNode.data.isEndState && (
          <p className="mt-2 text-sm text-red-600">This is an end state. The conversation has ended.</p>
        )}
      </div>
    </div>
  )
}

