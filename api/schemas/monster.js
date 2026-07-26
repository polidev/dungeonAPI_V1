import { z } from "zod";

const monsterFields = {
  name: z.string().min(1).max(100),
  type: z.enum(["undead", "beast", "demon", "elemental", "dragon"]),
  health: z.number().int().positive(),
  attack: z.number().int().positive(),
  defense: z.number().int().positive(),
  dungeonId: z.string().min(1),
};

export const createMonsterSchema = z.object(monsterFields);
export const updateMonsterSchema = z.object(
  Object.fromEntries(
    Object.entries(monsterFields).map(([k, v]) => [k, v.optional()])
  )
);
