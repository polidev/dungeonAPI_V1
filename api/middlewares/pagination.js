export function parsePagination(req, res, next) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const sort = req.query.sort || "createdAt";
  const order = req.query.order === "asc" ? "asc" : "desc";

  const skip = (page - 1) * limit;

  req.pagination = { page, limit, sort, order, skip };
  next();
}
