import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router";

const links = [
  { to: "/", label: "Home" },
  { to: "/dungeons", label: "Dungeons" },
  { to: "/monsters", label: "Monsters" },
  { to: "/items", label: "Items" },
  { to: "/characters", label: "Characters" },
];

function BurgerIcon({ open }) {
  return (
    <span className="relative flex h-11 w-11 items-center justify-center" aria-hidden="true">
      <span
        className={`absolute h-0.5 w-5 bg-foreground transition-transform duration-200 ${
          open ? "translate-y-0 rotate-45" : "-translate-y-1.5"
        }`}
      />
      <span
        className={`absolute h-0.5 w-5 bg-foreground transition-all duration-200 ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`absolute h-0.5 w-5 bg-foreground transition-transform duration-200 ${
          open ? "translate-y-0 -rotate-45" : "translate-y-1.5"
        }`}
      />
    </span>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <NavLink to="/" className="text-lg font-bold text-primary tracking-tight">
            Dungeon API
          </NavLink>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center ${
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

          <button
            className="md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] -mr-2 cursor-pointer"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <BurgerIcon open={open} />
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-card animate-slide-down">
          <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center ${
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
      )}
    </nav>
  );
}
