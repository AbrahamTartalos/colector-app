// src/services/DataService.js
// Capa de abstracción: cambia entre simulación y datos reales

import SimulatedDataSource from './SimulatedDataSource';
// import RealDataSource from './RealDataSource'; // Futuro

class DataService {
  constructor() {
    // AQUÍ SE HACE EL SWITCH: simulación vs real
    const USE_REAL_DATA = false; // Cambiar a true cuando haya datos reales
    
    if (USE_REAL_DATA) {
      // this.dataSource = new RealDataSource();
      console.log('📡 Usando datos REALES de API');
    } else {
      this.dataSource = SimulatedDataSource;
      this.dataSource.startSimulation();
      console.log('🎮 Usando datos SIMULADOS');
    }
  }

  // API unificada: Obtener camiones
  async getTrucks() {
    try {
      return await this.dataSource.getTrucks();
    } catch (error) {
      console.error('Error getting trucks:', error);
      throw error;
    }
  }

  // API unificada: Obtener camión por ID
  async getTruckById(truckId) {
    try {
      return await this.dataSource.getTruckById(truckId);
    } catch (error) {
      console.error('Error getting truck by ID:', error);
      throw error;
    }
  }

  // API unificada: Obtener rutas
  async getRoutes() {
    try {
      return await this.dataSource.getRoutes();
    } catch (error) {
      console.error('Error getting routes:', error);
      throw error;
    }
  }

  // API unificada: Obtener ruta por ID
  async getRouteById(routeId) {
    try {
      return await this.dataSource.getRouteById(routeId);
    } catch (error) {
      console.error('Error getting route by ID:', error);
      throw error;
    }
  }

  // API unificada: Obtener zonas
  async getZones() {
    try {
      return await this.dataSource.getZones();
    } catch (error) {
      console.error('Error getting zones:', error);
      throw error;
    }
  }

  // API unificada: Detectar zona del usuario
  async getUserZone(userLocation) {
    try {
      return await this.dataSource.getUserZone(userLocation);
    } catch (error) {
      console.error('Error getting user zone:', error);
      throw error;
    }
  }

  // API unificada: Actualizar ubicación de camión (admin)
  async updateTruckLocation(truckId, location) {
    try {
      return await this.dataSource.updateTruckLocation(truckId, location);
    } catch (error) {
      console.error('Error updating truck location:', error);
      throw error;
    }
  }

  // API unificada: Cambiar estado de camión (admin)
  async updateTruckStatus(truckId, status) {
    try {
      return await this.dataSource.updateTruckStatus(truckId, status);
    } catch (error) {
      console.error('Error updating truck status:', error);
      throw error;
    }
  }

  // Registrar listener para actualizaciones en tiempo real
  addUpdateListener(callback) {
    if (this.dataSource.addUpdateListener) {
      this.dataSource.addUpdateListener(callback);
    }
  }

  // Calcular distancia entre usuario y camión más cercano
  async getNearestTruck(userLocation) {
    try {
      const trucks = await this.getTrucks();
      
      let nearestTruck = null;
      let minDistance = Infinity;

      trucks.forEach(truck => {
        if (truck.status === 'active') {
          const distance = this.calculateDistance(
            userLocation,
            truck.currentLocation
          );

          if (distance < minDistance) {
            minDistance = distance;
            nearestTruck = { ...truck, distanceKm: distance };
          }
        }
      });

      return nearestTruck;
    } catch (error) {
      console.error('Error getting nearest truck:', error);
      throw error;
    }
  }

  // Calcular distancia entre dos puntos (Haversine)
  calculateDistance(point1, point2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(point2.latitude - point1.latitude);
    const dLon = this.toRad(point2.longitude - point1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(point1.latitude)) *
      Math.cos(this.toRad(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Calcular tiempo estimado de llegada
  calculateETA(distance, speed = 20) {
    // distance en km, speed en km/h
    const hours = distance / speed;
    const minutes = Math.round(hours * 60);
    
    if (minutes < 5) {
      return 'Muy cerca (menos de 5 minutos)';
    } else if (minutes < 60) {
      return `Aproximadamente ${minutes} minutos`;
    } else {
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `Aproximadamente ${hrs}h ${mins}m`;
    }
  }
}

// Exportar instancia única
export default new DataService();