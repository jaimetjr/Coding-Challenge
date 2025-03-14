"use client";

import { useState, useEffect } from "react";
import type { Node } from "reactflow";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface StateConfigPanelProps {
  node: Node;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateNodeData: (nodeId: string, data: any) => void;
  nodes: Node[];
}

export function StateConfigPanel({
  node,
  updateNodeData,
  nodes,
}: StateConfigPanelProps) {
  const [label, setLabel] = useState(node.data.label);
  const [prompt, setPrompt] = useState(node.data.prompt);
  const [isStartingState, setIsStartingState] = useState(
    node.data.isStartingState
  );
  const [isEndState, setIsEndState] = useState(node.data.isEndState || false);
  const [labelError, setLabelError] = useState("");

  // Update local state when node changes
  useEffect(() => {
    setLabel(node.data.label);
    setPrompt(node.data.prompt);
    setIsStartingState(node.data.isStartingState);
    setIsEndState(node.data.isEndState || false);
  }, [node]);

  const validateLabel = (newLabel: string) => {
    // Check if label is empty
    if (!newLabel.trim()) {
      setLabelError("State name cannot be empty");
      return false;
    }

    // Check if label is unique (excluding the current node)
    const isDuplicate = nodes.some(
      (n) =>
        n.id !== node.id &&
        n.data.label.toLowerCase() === newLabel.toLowerCase()
    );

    if (isDuplicate) {
      setLabelError("State name must be unique");
      return false;
    }

    setLabelError("");
    return true;
  };

  const handleSave = () => {
    if (!validateLabel(label)) {
      return;
    }

    // If this is being set as a starting state, unset any other starting states
    if (isStartingState && !node.data.isStartingState) {
      nodes.forEach((n) => {
        if (n.id !== node.id && n.data.isStartingState) {
          updateNodeData(n.id, {
            ...n.data,
            isStartingState: false,
          });
        }
      });
    }

    // If this is being set as an end state, update the node data
    updateNodeData(node.id, {
      label,
      prompt,
      isStartingState,
      isEndState,
    });

    toast("State updated", {
      description: "Your state configuration has been saved.",
    });
  };

  return (
    <div className="p-6 space-y-6 text-gray-900">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">State Configuration</h2>
        <button className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="state-name">State Name</Label>
          <Input
            id="state-name"
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              validateLabel(e.target.value);
            }}
            className={`border-gray-300 bg-white text-gray-900 ${
              labelError ? "border-red-500" : ""
            }`}
          />
          {labelError && <p className="text-sm text-red-500">{labelError}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state-prompt">State Prompt</Label>
          <Textarea
            id="state-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[200px] border-gray-300 bg-white text-gray-900"
            placeholder="Enter the prompt for this state. This will guide the LLM's responses when in this state."
          />
          <p className="text-sm text-gray-500">
            Define how the AI should respond when in this state. You can
            reference the global prompt and add state-specific instructions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="starting-state"
            checked={isStartingState}
            onCheckedChange={(checked) => {
              setIsStartingState(checked);
              if (checked) {
                setIsEndState(false);
              }
            }}
          />
          <Label htmlFor="starting-state">Set as starting state</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="end-state"
            checked={isEndState}
            onCheckedChange={(checked) => {
              setIsEndState(checked);
              if (checked) {
                setIsStartingState(false);
              }
            }}
          />
          <Label htmlFor="end-state">Set as end state</Label>
        </div>

        <button
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={handleSave}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
