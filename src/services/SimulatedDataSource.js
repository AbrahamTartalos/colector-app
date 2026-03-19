import { STATIC_ROUTES } from '../data/routes';
import { STATIC_ZONES } from '../data/zones';

class SimulatedDataSource {
  constructor() {
    this.trucks = this.initializeTrucks();
    this.routes = STATIC_ROUTES;
    this.zones = STATIC_ZONES;
    this.simulationInterval = null;
    this.updateCallbacks = [];
  }

  initializeTrucks() {
    return [
      {
        id: 'truck-001',
        name: 'Camión Centro-Norte',
        status: 'active',
        currentLocation: {
          latitude: -24.7821,
          longitude: -65.4232,
          timestamp: new Date().toISOString()
        },
        assignedRoute: 'route-centro',
        progress: 0,
        speed: 25,
        icon: '🚛',
        completedSegments: [] // Índices de segmentos completados
      },
      {
        id: 'truck-002',
        name: 'Camión Villa San Martín',
        status: 'active',
        currentLocation: {
          latitude: -24.8100,
          longitude: -65.4400,
          timestamp: new Date().toISOString()
        },
        assignedRoute: 'route-villa-san-martin',
        progress: 0,
        speed: 20,
        icon: '🚛',
        completedSegments: []
      },
      {
        id: 'truck-003',
        name: 'Camión Grand Bourg',
        status: 'active',
        currentLocation: {
          latitude: -24.7700,
          longitude: -65.4200,
          timestamp: new Date().toISOString()
        },
        assignedRoute: 'route-grand-bourg',
        progress: 0,
        speed: 22,
        icon: '🚛',
        completedSegments: []
      }
    ];
  }

  startSimulation() {
    if (this.simulationInterval) return;

    console.log('🚀 Simulación de camiones iniciada');

    this.simulationInterval = setInterval(() => {
      this.trucks = this.trucks.map(truck => {
        if (truck.status !== 'active') return truck;

        const route = this.routes.find(r => r.id === truck.assignedRoute);
        if (!route) return truck;

        const nextPosition = this.calculateNextPosition(
          truck.currentLocation,
          route,
          truck.progress
        );

        const newProgress = Math.min(truck.progress + 2, 100);
        
        // Calcular segmentos completados
        const totalPoints = route.coordinates.length;
        const currentPointIndex = Math.floor((newProgress / 100) * (totalPoints - 1));
        const completedSegments = Array.from({ length: currentPointIndex }, (_, i) => i);

        const finalProgress = newProgress >= 100 ? 0 : newProgress;
        const finalStatus = newProgress >= 100 ? 'active' : 'active';

        return {
          ...truck,
          currentLocation: nextPosition,
          progress: finalProgress,
          status: finalStatus,
          completedSegments: finalProgress === 0 ? [] : completedSegments
        };
      });

      this.notifyListeners();
    }, 30000);
  }

  stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
      console.log('⏸️ Simulación detenida');
    }
  }

  calculateNextPosition(currentLocation, route, progress) {
    const totalPoints = route.coordinates.length;
    const currentIndex = Math.floor((progress / 100) * (totalPoints - 1));
    const nextIndex = Math.min(currentIndex + 1, totalPoints - 1);

    const point1 = route.coordinates[currentIndex];
    const point2 = route.coordinates[nextIndex];

    const interpolationFactor = ((progress / 100) * (totalPoints - 1)) % 1;

    return {
      latitude: point1.latitude + (point2.latitude - point1.latitude) * interpolationFactor,
      longitude: point1.longitude + (point2.longitude - point1.longitude) * interpolationFactor,
      timestamp: new Date().toISOString()
    };
  }

  addUpdateListener(callback) {
    this.updateCallbacks.push(callback);
  }

  notifyListeners() {
    this.updateCallbacks.forEach(callback => {
      callback(this.trucks);
    });
  }

  getTrucks() {
    return Promise.resolve([...this.trucks]);
  }

  getTruckById(truckId) {
    const truck = this.trucks.find(t => t.id === truckId);
    return Promise.resolve(truck || null);
  }

  getRoutes() {
    return Promise.resolve([...this.routes]);
  }

  getRouteById(routeId) {
    const route = this.routes.find(r => r.id === routeId);
    return Promise.resolve(route || null);
  }

  getZones() {
    return Promise.resolve([...this.zones]);
  }

  getUserZone(userLocation) {
    const zone = this.zones.find(zone => {
      const { latitude, longitude } = userLocation;
      const { northeast, southwest } = zone.bounds;

      return (
        latitude <= northeast.lat &&
        latitude >= southwest.lat &&
        longitude <= northeast.lng &&
        longitude >= southwest.lng
      );
    });

    return Promise.resolve(zone || null);
  }

  updateTruckLocation(truckId, location) {
    this.trucks = this.trucks.map(truck =>
      truck.id === truckId
        ? { ...truck, currentLocation: location }
        : truck
    );

    this.notifyListeners();
    return Promise.resolve({ success: true });
  }

  updateTruckStatus(truckId, status) {
    this.trucks = this.trucks.map(truck =>
      truck.id === truckId
        ? { ...truck, status }
        : truck
    );

    this.notifyListeners();
    return Promise.resolve({ success: true });
  }
}

export default new SimulatedDataSource();
