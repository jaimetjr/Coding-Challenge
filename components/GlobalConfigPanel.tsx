"use client";

import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
interface GlobalConfigPanelProps {
  globalPrompt: string;
  setGlobalPrompt: (prompt: string) => void;
}

export function GlobalConfigPanel({
  globalPrompt,
  setGlobalPrompt,
}: GlobalConfigPanelProps) {
  const [localPrompt, setLocalPrompt] = useState(globalPrompt);

  useEffect(() => {
    setLocalPrompt(globalPrompt);
  }, [globalPrompt])

  const handleSave = () => {
    setGlobalPrompt(localPrompt);
    toast("Global configuration saved");
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold">Global Configuration</h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="global-prompt">Global System Prompt</Label>
          <Textarea
            id="global-prompt"
            value={localPrompt}
            onChange={(e) => setLocalPrompt(e.target.value)}
            className="min-h-[300px]"
            placeholder="Enter the global system prompt for your agent. This will be used as the base context for all states."
          />
          <p className="text-sm text-muted-foreground">
            The global prompt defines the overall behavior and personality of your agent. Each state can then add
            specific instructions on top of this global context.
          </p>
        </div>

        <Button className="w-full" onClick={handleSave} type="button">
          Save Global Configuration
        </Button>
      </div>
    </div>
  );
}
