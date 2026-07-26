import { Router } from "express";
import { parsePagination } from "../middlewares/pagination.js";
import { validate } from "../middlewares/validate.js";
import { createCharacterSchema, updateCharacterSchema } from "../schemas/character.js";
import {
  listCharacters,
  getCharacter,
  createCharacter,
  updateCharacter,
  deleteCharacter,
} from "../controllers/characters.js";

const router = Router();

router.get("/", parsePagination, listCharacters);
router.get("/:id", getCharacter);
router.post("/", validate(createCharacterSchema), createCharacter);
router.put("/:id", validate(updateCharacterSchema), updateCharacter);
router.delete("/:id", deleteCharacter);

export default router;
