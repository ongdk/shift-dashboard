import { useEffect, useState } from "react";

const useFetch = <T = any,>(asyncFn: () => Promise<T>) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error>();

  useEffect(() => {
    if (loading) {
      setData(undefined);
      setError(undefined);
      void asyncFn()
        .then(setData)
        .catch((err) => {
          setError(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [loading]);

  return {
    loading,
    data,
    error,
    refresh() {
      setLoading(true);
    },
  };
};

export default useFetch;
