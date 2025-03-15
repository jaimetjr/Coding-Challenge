"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Connection,
  ReactFlowProvider,
  Panel,
} from "reactflow"
import "reactflow/dist/style.css"
import { ArrowLeft, Plus, Play, Save, Flag, CircleX } from "lucide-react"
import { StateNode } from "@/components/StateNode"
import { TestPanel } from "@/components/TestPanel"
import Link from "next/link"
import { toast } from "sonner"
import { StateConfigPanel } from "@/components/StateConfigPanel"
import { GlobalConfigPanel } from "@/components/GlobalConfigPanel"

const nodeTypes = {
  stateNode: StateNode,
}

export default function BuilderPage({ params }: { params: { id: string } }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [isTestMode, setIsTestMode] = useState(false)
  const [currentState, setCurrentState] = useState<string | null>(null)
  const [showGlobalConfig, setShowGlobalConfig] = useState(false)
  const [globalPrompt, setGlobalPrompt] = useState("")
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  // Force light mode
  useEffect(() => {
    document.documentElement.classList.remove("dark")
    document.documentElement.classList.add("light")
    localStorage.setItem("theme", "light")
  }, [])

  // Initialize with a starting state if no nodes exist
  useEffect(() => {
    if (nodes.length === 0) {
      const startingNode = {
        id: "starting-state",
        type: "stateNode",
        position: { x: 250, y: 50 },
        data: {
          label: "Starting State",
          prompt: "You are a helpful assistant. Respond to the user's query.",
          isStartingState: true,
          isEndState: false,
        },
      }

      setNodes([startingNode])
      setCurrentState("starting-state")
    }
  }, [nodes.length, setNodes])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, label: "Transition", type: "default" }, eds)),
    [setEdges],
  )

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (isTestMode) return // Don't select nodes in test mode
      setSelectedNode(node)
      setShowGlobalConfig(false)
    },
    [isTestMode],
  )

  const addNewState = useCallback(() => {
    const newId = `state-${Date.now()}`
    const newNode = {
      id: newId,
      type: "stateNode",
      position: {
        x: nodes.length > 0 ? nodes[nodes.length - 1].position.x + 100 : 250,
        y: nodes.length > 0 ? nodes[nodes.length - 1].position.y + 100 : 200,
      },
      data: {
        label: `New State ${nodes.length}`,
        prompt: "Respond to the user based on the current context.",
        isStartingState: false,
        isEndState: false,
      },
    }

    setNodes((nds) => [...nds, newNode])
    setSelectedNode(newNode)
    setShowGlobalConfig(false)
  }, [nodes, setNodes])

  const addEndState = useCallback(() => {
    const newId = `end-state-${Date.now()}`
    const newNode = {
      id: newId,
      type: "stateNode",
      position: {
        x: nodes.length > 0 ? nodes[nodes.length - 1].position.x + 100 : 250,
        y: nodes.length > 0 ? nodes[nodes.length - 1].position.y + 100 : 200,
      },
      data: {
        label: `End State`,
        prompt: "This is an end state. The conversation will terminate here.",
        isStartingState: false,
        isEndState: true,
      },
    }

    setNodes((nds) => [...nds, newNode])
    setSelectedNode(newNode)
    setShowGlobalConfig(false)
  }, [nodes, setNodes])

  const updateNodeData = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (nodeId: string, data: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: { ...node.data, ...data } }
          }
          return node
        }),
      )

      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode((prev) => (prev ? { ...prev, data: { ...prev.data, ...data } } : null))
      }
    },
    [setNodes, selectedNode],
  )

  const deleteNode = useCallback(
    (nodeId: string) => {
      // Remove all edges connected to this node
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))

      // Remove the node
      setNodes((nds) => nds.filter((node) => node.id !== nodeId))

      // If the deleted node was selected, clear the selection
      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode(null)
      }

      // If the deleted node was the current state in test mode, reset current state
      if (currentState === nodeId) {
        // Find a new state to set as current (preferably the starting state)
        const startingNode = nodes.find((node) => node.data.isStartingState && node.id !== nodeId)
        if (startingNode) {
          setCurrentState(startingNode.id)
        } else if (nodes.length > 1) {
          // If no starting state, set the first node that's not being deleted
          const firstNode = nodes.find((node) => node.id !== nodeId)
          if (firstNode) {
            setCurrentState(firstNode.id)
          } else {
            setCurrentState(null)
          }
        } else {
          setCurrentState(null)
        }
      }
    },
    [setNodes, setEdges, selectedNode, currentState, nodes],
  )

  const saveFlow = () => {
    // Validate that there is a starting state
    const hasStartingState = nodes.some((node) => node.data.isStartingState)
    if (!hasStartingState) {
      toast("Error", {
        description: "Your flow must have a starting state.",
        duration: 200
      })
      return
    }

    // In a real app, you would save to a database
    localStorage.setItem(`flow-${params.id}`, JSON.stringify({ nodes, edges, globalPrompt }))
    toast("Flow saved", {
      description: "Your agent flow has been saved successfully.",
    })
  }

  const toggleTestMode = () => {
    // Validate that there is a starting state before entering test mode
    const startingNode = nodes.find((node) => node.data.isStartingState)
    if (!startingNode && !isTestMode) {
      toast("Error", {
        description: "You need to set a starting state before testing.",
        duration: 200
      })
      return
    }

    if (!isTestMode) {
      // Find starting state
      if (startingNode) {
        setCurrentState(startingNode.id)
      }
    }
    setIsTestMode(!isTestMode)
    setSelectedNode(null)
    setShowGlobalConfig(false)
  }

  const handleGlobalConfigClick = () => {
    setSelectedNode(null)
    setShowGlobalConfig(true)
  }

  return (
    <div className="h-screen w-full flex flex-col bg-white text-gray-900">
      <div className="border-b p-4 flex justify-between items-center bg-white">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-2 text-gray-700 hover:bg-gray-100 rounded-md">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Agent Builder</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Action Buttons */}
          <button
            className={`px-4 py-2 rounded-md border border-gray-300 text-gray-700 ${
              showGlobalConfig ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-gray-100"
            }`}
            onClick={handleGlobalConfigClick}
          >
            Global Config
          </button>
          <button
            className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={toggleTestMode}
          >
            {isTestMode ? "Edit Mode" : "Test Mode"}
            {!isTestMode && <Play className="ml-2 h-4 w-4 inline" />}
          </button>
          <button
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center"
            onClick={saveFlow}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1 h-full" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              className="bg-slate-50"
            >
              <Background color="#aaaaaa" />
              <Controls />
              <MiniMap />
              {!isTestMode && (
                <Panel position="bottom-center" className="mb-8">
                  <div className="flex gap-2">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 hover:bg-blue-700"
                      onClick={addNewState}
                    >
                      <Plus className="h-4 w-4" />
                      New State
                    </button>
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center gap-2 hover:bg-green-700"
                      onClick={() => {
                        // Find if there's already a starting state
                        const hasStartingState = nodes.some((node) => node.data.isStartingState)
                        if (hasStartingState) {
                          toast("Error", {
                            description: "You already have a starting state.",
                            duration: 200
                          })
                          return
                        }

                        const newId = `start-state-${Date.now()}`
                        const newNode = {
                          id: newId,
                          type: "stateNode",
                          position: {
                            x: 250,
                            y: 50,
                          },
                          data: {
                            label: "Start State",
                            prompt: "This is the starting point of the conversation.",
                            isStartingState: true,
                            isEndState: false,
                          },
                        }

                        setNodes((nds) => [...nds, newNode])
                      }}
                    >
                      <Flag className="h-4 w-4" />
                      Start State
                    </button>
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded-md flex items-center gap-2 hover:bg-red-700"
                      onClick={addEndState}
                    >
                      <CircleX className="h-4 w-4" />
                      End State
                    </button>
                  </div>
                </Panel>
              )}
            </ReactFlow>
          </ReactFlowProvider>
        </div>

        {isTestMode ? (
          <TestPanel
            nodes={nodes}
            edges={edges}
            currentState={currentState}
            setCurrentState={setCurrentState}
            globalPrompt={globalPrompt}
          />
        ) : (
          <div className="w-96 border-l bg-white overflow-y-auto">
            {showGlobalConfig ? (
              <GlobalConfigPanel globalPrompt={globalPrompt} setGlobalPrompt={setGlobalPrompt} />
            ) : selectedNode ? (
              <StateConfigPanel node={selectedNode} updateNodeData={updateNodeData} nodes={nodes} deleteNode={deleteNode} />
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p>Select a state to configure or add a new state to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

