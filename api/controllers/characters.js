import { prisma } from "../lib/prisma.js";

export async function listCharacters(req, res) {
  const { page, limit, sort, order, skip } = req.pagination;
  const { class: cls, search } = req.query;

  const where = {};
  if (cls) where.class = cls;
  if (search) where.name = { contains: search };

  const [data, total] = await Promise.all([
    prisma.character.findMany({
      where,
      orderBy: { [sort]: order },
      skip,
      take: limit,
      include: { _count: { select: { inventories: true } } },
    }),
    prisma.character.count({ where }),
  ]);

  res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
}

export async function getCharacter(req, res) {
  const character = await prisma.character.findUnique({
    where: { id: req.params.id },
    include: { inventories: { include: { item: true } } },
  });

  if (!character) return res.status(404).json({ message: "Character not found" });
  res.json(character);
}

export async function createCharacter(req, res) {
  const character = await prisma.character.create({ data: req.body });
  res.status(201).json(character);
}

export async function updateCharacter(req, res) {
  const character = await prisma.character.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(character);
}

export async function deleteCharacter(req, res) {
  await prisma.character.delete({ where: { id: req.params.id } });
  res.status(204).end();
}
