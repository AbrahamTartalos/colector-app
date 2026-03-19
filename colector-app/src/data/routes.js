// src/data/routes.js
// Rutas realistas de recolección en Salta Capital

export const STATIC_ROUTES = [
  {
    id: 'route-centro',
    name: 'Ruta Centro',
    zone: 'Centro',
    coordinates: [
      // Plaza 9 de Julio y alrededores
      { latitude: -24.7821, longitude: -65.4232, order: 1 },
      { latitude: -24.7830, longitude: -65.4220, order: 2 },
      { latitude: -24.7840, longitude: -65.4210, order: 3 },
      { latitude: -24.7850, longitude: -65.4200, order: 4 },
      { latitude: -24.7860, longitude: -65.4190, order: 5 },
      { latitude: -24.7870, longitude: -65.4180, order: 6 },
      { latitude: -24.7880, longitude: -65.4170, order: 7 },
      { latitude: -24.7890, longitude: -65.4160, order: 8 },
      { latitude: -24.7900, longitude: -65.4150, order: 9 },
      { latitude: -24.7910, longitude: -65.4140, order: 10 },
      { latitude: -24.7920, longitude: -65.4150, order: 11 },
      { latitude: -24.7910, longitude: -65.4160, order: 12 },
      { latitude: -24.7900, longitude: -65.4170, order: 13 },
      { latitude: -24.7890, longitude: -65.4180, order: 14 },
      { latitude: -24.7880, longitude: -65.4190, order: 15 }
    ],
    schedule: {
      daysOfWeek: [1, 2, 3, 4, 5, 6], // Lunes a Sábado
      startTime: '06:00',
      endTime: '14:00',
      type: 'diurna'
    },
    estimatedDuration: 180, // 3 horas
    status: 'pending'
  },
  {
    id: 'route-villa-san-martin',
    name: 'Ruta Villa San Martín',
    zone: 'Villa San Martín',
    coordinates: [
      { latitude: -24.8100, longitude: -65.4400, order: 1 },
      { latitude: -24.8110, longitude: -65.4390, order: 2 },
      { latitude: -24.8120, longitude: -65.4380, order: 3 },
      { latitude: -24.8130, longitude: -65.4370, order: 4 },
      { latitude: -24.8140, longitude: -65.4360, order: 5 },
      { latitude: -24.8150, longitude: -65.4350, order: 6 },
      { latitude: -24.8160, longitude: -65.4360, order: 7 },
      { latitude: -24.8170, longitude: -65.4370, order: 8 },
      { latitude: -24.8180, longitude: -65.4380, order: 9 },
      { latitude: -24.8170, longitude: -65.4390, order: 10 },
      { latitude: -24.8160, longitude: -65.4400, order: 11 },
      { latitude: -24.8150, longitude: -65.4410, order: 12 }
    ],
    schedule: {
      daysOfWeek: [0, 1, 2, 3, 4], // Domingo a Jueves
      startTime: '21:00',
      endTime: '05:00',
      type: 'nocturna'
    },
    estimatedDuration: 240, // 4 horas
    status: 'pending'
  },
  {
    id: 'route-grand-bourg',
    name: 'Ruta Grand Bourg',
    zone: 'Grand Bourg',
    coordinates: [
      { latitude: -24.7700, longitude: -65.4200, order: 1 },
      { latitude: -24.7710, longitude: -65.4190, order: 2 },
      { latitude: -24.7720, longitude: -65.4180, order: 3 },
      { latitude: -24.7730, longitude: -65.4170, order: 4 },
      { latitude: -24.7740, longitude: -65.4160, order: 5 },
      { latitude: -24.7750, longitude: -65.4170, order: 6 },
      { latitude: -24.7760, longitude: -65.4180, order: 7 },
      { latitude: -24.7770, longitude: -65.4190, order: 8 },
      { latitude: -24.7760, longitude: -65.4200, order: 9 },
      { latitude: -24.7750, longitude: -65.4210, order: 10 }
    ],
    schedule: {
      daysOfWeek: [1, 2, 3, 4, 5, 6], // Lunes a Sábado
      startTime: '07:00',
      endTime: '15:00',
      type: 'diurna'
    },
    estimatedDuration: 210, // 3.5 horas
    status: 'pending'
  }
];

// Helper: Calcular distancia entre dos puntos GPS (fórmula Haversine)
export function calculateDistance(point1, point2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.latitude)) *
    Math.cos(toRad(point2.latitude)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance; // en kilómetros
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

// Helper: Obtener ruta por ID
export function getRouteById(routeId) {
  return STATIC_ROUTES.find(route => route.id === routeId);
}