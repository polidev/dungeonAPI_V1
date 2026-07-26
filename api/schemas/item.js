import { z } from "zod";

const itemFields = {
  name: z.string().min(1).max(100),
  type: z.enum(["weapon", "armor", "potion", "ring"]),
  power: z.number().int().positive(),
  description: z.string().min(1).max(500),
  imageUrl: z.string().url().nullable().optional(),
};

export const createItemSchema = z.object(itemFields);
export const updateItemSchema = z.object(
  Object.fromEntries(
    Object.entries(itemFields).map(([k, v]) => [k, v.optional()])
  )
);
