import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { cn } from "@/lib/utils"
import { CheckSquare } from "lucide-react"

export const StateNode = memo(({ data, isConnectable, selected }: NodeProps) => {
  return (
    <div
      className={cn(
        "px-4 py-2 rounded-md border shadow-sm bg-white dark:bg-slate-800 w-48",
        selected ? "ring-2 ring-primary" : "ring-0",
        data.isStartingState ? "border-green-500 dark:border-green-500" : "border-slate-200 dark:border-slate-700",
      )}
    >
      <div className="flex items-center gap-2">
        <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-md">
          <CheckSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
        <div className="font-medium truncate">{data.label}</div>
      </div>

      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-slate-400 dark:bg-slate-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-slate-400 dark:bg-slate-500"
      />
    </div>
  )
})

StateNode.displayName = "StateNode"

