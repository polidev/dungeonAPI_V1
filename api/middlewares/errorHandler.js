export function errorHandler(err, req, res, _next) {
  console.error(err);

  if (err.code === "P2025") {
    return res.status(404).json({ message: "Resource not found" });
  }

  if (err.code === "P2002") {
    const field = err.meta?.target?.[0] || "field";
    return res.status(409).json({ message: `A record with that ${field} already exists` });
  }

  res.status(500).json({ message: "Internal server error" });
}
