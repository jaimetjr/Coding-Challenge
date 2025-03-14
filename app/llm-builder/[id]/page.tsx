/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Minus, Play, Save } from "lucide-react"
import { StateNode } from "@/components/StateNode"
import { TestPanel } from '@/components/TestPanel'
import Link from "next/link"
import { toast } from 'sonner'
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
//   const { toasts } = useSonner()

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
        },
      }

      setNodes([startingNode])
      setCurrentState("starting-state")
    }
  }, [nodes.length, setNodes])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, label: "Edge", type: "default" }, eds)),
    [setEdges],
  )

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
    setShowGlobalConfig(false)
  }, [])

  const addNewState = useCallback(() => {
    const newId = `state-${nodes.length + 1}`
    const newNode = {
      id: newId,
      type: "stateNode",
      position: {
        x: nodes.length > 0 ? nodes[nodes.length - 1].position.x : 250,
        y: nodes.length > 0 ? nodes[nodes.length - 1].position.y + 150 : 200,
      },
      data: {
        label: `New State ${nodes.length}`,
        prompt: "Respond to the user based on the current context.",
        isStartingState: false,
      },
    }

    setNodes((nds) => [...nds, newNode])
    setSelectedNode(newNode)
  }, [nodes, setNodes])

  const updateNodeData = useCallback(
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

  const saveFlow = () => {
    // In a real app, you would save to a database
    localStorage.setItem(`flow-${params.id}`, JSON.stringify({ nodes, edges, globalPrompt }))
    // toast({
    //   title: "Flow saved",
    //   description: "Your agent flow has been saved successfully.",
    // })
    toast("Flow saved", {
        description: 'Your agent flow has been saved successfully'
    })
  }

  const toggleTestMode = () => {
    if (!isTestMode) {
      // Find starting state
      const startingNode = nodes.find((node) => node.data.isStartingState)
      if (startingNode) {
        setCurrentState(startingNode.id)
      }
    }
    setIsTestMode(!isTestMode)
  }

  return (
    <div className="h-screen w-full flex flex-col">
      <div className="border-b p-4 flex justify-between items-center bg-background">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Agent Builder</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              console.log('oi', showGlobalConfig)
              
              setSelectedNode(null)
              setShowGlobalConfig(true)
            }}
          >
            Global Config
          </Button>
          <Button variant="outline" onClick={toggleTestMode}>
            {isTestMode ? "Edit Mode" : "Test Mode"}
            {!isTestMode && <Play className="ml-2 h-4 w-4" />}
          </Button>
          <Button onClick={saveFlow}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
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
              className="bg-slate-50 dark:bg-slate-900"
            >
              <Background />
              <Controls />
              <MiniMap />
              <Panel position="bottom-center" className="mb-8">
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    className="gap-2 bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
                    onClick={addNewState}
                  >
                    <Plus className="h-4 w-4" />
                    New State
                  </Button>
                  <Button variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              </Panel>
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
          <div className="w-96 border-l bg-background overflow-y-auto">
            {showGlobalConfig ? (
              <GlobalConfigPanel globalPrompt={globalPrompt} setGlobalPrompt={setGlobalPrompt} />
            ) : selectedNode ? (
              <StateConfigPanel node={selectedNode} updateNodeData={updateNodeData} />
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                <p>Select a state to configure or add a new state to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

