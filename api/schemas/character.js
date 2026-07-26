import { z } from "zod";

const characterFields = {
  name: z.string().min(1).max(100),
  class: z.enum(["warrior", "mage", "rogue", "ranger"]),
  health: z.number().int().positive(),
  attack: z.number().int().positive(),
  defense: z.number().int().positive(),
  level: z.number().int().positive().optional(),
};

export const createCharacterSchema = z.object(characterFields);
export const updateCharacterSchema = z.object(
  Object.fromEntries(
    Object.entries(characterFields).map(([k, v]) => [k, v.optional()])
  )
);
