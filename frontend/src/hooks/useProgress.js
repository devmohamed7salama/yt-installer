import { useState, useEffect, useCallback } from 'react';
import { subscribeToProgress } from '../services/api';

export function useProgress(id) {
  const [progress, setProgress] = useState({ status: 'idle', progress: 0 });
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!id) return;
    
    const unsubscribe = subscribeToProgress(id, (data) => {
      if (data.error) {
        setError(data.error);
      } else {
        setProgress(data);
      }
    });
    
    return () => unsubscribe();
  }, [id]);
  
  const reset = useCallback(() => {
    setProgress({ status: 'idle', progress: 0 });
    setError(null);
  }, []);
  
  return { progress, error, reset };
}
