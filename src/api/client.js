const BASE = "/api";

async function request(endpoint, options = {}) {
  const { body, ...rest } = options;
  const config = {
    headers: { "Content-Type": "application/json" },
    ...rest,
  };
  if (body) config.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${endpoint}`, config);

  if (res.status === 204) return null;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = res.status;
    error.errors = data.errors;
    throw error;
  }

  return data;
}

export const api = {
  list: (resource, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/${resource}${qs ? `?${qs}` : ""}`);
  },
  get: (resource, id) => request(`/${resource}/${id}`),
  create: (resource, body) => request(`/${resource}`, { method: "POST", body }),
  update: (resource, id, body) =>
    request(`/${resource}/${id}`, { method: "PUT", body }),
  remove: (resource, id) =>
    request(`/${resource}/${id}`, { method: "DELETE" }),
};
