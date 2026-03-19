
import { useState, useEffect } from 'react';

import DataService from '../services/DataService';

export function useTrucks() {

  const [trucks, setTrucks] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  useEffect(() => {

    loadTrucks();

    DataService.addUpdateListener(setTrucks);

    const interval = setInterval(loadTrucks, 30000);

    return () => clearInterval(interval);

  }, []);

  async function loadTrucks() {

    try {

      const data = await DataService.getTrucks();

      setTrucks(data);

      setError(null);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  }

  return {

    trucks,

    loading,

    error,

    refresh: loadTrucks,

    activeTrucks: trucks.filter(t => t.status === 'active')

  };

}

