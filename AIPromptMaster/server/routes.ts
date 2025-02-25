import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertPromptSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  app.post("/api/prompts/generate", async (req, res) => {
    try {
      console.log("Received generate prompt request:", req.body);
      const data = insertPromptSchema.parse(req.body);
      console.log("Validated data:", data);
      const prompt = await storage.generatePrompt(data);
      console.log("Generated prompt:", prompt);
      res.json(prompt);
    } catch (error) {
      console.error("Error generating prompt:", error);
      res.status(400).json({ error: String(error) });
    }
  });

  app.get("/api/templates", async (_req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ error: String(error) });
    }
  });

  return createServer(app);
}