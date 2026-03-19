// src/data/zones.js
// Zonas reales de Salta Capital con coordenadas aproximadas

export const STATIC_ZONES = [
  {
    id: 'zone-centro',
    name: 'Centro',
    bounds: {
      northeast: { lat: -24.7750, lng: -65.4050 },
      southwest: { lat: -24.7950, lng: -65.4250 }
    },
    schedules: [
      {
        day: 'Lunes a Sábado',
        time: '06:00 - 14:00',
        type: 'Recolección diurna'
      }
    ],
    assignedTrucks: ['truck-001'],
    color: '#3B82F6' // Azul
  },
  {
    id: 'zone-villa-san-martin',
    name: 'Villa San Martín',
    bounds: {
      northeast: { lat: -24.8000, lng: -65.4300 },
      southwest: { lat: -24.8200, lng: -65.4500 }
    },
    schedules: [
      {
        day: 'Domingo a Jueves',
        time: '21:00 - 05:00',
        type: 'Recolección nocturna'
      }
    ],
    assignedTrucks: ['truck-002'],
    color: '#22C55E' // Verde
  },
  {
    id: 'zone-grand-bourg',
    name: 'Grand Bourg',
    bounds: {
      northeast: { lat: -24.7600, lng: -65.4100 },
      southwest: { lat: -24.7800, lng: -65.4350 }
    },
    schedules: [
      {
        day: 'Lunes a Sábado',
        time: '07:00 - 15:00',
        type: 'Recolección diurna'
      }
    ],
    assignedTrucks: ['truck-003'],
    color: '#F97316' // Naranja
  },
  {
    id: 'zone-tres-cerritos',
    name: 'Tres Cerritos',
    bounds: {
      northeast: { lat: -24.7400, lng: -65.3800 },
      southwest: { lat: -24.7650, lng: -65.4100 }
    },
    schedules: [
      {
        day: 'Martes a Domingo',
        time: '06:30 - 14:30',
        type: 'Recolección diurna'
      }
    ],
    assignedTrucks: ['truck-001'],
    color: '#8B5CF6' // Violeta
  },
  {
    id: 'zone-castañares',
    name: 'Castañares',
    bounds: {
      northeast: { lat: -24.8200, lng: -65.4600 },
      southwest: { lat: -24.8400, lng: -65.4800 }
    },
    schedules: [
      {
        day: 'Lunes a Viernes',
        time: '22:00 - 06:00',
        type: 'Recolección nocturna'
      }
    ],
    assignedTrucks: ['truck-002'],
    color: '#EC4899' // Rosa
  }
];

// Función helper para detectar zona del usuario
export function getUserZone(userLocation, zones = STATIC_ZONES) {
  return zones.find(zone => {
    const { latitude, longitude } = userLocation;
    const { northeast, southwest } = zone.bounds;
    
    return (
      latitude <= northeast.lat &&
      latitude >= southwest.lat &&
      longitude <= northeast.lng &&
      longitude >= southwest.lng
    );
  });
}

// Obtener próximo horario de recolección
export function getNextCollection(zone) {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Domingo, 6 = Sábado
  const currentHour = now.getHours();
  
  // Lógica simplificada para el MVP
  const schedule = zone.schedules[0];
  const [startHour] = schedule.time.split(' - ')[0].split(':').map(Number);
  
  if (currentHour < startHour) {
    return `Hoy a las ${schedule.time.split(' - ')[0]}`;
  } else {
    return `Mañana a las ${schedule.time.split(' - ')[0]}`;
  }
}