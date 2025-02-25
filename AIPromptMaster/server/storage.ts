import { prompts, promptTemplates, type Prompt, type InsertPrompt, type PromptTemplate } from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from 'pg';
const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

export interface IStorage {
  generatePrompt(input: InsertPrompt): Promise<Prompt>;
  getTemplates(): Promise<PromptTemplate[]>;
}

export class PostgresStorage implements IStorage {
  async generatePrompt(input: InsertPrompt): Promise<Prompt> {
    try {
      console.log("Generating prompt with input:", input);

      // Process and enhance user input
      const enhancedInput = this.enhanceUserInput(input);
      const contentType = this.determineContentType(enhancedInput.context);
      const purposeContext = this.inferPurposeContext(enhancedInput.purpose, contentType);

      // Generate the main prompt with improved structure and clarity
      const generatedPrompt = `Create a ${enhancedInput.tone} ${contentType} about ${enhancedInput.title}. 
${purposeContext}

Key Requirements:
1. Use clear, ${enhancedInput.tone} language suitable for all audiences
2. Include relatable examples and practical applications
3. Maintain an engaging and accessible tone throughout
4. Structure the content logically with clear transitions

Additional Guidelines:
- Target Audience: General audience, including beginners
- Length: ${this.getLengthDescription(enhancedInput.length)}
- Writing Style: ${this.getToneDescription(enhancedInput.tone)}
- Key Focus: ${enhancedInput.context}`;

      // Generate alternative prompts with distinct approaches
      const alternativePrompts = [
        // Educational/Tutorial Style
        `Create an educational ${contentType} that makes ${enhancedInput.title} easy to understand:

Approach:
• Begin with simple, familiar concepts
• Use relatable examples from everyday life
• Include step-by-step explanations
• Add helpful visuals or diagrams where possible

Target Length: ${this.getLengthDescription(enhancedInput.length)}
Main Goal: ${purposeContext}`,

        // Q&A Format
        `Develop an interactive guide about ${enhancedInput.title} using a question-and-answer format:

Structure:
1. Start with common questions beginners often ask
2. Provide clear, straightforward answers
3. Include practical examples and scenarios
4. Address potential misconceptions

Style: Conversational and approachable
Focus: ${enhancedInput.purpose}`,

        // Story-Based Approach
        `Write an engaging narrative about ${enhancedInput.title} that connects with readers:

Elements to Include:
- Begin with a relatable situation or problem
- Explain concepts through storytelling
- Share real-world applications
- Conclude with practical takeaways

Format: ${this.getLengthDescription(enhancedInput.length)}
Goal: Make ${enhancedInput.title} accessible and interesting for everyone`
      ];

      // Create the prompt in the database
      const [result] = await db.insert(prompts)
        .values({ 
          ...enhancedInput, 
          generatedPrompt,
          alternativePrompts 
        })
        .returning();

      console.log("Generated prompt:", result);
      return result;
    } catch (error) {
      console.error("Error in generatePrompt:", error);
      throw new Error(`Failed to generate prompt: ${error}`);
    }
  }

  // Helper function to enhance and validate user input
  private enhanceUserInput(input: InsertPrompt): InsertPrompt {
    const enhanced = { ...input };

    // Improve title if needed
    if (!enhanced.title.toLowerCase().startsWith("introduction to") && 
        !enhanced.title.toLowerCase().startsWith("guide to") && 
        !enhanced.title.toLowerCase().startsWith("understanding") &&
        !enhanced.title.toLowerCase().startsWith("the basics of")) {
      enhanced.title = this.improveTitle(enhanced.title);
    }

    // Enhance context if too brief
    if (enhanced.context.split(' ').length < 5) {
      enhanced.context = this.expandContext(enhanced.context, enhanced.title);
    }

    // Improve purpose if vague
    if (enhanced.purpose.split(' ').length < 5) {
      enhanced.purpose = this.enhancePurpose(enhanced.purpose, enhanced.title);
    }

    return enhanced;
  }

  private improveTitle(title: string): string {
    const cleanTitle = title.trim();
    if (cleanTitle.length < 10) {
      return `Introduction to ${cleanTitle}`;
    }
    return cleanTitle;
  }

  private expandContext(context: string, title: string): string {
    return `This ${this.determineContentType(context)} aims to explain ${title} in a clear and comprehensive way, focusing on key concepts and practical applications`;
  }

  private enhancePurpose(purpose: string, title: string): string {
    return `help readers understand ${title} through clear explanations and practical examples`;
  }

  private inferPurposeContext(purpose: string, contentType: string): string {
    if (purpose.toLowerCase().includes("teach") || purpose.toLowerCase().includes("educate")) {
      return `This ${contentType} should effectively educate and inform readers through clear explanations and examples.`;
    } else if (purpose.toLowerCase().includes("explain") || purpose.toLowerCase().includes("introduce")) {
      return `The content should break down complex concepts into easy-to-understand explanations.`;
    } else {
      return `This ${contentType} should effectively ${purpose} while maintaining clarity and engagement.`;
    }
  }

  // Helper function to determine the appropriate content type
  private determineContentType(context: string): string {
    const contentTypes = {
      "poem": "educational poem",
      "story": "narrative",
      "blog": "blog post",
      "article": "article",
      "guide": "comprehensive guide",
      "tutorial": "step-by-step tutorial",
      "explanation": "detailed explanation",
      "overview": "overview",
      "analysis": "analysis",
      "report": "report",
      "summary": "summary",
      "review": "review"
    };

    const contextLower = context.toLowerCase();
    for (const [keyword, type] of Object.entries(contentTypes)) {
      if (contextLower.includes(keyword)) {
        return type;
      }
    }

    return "comprehensive guide";
  }

  // Helper function to get descriptive length
  private getLengthDescription(length: string): string {
    const lengths = {
      "short": "1-2 concise paragraphs with clear points",
      "medium": "3-4 detailed paragraphs with examples",
      "long": "comprehensive coverage with multiple sections and detailed explanations"
    };
    return lengths[length as keyof typeof lengths] || lengths.medium;
  }

  // Helper function to get tone description
  private getToneDescription(tone: string): string {
    const tones = {
      "professional": "formal yet accessible",
      "casual": "friendly and conversational",
      "educational": "clear and instructive",
      "formal": "structured and detailed"
    };
    return tones[tone as keyof typeof tones] || tones.professional;
  }

  async getTemplates(): Promise<PromptTemplate[]> {
    try {
      console.log("Fetching templates");
      const templates = await db.select().from(promptTemplates);

      // If no templates exist, create default ones
      if (templates.length === 0) {
        const defaultTemplates = [
          {
            name: "Blog Post",
            description: "Generate a blog post about a specific topic",
            template: "Write a {tone} {length} blog post about {context}. The goal is to {purpose}.",
            fields: ["context", "tone", "length", "purpose"]
          },
          {
            name: "Social Media",
            description: "Create engaging social media content",
            template: "Create a {tone} {length} social media post about {context} that will {purpose}.",
            fields: ["context", "tone", "length", "purpose"]
          }
        ];

        console.log("Creating default templates");
        const insertedTemplates = await db.insert(promptTemplates)
          .values(defaultTemplates)
          .returning();

        return insertedTemplates;
      }

      return templates;
    } catch (error) {
      console.error("Error in getTemplates:", error);
      throw new Error(`Failed to fetch templates: ${error}`);
    }
  }
}

export const storage = new PostgresStorage();