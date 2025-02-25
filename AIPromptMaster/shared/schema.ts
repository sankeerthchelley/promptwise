import { pgTable, text, serial, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  context: text("context").notNull(),
  purpose: text("purpose").notNull(),
  tone: text("tone").notNull(),
  length: text("length").notNull(),
  generatedPrompt: text("generated_prompt").notNull(),
  alternativePrompts: json("alternative_prompts").notNull().$type<string[]>(),
});

export const promptTemplates = pgTable("prompt_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  template: text("template").notNull(),
  fields: json("fields").notNull().$type<string[]>(),
});

export const insertPromptSchema = createInsertSchema(prompts).omit({ id: true });
export const insertTemplateSchema = createInsertSchema(promptTemplates).omit({ id: true });

export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type Prompt = typeof prompts.$inferSelect;
export type PromptTemplate = typeof promptTemplates.$inferSelect;