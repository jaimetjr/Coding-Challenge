import type { Edge } from "reactflow"

export interface AgentState {
  id: string
  label: string
  prompt: string
  isStartingState: boolean
}

export interface AgentFlow {
  id: string
  name: string
  globalPrompt: string
  states: AgentState[]
  edges: Edge[]
  createdAt: string
  updatedAt: string
}

export interface AgentTemplate {
  id: string
  name: string
  description: string
  flow: AgentFlow
}

