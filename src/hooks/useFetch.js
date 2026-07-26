import { useState, useEffect } from "react";
import { api } from "../api/client.js";

export function useFetch(resource, params = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trigger, setTrigger] = useState(0);

  const refetch = () => setTrigger((t) => t + 1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .list(resource, params)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resource, JSON.stringify(params), trigger]);

  return { data, loading, error, refetch };
}
