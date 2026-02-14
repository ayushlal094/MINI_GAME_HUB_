import { highScores, type HighScore, type InsertHighScore } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getHighScores(game: string): Promise<HighScore[]>;
  createHighScore(score: InsertHighScore): Promise<HighScore>;
}

export class DatabaseStorage implements IStorage {
  async getHighScores(game: string): Promise<HighScore[]> {
    return await db.select()
      .from(highScores)
      .where(eq(highScores.game, game))
      .orderBy(desc(highScores.score))
      .limit(10);
  }

  async createHighScore(insertScore: InsertHighScore): Promise<HighScore> {
    const [score] = await db.insert(highScores)
      .values(insertScore)
      .returning();
    return score;
  }
}

export const storage = new DatabaseStorage();
