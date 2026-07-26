export default function Badge({ children, variant = "default" }) {
  const variants = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary/15 text-primary",
    destructive: "bg-destructive/15 text-destructive",
    success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
