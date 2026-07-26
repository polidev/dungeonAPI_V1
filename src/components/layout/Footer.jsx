export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Dungeon API &copy; {new Date().getFullYear()}
        </p>
        <p className="text-xs text-muted-foreground">
          Built with React, Express &amp; Prisma
        </p>
      </div>
    </footer>
  );
}
