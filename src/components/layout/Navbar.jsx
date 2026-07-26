import { NavLink } from "react-router";

const links = [
  { to: "/", label: "Home" },
  { to: "/dungeons", label: "Dungeons" },
  { to: "/monsters", label: "Monsters" },
  { to: "/items", label: "Items" },
  { to: "/characters", label: "Characters" },
];

export default function Navbar() {
  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14 gap-8">
          <NavLink to="/" className="text-lg font-bold text-primary tracking-tight">
            Dungeon API
          </NavLink>
          <div className="flex items-center gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
