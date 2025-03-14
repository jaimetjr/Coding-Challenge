import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Plus,
  Network,
  MessageSquare,
  Play,
  CircleDot,
} from "lucide-react";

export const metadata: Metadata = {
  title: "LLM State Builder",
  description: "Build conversational AI agents with state-based flows",
};

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-3xl space-y-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          State-Based LLM Builder
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Create powerful conversational AI agents by defining states,
          transitions, and prompts in a visual editor.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/llm-builder/new">
              <Plus className="h-5 w-5" />
              Create New Agent
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="gap-2">
            <Link href="/templates">
              Browse Templates
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <FeatureCard
          title="Visual Flow Editor"
          description="Drag and drop states to create complex conversation flows with ease."
          icon="Flow"
        />
        <FeatureCard
          title="State-Specific Prompts"
          description="Configure unique prompts for each state to guide the AI's responses."
          icon="MessageSquare"
        />
        <FeatureCard
          title="Real-Time Testing"
          description="Test your agent and see state transitions as you interact with it."
          icon="Play"
        />
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  // Simple mapping of icon names to components
  const iconMap = {
    Flow: Network,
    MessageSquare: MessageSquare,
    Play: Play,
  };

  // Get the icon component or use a fallback
  const IconComponent = iconMap[icon as keyof typeof iconMap] || CircleDot;

  return (
    <div className="flex flex-col items-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="p-3 bg-primary/10 rounded-full mb-4">
        <IconComponent className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground text-center">{description}</p>
    </div>
  );
}
