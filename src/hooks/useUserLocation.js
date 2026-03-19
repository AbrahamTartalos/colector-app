
import { useState, useEffect } from 'react';

import * as Location from 'expo-location';

import DataService from '../services/DataService';

export function useUserLocation() {

  const [location, setLocation] = useState(null);

  const [zone, setZone] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [permissionStatus, setPermissionStatus] = useState(null);

  useEffect(() => {

    requestLocationPermission();

  }, []);

  async function requestLocationPermission() {

    try {

      const { status } = await Location.requestForegroundPermissionsAsync();

      setPermissionStatus(status);

      if (status === 'granted') {

        await getCurrentLocation();

      } else {

        setLoading(false);

      }

    } catch (err) {

      setError(err.message);

      setLoading(false);

    }

  }

  async function getCurrentLocation() {

    try {

      const loc = await Location.getCurrentPositionAsync({});

      const userLoc = {

        latitude: loc.coords.latitude,

        longitude: loc.coords.longitude

      };

      setLocation(userLoc);

      const userZone = await DataService.getUserZone(userLoc);

      setZone(userZone);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  }

  return {

    location,

    zone,

    loading,

    error,

    permissionStatus,

    refresh: getCurrentLocation,

    hasPermission: permissionStatus === 'granted'

  };

}

