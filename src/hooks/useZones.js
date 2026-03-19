
import { useState, useEffect } from 'react';

import DataService from '../services/DataService';

export function useZones() {

  const [zones, setZones] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  useEffect(() => {

    loadZones();

  }, []);

  async function loadZones() {

    try {

      const data = await DataService.getZones();

      setZones(data);

      setError(null);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  }

  return { zones, loading, error, refresh: loadZones };

}

