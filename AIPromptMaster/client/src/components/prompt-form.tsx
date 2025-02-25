import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPromptSchema, type InsertPrompt, type Prompt } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface PromptFormProps {
  onGenerate: (prompt: Prompt) => void;
}

const titleSuggestions = [
  "Introduction to...",
  "Understanding...",
  "The Basics of...",
  "A Guide to...",
];

const contextSuggestions = [
  "This guide explains...",
  "We'll explore how...",
  "Learn about...",
  "Discover why...",
];

const purposeSuggestions = [
  "educate beginners about...",
  "help people understand...",
  "explain the importance of...",
  "demonstrate how to...",
];

export function PromptForm({ onGenerate }: PromptFormProps) {
  const { toast } = useToast();
  const [previewPrompt, setPreviewPrompt] = useState<string>("");
  const [currentSuggestion, setCurrentSuggestion] = useState({
    title: 0,
    context: 0,
    purpose: 0
  });

  const form = useForm<InsertPrompt>({
    resolver: zodResolver(insertPromptSchema),
    defaultValues: {
      title: "",
      context: "",
      purpose: "",
      tone: "professional",
      length: "medium",
      generatedPrompt: "",
      alternativePrompts: []
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: InsertPrompt) => {
      console.log("Submitting form data:", data);
      const res = await apiRequest("POST", "/api/prompts/generate", data);
      const result = await res.json();
      console.log("API response:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Mutation succeeded:", data);
      onGenerate(data);
      toast({
        title: "Success!",
        description: "Your prompt has been generated successfully."
      });
    },
    onError: (error) => {
      console.error("Mutation failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate prompt"
      });
    }
  });

  const onSubmit = async (data: InsertPrompt) => {
    console.log("Form submitted with data:", data);
    generateMutation.mutate(data);
  };

  // Update preview as form values change
  const updatePreview = (data: Partial<InsertPrompt>) => {
    if (data.title || data.context || data.purpose) {
      const preview = `Create a ${form.getValues("tone")} guide about ${data.title || "[title]"}.

Main focus: ${data.context || "[context]"}

Goal: ${data.purpose || "[purpose]"}

Length: ${form.getValues("length")}`;
      setPreviewPrompt(preview);
    }
  };

  // Cycle through suggestions
  const getNextSuggestion = (field: 'title' | 'context' | 'purpose') => {
    const suggestions = field === 'title' ? titleSuggestions : 
                       field === 'context' ? contextSuggestions : 
                       purposeSuggestions;

    setCurrentSuggestion(prev => ({
      ...prev,
      [field]: (prev[field] + 1) % suggestions.length
    }));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Title</FormLabel>
              <FormDescription className="text-sm">
                Choose a clear, descriptive title for your content
              </FormDescription>
              <div className="flex gap-2">
                <FormControl>
                  <Input 
                    className="input-shadow focus-visible:ring-blue-400"
                    placeholder={titleSuggestions[currentSuggestion.title]} 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(e);
                      updatePreview({ title: e.target.value });
                    }}
                  />
                </FormControl>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => getNextSuggestion('title')}
                  className="button-hover"
                >
                  Suggest
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="context"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Context</FormLabel>
              <FormDescription className="text-sm">
                Describe what you want to explain or teach
              </FormDescription>
              <div className="flex gap-2">
                <FormControl>
                  <Textarea 
                    className="input-shadow focus-visible:ring-blue-400 min-h-[100px]"
                    placeholder={contextSuggestions[currentSuggestion.context]}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      updatePreview({ context: e.target.value });
                    }}
                  />
                </FormControl>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => getNextSuggestion('context')}
                  className="h-10 button-hover"
                >
                  Suggest
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Purpose</FormLabel>
              <FormDescription className="text-sm">
                What do you want to achieve with this content?
              </FormDescription>
              <div className="flex gap-2">
                <FormControl>
                  <Input 
                    className="input-shadow focus-visible:ring-blue-400"
                    placeholder={purposeSuggestions[currentSuggestion.purpose]}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      updatePreview({ purpose: e.target.value });
                    }}
                  />
                </FormControl>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => getNextSuggestion('purpose')}
                  className="button-hover"
                >
                  Suggest
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Tone</FormLabel>
              <FormDescription className="text-sm">
                Choose how you want your content to sound
              </FormDescription>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  updatePreview({});
                }} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tone" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual & Friendly</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="formal">Formal & Academic</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="length"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Length</FormLabel>
              <FormDescription className="text-sm">
                How detailed should your content be?
              </FormDescription>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  updatePreview({});
                }} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                  <SelectItem value="medium">Medium (1 paragraph)</SelectItem>
                  <SelectItem value="long">Long (detailed response)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {previewPrompt && (
          <Card className="bg-blue-50/50 border border-blue-100 animate-fade-in">
            <CardContent className="pt-4">
              <h3 className="text-sm font-medium mb-2 text-blue-700">Preview</h3>
              <p className="text-sm text-blue-900/80 whitespace-pre-wrap font-playfair">
                {previewPrompt}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <Button 
            type="submit" 
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 button-hover"
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? "Generating..." : "Generate Prompt"}
          </Button>

          {form.formState.isDirty && (
            <Button 
              type="button" 
              variant="outline"
              onClick={() => form.reset()}
              className="w-24 button-hover"
            >
              Reset
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}