import { Link } from "react-router";
import { useState, useEffect } from "react";
import { api } from "../api/client.js";
import Loader from "../components/ui/Loader.jsx";

const sections = [
  { to: "/dungeons", label: "Dungeons", icon: "🏰", desc: "Explore and manage dungeon locations" },
  { to: "/monsters", label: "Monsters", icon: "🐉", desc: "Browse creatures by type and dungeon" },
  { to: "/items", label: "Items", icon: "⚔️", desc: "Weapons, armor, potions and rings" },
  { to: "/characters", label: "Characters", icon: "🛡️", desc: "Heroes and their inventories" },
];

export default function Home() {
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    Promise.all([
      api.list("dungeons", { limit: 1 }),
      api.list("monsters", { limit: 1 }),
      api.list("items", { limit: 1 }),
      api.list("characters", { limit: 1 }),
    ])
      .then(([d, m, i, c]) =>
        setCounts({ dungeons: d.total, monsters: m.total, items: i.total, characters: c.total })
      )
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="font-bold text-foreground mb-3">Dungeon API</h1>
        <p className="text-muted-foreground text-lg">
          A REST API for managing dungeons, monsters, items and characters.
        </p>
      </div>

      {counts ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Dungeons", value: counts.dungeons },
            { label: "Monsters", value: counts.monsters },
            { label: "Items", value: counts.items },
            { label: "Characters", value: counts.characters },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-xl border border-border bg-card text-center">
              <p className="text-3xl font-bold text-primary">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center mb-12"><Loader /></div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
          >
            <span className="text-3xl">{s.icon}</span>
            <div>
              <h3 className="font-semibold text-foreground">{s.label}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
