"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function NewBuilderPage() {
  const router = useRouter()

  useEffect(() => {
    // Generate a unique ID for the new flow
    const newId = `flow-${Date.now()}`
    router.push(`/llm-builder/${newId}`)
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-pulse">Creating new agent...</div>
    </div>
  )
}

