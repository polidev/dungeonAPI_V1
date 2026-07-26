import { prisma } from "../lib/prisma.js";

export async function listMonsters(req, res) {
  const { page, limit, sort, order, skip } = req.pagination;
  const { type, dungeonId, search } = req.query;

  const where = {};
  if (type) where.type = type;
  if (dungeonId) where.dungeonId = dungeonId;
  if (search) where.name = { contains: search };

  const [data, total] = await Promise.all([
    prisma.monster.findMany({
      where,
      orderBy: { [sort]: order },
      skip,
      take: limit,
      include: { dungeon: { select: { id: true, name: true } } },
    }),
    prisma.monster.count({ where }),
  ]);

  res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
}

export async function getMonster(req, res) {
  const monster = await prisma.monster.findUnique({
    where: { id: req.params.id },
    include: { dungeon: true },
  });

  if (!monster) return res.status(404).json({ message: "Monster not found" });
  res.json(monster);
}

export async function createMonster(req, res) {
  const monster = await prisma.monster.create({ data: req.body });
  res.status(201).json(monster);
}

export async function updateMonster(req, res) {
  const monster = await prisma.monster.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(monster);
}

export async function deleteMonster(req, res) {
  await prisma.monster.delete({ where: { id: req.params.id } });
  res.status(204).end();
}
