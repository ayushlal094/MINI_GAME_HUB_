import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.scores.list.path, async (req, res) => {
    const game = req.params.game;
    const scores = await storage.getHighScores(game);
    res.json(scores);
  });

  app.post(api.scores.create.path, async (req, res) => {
    try {
      const input = api.scores.create.input.parse(req.body);
      const score = await storage.createHighScore(input);
      res.status(201).json(score);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Seed data
  if ((await storage.getHighScores("snake")).length === 0) {
    await storage.createHighScore({ game: "snake", score: 150, playerName: "SnakeMaster" });
    await storage.createHighScore({ game: "snake", score: 100, playerName: "Python" });
    await storage.createHighScore({ game: "snake", score: 50, playerName: "Worm" });
  }

  return httpServer;
}
