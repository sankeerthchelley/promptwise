import type { PromptFormData } from "@shared/schema";

export function getPromptTemplate(data: PromptFormData): string {
  const keywordsText = data.keywords.length ? `\nKey focus areas: ${data.keywords.join(", ")}` : "";
  
  return `Task: ${data.purpose}

Context: ${data.context}

Please write in a ${data.tone} tone, suitable for ${data.audience}.
Aim for ${data.length} length output.${keywordsText}

Include specific examples and clear explanations to make the content engaging and informative.`;
}
