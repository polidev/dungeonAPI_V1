import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.inventory.deleteMany();
  await prisma.monster.deleteMany();
  await prisma.character.deleteMany();
  await prisma.item.deleteMany();
  await prisma.dungeon.deleteMany();

  const dungeons = await Promise.all([
    prisma.dungeon.create({
      data: {
        name: "Goblin Warrens",
        description:
          "A damp network of tunnels infested with goblin tribes. The air reeks of mold and old blood.",
        difficulty: "easy",
      },
    }),
    prisma.dungeon.create({
      data: {
        name: "Thornwood Cemetery",
        description:
          "An ancient graveyard where the dead do not rest. Skeletons rise from cracked tombs at midnight.",
        difficulty: "easy",
      },
    }),
    prisma.dungeon.create({
      data: {
        name: "Molten Caverns",
        description:
          "Underground caves filled with rivers of lava. Fire elementals guard crystalline treasures.",
        difficulty: "medium",
      },
    }),
    prisma.dungeon.create({
      data: {
        name: "Shadowfang Keep",
        description:
          "A crumbling fortress atop a jagged peak. Werewolves patrol its moonlit halls.",
        difficulty: "medium",
      },
    }),
    prisma.dungeon.create({
      data: {
        name: "The Abyssal Vault",
        description:
          "A pocket dimension where reality bends. Demons barter with mortals for their souls.",
        difficulty: "hard",
      },
    }),
    prisma.dungeon.create({
      data: {
        name: "Dragon's Roost",
        description:
          "A volcanic summit where the ancient wyrm Pyraxion sleeps atop a hoard of gold.",
        difficulty: "boss",
      },
    }),
  ]);

  await Promise.all([
    prisma.monster.create({
      data: { name: "Goblin Scout", type: "beast", health: 20, attack: 5, defense: 2, dungeonId: dungeons[0].id },
    }),
    prisma.monster.create({
      data: { name: "Goblin Shaman", type: "beast", health: 35, attack: 12, defense: 4, dungeonId: dungeons[0].id },
    }),
    prisma.monster.create({
      data: { name: "Goblin Warchief", type: "beast", health: 60, attack: 18, defense: 8, dungeonId: dungeons[0].id },
    }),
    prisma.monster.create({
      data: { name: "Giant Rat", type: "beast", health: 15, attack: 4, defense: 1, dungeonId: dungeons[0].id },
    }),
    prisma.monster.create({
      data: { name: "Skeleton Warrior", type: "undead", health: 30, attack: 10, defense: 6, dungeonId: dungeons[1].id },
    }),
    prisma.monster.create({
      data: { name: "Skeleton Mage", type: "undead", health: 25, attack: 16, defense: 3, dungeonId: dungeons[1].id },
    }),
    prisma.monster.create({
      data: { name: "Zombie Brute", type: "undead", health: 50, attack: 8, defense: 10, dungeonId: dungeons[1].id },
    }),
    prisma.monster.create({
      data: { name: "Wraith", type: "undead", health: 40, attack: 20, defense: 2, dungeonId: dungeons[1].id },
    }),
    prisma.monster.create({
      data: { name: "Fire Elemental", type: "elemental", health: 55, attack: 22, defense: 8, dungeonId: dungeons[2].id },
    }),
    prisma.monster.create({
      data: { name: "Lava Slug", type: "elemental", health: 70, attack: 10, defense: 15, dungeonId: dungeons[2].id },
    }),
    prisma.monster.create({
      data: { name: "Magma Golem", type: "elemental", health: 90, attack: 18, defense: 20, dungeonId: dungeons[2].id },
    }),
    prisma.monster.create({
      data: { name: "Ember Sprite", type: "elemental", health: 20, attack: 14, defense: 4, dungeonId: dungeons[2].id },
    }),
    prisma.monster.create({
      data: { name: "Werewolf", type: "beast", health: 65, attack: 24, defense: 10, dungeonId: dungeons[3].id },
    }),
    prisma.monster.create({
      data: { name: "Shadow Stalker", type: "beast", health: 45, attack: 28, defense: 6, dungeonId: dungeons[3].id },
    }),
    prisma.monster.create({
      data: { name: "Nightcrawler", type: "beast", health: 80, attack: 20, defense: 14, dungeonId: dungeons[3].id },
    }),
    prisma.monster.create({
      data: { name: "Imp", type: "demon", health: 25, attack: 12, defense: 4, dungeonId: dungeons[4].id },
    }),
    prisma.monster.create({
      data: { name: "Soul Harvester", type: "demon", health: 70, attack: 30, defense: 12, dungeonId: dungeons[4].id },
    }),
    prisma.monster.create({
      data: { name: "Void Walker", type: "demon", health: 55, attack: 35, defense: 8, dungeonId: dungeons[4].id },
    }),
    prisma.monster.create({
      data: { name: "Pit Lord", type: "demon", health: 120, attack: 28, defense: 18, dungeonId: dungeons[4].id },
    }),
    prisma.monster.create({
      data: { name: "Pyraxion", type: "dragon", health: 300, attack: 50, defense: 35, dungeonId: dungeons[5].id },
    }),
    prisma.monster.create({
      data: { name: "Drake Hatchling", type: "dragon", health: 40, attack: 15, defense: 10, dungeonId: dungeons[5].id },
    }),
    prisma.monster.create({
      data: { name: "Wyvern Sentinel", type: "dragon", health: 100, attack: 32, defense: 22, dungeonId: dungeons[5].id },
    }),
  ]);

  const items = await Promise.all([
    prisma.item.create({ data: { name: "Rusty Sword", type: "weapon", power: 8, description: "A battered blade, but still sharp enough to cut flesh." } }),
    prisma.item.create({ data: { name: "Iron Mace", type: "weapon", power: 12, description: "Heavy and blunt. Crushes bone with ease." } }),
    prisma.item.create({ data: { name: "Flame Tongue", type: "weapon", power: 22, description: "A magical sword wreathed in perpetual fire." } }),
    prisma.item.create({ data: { name: "Shadow Fang Dagger", type: "weapon", power: 18, description: "Forged from a fang of the Void Walker. Drains life on hit." } }),
    prisma.item.create({ data: { name: "Dragonbone Greatsword", type: "weapon", power: 35, description: "Carved from the rib of an ancient wyrm. Devastatingly heavy." } }),
    prisma.item.create({ data: { name: "Leather Vest", type: "armor", power: 5, description: "Basic protection. Better than nothing." } }),
    prisma.item.create({ data: { name: "Chainmail Hauberk", type: "armor", power: 12, description: "Interlocking steel rings deflect slashes." } }),
    prisma.item.create({ data: { name: "Mithril Plate", type: "armor", power: 20, description: "Lightweight yet incredibly strong elven craftsmanship." } }),
    prisma.item.create({ data: { name: "Dragon Scale Shield", type: "armor", power: 25, description: "Heat-resistant scales forged into an impenetrable barrier." } }),
    prisma.item.create({ data: { name: "Health Potion", type: "potion", power: 30, description: "Restores 30 HP. Tastes like cherries." } }),
    prisma.item.create({ data: { name: "Elixir of Strength", type: "potion", power: 15, description: "Temporarily boosts attack by 15 for one battle." } }),
    prisma.item.create({ data: { name: "Antidote", type: "potion", power: 10, description: "Cures poison and venom effects." } }),
    prisma.item.create({ data: { name: "Ring of Fortitude", type: "ring", power: 8, description: "Increases max HP by 20 while worn." } }),
    prisma.item.create({ data: { name: "Ring of the Arcane", type: "ring", power: 14, description: "Amplifies magical ability. Faintly glows blue." } }),
    prisma.item.create({ data: { name: "Ring of Shadows", type: "ring", power: 10, description: "Grants wearer advantage on stealth checks." } }),
    prisma.item.create({ data: { name: "Band of the Warrior King", type: "ring", power: 18, description: "Once worn by a king who conquered seven dungeons." } }),
  ]);

  const characters = await Promise.all([
    prisma.character.create({ data: { name: "Aldric", class: "warrior", health: 120, attack: 18, defense: 14, level: 5 } }),
    prisma.character.create({ data: { name: "Seraphina", class: "mage", health: 70, attack: 28, defense: 6, level: 6 } }),
    prisma.character.create({ data: { name: "Thorne", class: "rogue", health: 85, attack: 24, defense: 8, level: 4 } }),
    prisma.character.create({ data: { name: "Lyra", class: "ranger", health: 90, attack: 20, defense: 10, level: 5 } }),
    prisma.character.create({ data: { name: "Brom", class: "warrior", health: 140, attack: 15, defense: 18, level: 7 } }),
    prisma.character.create({ data: { name: "Nyx", class: "rogue", health: 65, attack: 30, defense: 5, level: 3 } }),
    prisma.character.create({ data: { name: "Elowen", class: "mage", health: 60, attack: 32, defense: 4, level: 8 } }),
    prisma.character.create({ data: { name: "Kael", class: "ranger", health: 95, attack: 22, defense: 12, level: 6 } }),
  ]);

  await Promise.all([
    prisma.inventory.create({ data: { characterId: characters[0].id, itemId: items[0].id, quantity: 1 } }),
    prisma.inventory.create({ data: { characterId: characters[0].id, itemId: items[7].id, quantity: 1 } }),
    prisma.inventory.create({ data: { characterId: characters[0].id, itemId: items[12].id, quantity: 1 } }),
    prisma.inventory.create({ data: { characterId: characters[1].id, itemId: items[2].id, quantity: 1 } }),
    prisma.inventory.create({ data: { characterId: characters[1].id, itemId: items[13].id, quantity: 1 } }),
    prisma.inventory.create({ data: { characterId: characters[1].id, itemId: items[9].id, quantity: 3 } }),
    prisma.inventory.create({ data: { characterId: characters[2].id, itemId: items[3].id, quantity: 2 } }),
    prisma.inventory.create({ data: { characterId: characters[2].id, itemId: items[14].id, quantity: 1 } }),
    prisma.inventory.create({ data: { characterId: characters[3].id, itemId: items[0].id, quantity: 1 } }),
    prisma.inventory.create({ data: { characterId: characters[3].id, itemId: items[6].id, quantity: 1 } }),
    prisma.inventory.create({ data: { characterId: characters[4].id, itemId: items[1].id, quantity: 1 } }),
    prisma.inventory.create({ data: { characterId: characters[4].id, itemId: items[7].id, quantity: 1 } }),
    prisma.inventory.create({ data: { characterId: characters[5].id, itemId: items[3].id, quantity: 1 } }),
    prisma.inventory.create({ data: { characterId: characters[5].id, itemId: items[10].id, quantity: 2 } }),
    prisma.inventory.create({ data: { characterId: characters[6].id, itemId: items[2].id, quantity: 1 } }),
    prisma.inventory.create({ data: { characterId: characters[6].id, itemId: items[13].id, quantity: 1 } }),
    prisma.inventory.create({ data: { characterId: characters[7].id, itemId: items[0].id, quantity: 1 } }),
    prisma.inventory.create({ data: { characterId: characters[7].id, itemId: items[15].id, quantity: 1 } }),
  ]);

  console.log("Seeded: 6 dungeons, 22 monsters, 16 items, 8 characters, 18 inventory entries");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
