import { Router } from "express";
import { parsePagination } from "../middlewares/pagination.js";
import { validate } from "../middlewares/validate.js";
import { createDungeonSchema, updateDungeonSchema } from "../schemas/dungeon.js";
import {
  listDungeons,
  getDungeon,
  createDungeon,
  updateDungeon,
  deleteDungeon,
} from "../controllers/dungeons.js";

const router = Router();

router.get("/", parsePagination, listDungeons);
router.get("/:id", getDungeon);
router.post("/", validate(createDungeonSchema), createDungeon);
router.put("/:id", validate(updateDungeonSchema), updateDungeon);
router.delete("/:id", deleteDungeon);

export default router;
