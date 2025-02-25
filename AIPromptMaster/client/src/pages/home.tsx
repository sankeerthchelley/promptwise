import { Card, CardContent } from "@/components/ui/card";
import { PromptForm } from "@/components/prompt-form";
import { PromptOutput } from "@/components/prompt-output";
import { useState } from "react";
import type { Prompt } from "@shared/schema";

export default function Home() {
  const [generatedPrompt, setGeneratedPrompt] = useState<Prompt | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            AI Prompt Generator
          </h1>
          <p className="mt-2 text-muted-foreground">
            Create optimized prompts for any AI tool
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="lg:sticky lg:top-8">
            <Card className="card-shadow border-2">
              <CardContent className="pt-6">
                <PromptForm onGenerate={setGeneratedPrompt} />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="card-shadow border-2">
              <CardContent className="pt-6">
                <PromptOutput prompt={generatedPrompt} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}