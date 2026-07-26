export default function EmptyState({ message = "No data found" }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <p className="text-lg">{message}</p>
    </div>
  );
}
