"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { cn } from "@/lib/utils"
import { CheckSquare, Flag, CircleX } from "lucide-react"

export const StateNode = memo(({ data, isConnectable, selected }: NodeProps) => {
  // Determine the icon and style based on state type
  let Icon = CheckSquare
  let iconColor = "text-green-600"
  let iconBgColor = "bg-green-100"
  const borderColor = data.isStartingState ? "border-green-500" : data.isEndState ? "border-red-500" : "border-gray-200"

  if (data.isStartingState) {
    Icon = Flag
    iconColor = "text-green-600"
    iconBgColor = "bg-green-100"
  } else if (data.isEndState) {
    Icon = CircleX
    iconColor = "text-red-600"
    iconBgColor = "bg-red-100"
  }

  return (
    <div
      className={cn(
        "px-4 py-2 rounded-md border shadow-sm bg-white w-48",
        selected ? "ring-2 ring-blue-500" : "ring-0",
        borderColor,
      )}
    >
      <div className="flex items-center gap-2">
        <div className={`p-1 ${iconBgColor} rounded-md`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <div className="font-medium truncate">{data.label}</div>
      </div>

      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-3 h-3 bg-gray-400" />
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-3 h-3 bg-gray-400" />
    </div>
  )
})

StateNode.displayName = "StateNode"

