import { Router } from "express";
import { parsePagination } from "../middlewares/pagination.js";
import { validate } from "../middlewares/validate.js";
import { createMonsterSchema, updateMonsterSchema } from "../schemas/monster.js";
import {
  listMonsters,
  getMonster,
  createMonster,
  updateMonster,
  deleteMonster,
} from "../controllers/monsters.js";

const router = Router();

router.get("/", parsePagination, listMonsters);
router.get("/:id", getMonster);
router.post("/", validate(createMonsterSchema), createMonster);
router.put("/:id", validate(updateMonsterSchema), updateMonster);
router.delete("/:id", deleteMonster);

export default router;
