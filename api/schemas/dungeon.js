import { z } from "zod";

const dungeonFields = {
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  difficulty: z.enum(["easy", "medium", "hard", "boss"]),
  imageUrl: z.string().url().nullable().optional(),
};

export const createDungeonSchema = z.object(dungeonFields);
export const updateDungeonSchema = z.object(
  Object.fromEntries(
    Object.entries(dungeonFields).map(([k, v]) => [k, v.optional()])
  )
);
