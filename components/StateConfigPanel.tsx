/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import type { Node } from "reactflow"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface StateConfigPanelProps {
  node: Node
  updateNodeData: (nodeId: string, data: any) => void
}

export function StateConfigPanel({ node, updateNodeData }: StateConfigPanelProps) {
  const [label, setLabel] = useState(node.data.label)
  const [prompt, setPrompt] = useState(node.data.prompt)
  const [isStartingState, setIsStartingState] = useState(node.data.isStartingState)

  const handleSave = () => {
    updateNodeData(node.id, {
      label,
      prompt,
      isStartingState,
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">State Configuration</h2>
        <Button variant="destructive" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="state-name">State Name</Label>
          <Input id="state-name" value={label} onChange={(e) => setLabel(e.target.value)} onBlur={handleSave} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state-prompt">State Prompt</Label>
          <Textarea
            id="state-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onBlur={handleSave}
            className="min-h-[200px]"
            placeholder="Enter the prompt for this state. This will guide the LLM's responses when in this state."
          />
          <p className="text-sm text-muted-foreground">
            Define how the AI should respond when in this state. You can reference the global prompt and add
            state-specific instructions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="starting-state"
            checked={isStartingState}
            onCheckedChange={(checked) => {
              setIsStartingState(checked)
              updateNodeData(node.id, { isStartingState: checked })
            }}
          />
          <Label htmlFor="starting-state">Set as starting state</Label>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Changes
        </Button>
      </div>
    </div>
  )
}

