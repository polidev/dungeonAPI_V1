import { prisma } from "../lib/prisma.js";

export async function listDungeons(req, res) {
  const { page, limit, sort, order, skip } = req.pagination;
  const { difficulty, search } = req.query;

  const where = {};
  if (difficulty) where.difficulty = difficulty;
  if (search) where.name = { contains: search };

  const [data, total] = await Promise.all([
    prisma.dungeon.findMany({
      where,
      orderBy: { [sort]: order },
      skip,
      take: limit,
      include: { _count: { select: { monsters: true } } },
    }),
    prisma.dungeon.count({ where }),
  ]);

  res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
}

export async function getDungeon(req, res) {
  const dungeon = await prisma.dungeon.findUnique({
    where: { id: req.params.id },
    include: { monsters: true },
  });

  if (!dungeon) return res.status(404).json({ message: "Dungeon not found" });
  res.json(dungeon);
}

export async function createDungeon(req, res) {
  const dungeon = await prisma.dungeon.create({ data: req.body });
  res.status(201).json(dungeon);
}

export async function updateDungeon(req, res) {
  const dungeon = await prisma.dungeon.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(dungeon);
}

export async function deleteDungeon(req, res) {
  await prisma.dungeon.delete({ where: { id: req.params.id } });
  res.status(204).end();
}
