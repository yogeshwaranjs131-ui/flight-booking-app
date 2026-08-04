import { useState, useEffect, useCallback } from 'react';

export function useFetch(fetcher, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (abortController) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetcher({ signal: abortController.signal });
      if (!abortController.signal.aborted) {
        setData(response.data);
      }
    } catch (err) {
      if (!abortController.signal.aborted) {
        setError(err.response?.data?.message || err.message || 'An unknown error occurred.');
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, dependencies);

  useEffect(() => {
    const abortController = new AbortController();
    fetchData(abortController);

    return () => {
      abortController.abort();
    };
  }, [fetchData]);

  const refetch = () => {
    fetchData(new AbortController());
  };

  return { data, loading, error, refetch };
}  