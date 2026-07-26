import { Router } from "express";
import { parsePagination } from "../middlewares/pagination.js";
import { validate } from "../middlewares/validate.js";
import { createItemSchema, updateItemSchema } from "../schemas/item.js";
import {
  listItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
} from "../controllers/items.js";

const router = Router();

router.get("/", parsePagination, listItems);
router.get("/:id", getItem);
router.post("/", validate(createItemSchema), createItem);
router.put("/:id", validate(updateItemSchema), updateItem);
router.delete("/:id", deleteItem);

export default router;
