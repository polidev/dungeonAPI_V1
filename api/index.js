import express from "express";
import cors from "cors";
import dungeonRoutes from "./routes/dungeons.js";
import monsterRoutes from "./routes/monsters.js";
import itemRoutes from "./routes/items.js";
import characterRoutes from "./routes/characters.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/dungeons", dungeonRoutes);
app.use("/api/monsters", monsterRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/characters", characterRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

export default app;
