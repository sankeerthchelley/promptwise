import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Prompt } from "@shared/schema";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface PromptOutputProps {
  prompt: Prompt | null;
}

export function PromptOutput({ prompt }: PromptOutputProps) {
  const { toast } = useToast();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!prompt) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold text-blue-900/70">
          Fill out the form to generate your prompt
        </h2>
        <p className="text-sm text-blue-700/60 mt-2">
          Your generated prompt will appear here with alternative versions
        </p>
      </div>
    );
  }

  const copyToClipboard = async (text: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index ?? -1);
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard",
      });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy prompt",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* User Input Summary */}
      <Card className="bg-blue-50/50 border-2 border-blue-100">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-900">Your Request Summary</h3>
          <div className="grid gap-2">
            <div className="grid grid-cols-[120px,1fr] gap-2">
              <span className="font-medium text-blue-700">Topic:</span>
              <span className="text-blue-900">{prompt.title}</span>
            </div>
            <div className="grid grid-cols-[120px,1fr] gap-2">
              <span className="font-medium text-blue-700">Context:</span>
              <span className="text-blue-900">{prompt.context}</span>
            </div>
            <div className="grid grid-cols-[120px,1fr] gap-2">
              <span className="font-medium text-blue-700">Purpose:</span>
              <span className="text-blue-900">{prompt.purpose}</span>
            </div>
            <div className="grid grid-cols-[120px,1fr] gap-2">
              <span className="font-medium text-blue-700">Tone:</span>
              <span className="capitalize text-blue-900">{prompt.tone}</span>
            </div>
            <div className="grid grid-cols-[120px,1fr] gap-2">
              <span className="font-medium text-blue-700">Length:</span>
              <span className="capitalize text-blue-900">{prompt.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Prompt */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-blue-900">Generated Prompt</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(prompt.generatedPrompt, -1)}
            className="gap-2 button-hover border-blue-200 hover:border-blue-300"
          >
            {copiedIndex === -1 ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 text-blue-500" />
            )}
            {copiedIndex === -1 ? "Copied" : "Copy"}
          </Button>
        </div>

        <Card className="border-2 border-blue-100">
          <CardContent className="pt-6">
            <p className="whitespace-pre-wrap text-sm leading-relaxed font-playfair text-blue-900">
              {prompt.generatedPrompt}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alternative Versions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-blue-900">Alternative Versions</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-blue-600"
          >
            {isCollapsed ? "Show" : "Hide"} Alternatives
          </Button>
        </div>

        {!isCollapsed && (
          <div className="grid gap-4 animate-fade-in">
            {prompt.alternativePrompts.map((altPrompt, index) => (
              <Card key={index} className="border hover:border-blue-200 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium flex items-center justify-between text-blue-900">
                    <span>Version {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(altPrompt, index)}
                      className="h-8 px-2 button-hover"
                    >
                      {copiedIndex === index ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-blue-500" />
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed font-playfair text-blue-900">
                    {altPrompt}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}