import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import type { PromptTemplate } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Templates() {
  const { data: templates, isLoading } = useQuery<PromptTemplate[]>({
    queryKey: ["/api/templates"]
  });

  if (isLoading) {
    return <div>Loading templates...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Generator
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-6">Prompt Templates</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {templates?.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{template.template}</p>
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Required Fields:</h4>
                <div className="flex gap-2 flex-wrap">
                  {template.fields.map((field) => (
                    <span key={field} className="bg-secondary px-2 py-1 rounded-md text-xs">
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
