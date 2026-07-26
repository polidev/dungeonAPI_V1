import { prisma } from "../lib/prisma.js";

export async function listItems(req, res) {
  const { page, limit, sort, order, skip } = req.pagination;
  const { type, search } = req.query;

  const where = {};
  if (type) where.type = type;
  if (search) where.name = { contains: search };

  const [data, total] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy: { [sort]: order },
      skip,
      take: limit,
    }),
    prisma.item.count({ where }),
  ]);

  res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
}

export async function getItem(req, res) {
  const item = await prisma.item.findUnique({
    where: { id: req.params.id },
    include: { inventories: { include: { character: { select: { id: true, name: true } } } } },
  });

  if (!item) return res.status(404).json({ message: "Item not found" });
  res.json(item);
}

export async function createItem(req, res) {
  const item = await prisma.item.create({ data: req.body });
  res.status(201).json(item);
}

export async function updateItem(req, res) {
  const item = await prisma.item.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(item);
}

export async function deleteItem(req, res) {
  await prisma.item.delete({ where: { id: req.params.id } });
  res.status(204).end();
}
