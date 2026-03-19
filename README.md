cd /workspaces/colector-app/colector-app

cat > README.md << 'EOF'
# 🚛 Colector - App de Monitoreo de Recolección de Residuos

App móvil para monitorear en tiempo real los camiones recolectores de basura en Salta Capital, Argentina.

---

## 📋 Tabla de Contenidos

- [Estado Actual](#estado-actual)
- [Stack Técnico](#stack-técnico)
- [Características Implementadas](#características-implementadas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Configuración](#instalación-y-configuración)
- [Arquitectura de Datos](#arquitectura-de-datos)
- [Pantallas](#pantallas)
- [Próximos Pasos](#próximos-pasos)
- [Problemas Conocidos](#problemas-conocidos)
- [Documentación Adicional](#documentación-adicional)

---

## 🎯 Estado Actual

**Versión:** MVP 1.0  
**Última actualización:** Marzo 2026  
**Entorno:** GitHub Codespaces  
**Testing:** Expo Go en Android

### ✅ Funcionalidades Operativas

- **Simulación en tiempo real** de 3 camiones recolectores
- **Mapa interactivo** con ubicación de camiones
- **Pantalla de horarios** con búsqueda y filtros
- **Dark mode automático** según sistema operativo
- **ETA (tiempo estimado de llegada)** calculado dinámicamente
- **Alertas de proximidad** cuando el camión está cerca
- **Rutas visualizadas** (azul=pendiente, verde=completada)
- **Geolocalización** del usuario con detección de zona
- **Navegación por tabs** (Mapa / Horarios)

### ⚠️ En Desarrollo / Pendiente

- Rutas que sigan exactamente las calles reales de Salta
- Build nativo (APK) con Google Maps
- Panel de administrador
- Notificaciones push
- Integración con datos reales de GPS

---

## 🛠️ Stack Técnico

### Frontend
```json
{
  "expo": "~51.0.28",
  "react": "18.2.0",
  "react-native": "0.74.5",
  "expo-location": "~17.0.1",
  "@react-navigation/native": "^6.1.18",
  "@react-navigation/bottom-tabs": "^6.6.1",
  "react-native-screens": "~3.31.1",
  "react-native-safe-area-context": "4.10.5",
  "@react-native-async-storage/async-storage": "1.23.1"
}
```

### Herramientas de Desarrollo
- **Entorno:** GitHub Codespaces
- **Testing:** Expo Go (SDK 51)
- **Build:** Expo EAS (pendiente)
- **Control de versiones:** Git/GitHub

### Datos (Actual)
- Simulación local con `SimulatedDataSource`
- Sin backend externo
- Datos estáticos de Salta Capital

### Datos (Futuro)
- Backend: Node.js + Express
- Base de datos: PostgreSQL + PostGIS
- Tiempo real: WebSocket (Socket.io)
- Dispositivos GPS en camiones

---

## 🎨 Características Implementadas

### 1. **Simulación Inteligente de Camiones**

- 3 camiones simulados con rutas realistas
- Actualización automática cada 30 segundos
- Progreso de ruta (0-100%)
- Velocidades variables (20-25 km/h)
- Estados: activo, inactivo

**Ubicación:** `src/services/SimulatedDataSource.js`
```javascript
// Los camiones se mueven automáticamente
this.simulationInterval = setInterval(() => {
  this.trucks = this.trucks.map(truck => {
    // Calcula siguiente posición en la ruta
    const nextPosition = this.calculateNextPosition(...);
    return { ...truck, currentLocation: nextPosition };
  });
}, 30000);
```

### 2. **Rutas Visualizadas con Estados**

- **Azul claro:** Ruta pendiente (por recorrer)
- **Verde:** Ruta completada (ya pasó el camión)
- Se actualiza en tiempo real conforme avanza el camión

**Ubicación:** `src/screens/MapScreen.js`
```javascript
// Ruta pendiente
<Polyline
  coordinates={route.coordinates}
  strokeColor="#93C5FD"
  strokeWidth={4}
/>

// Ruta completada
<Polyline
  coordinates={completedCoordinates}
  strokeColor="#22C55E"
  strokeWidth={6}
/>
```

### 3. **ETA y Alertas de Proximidad**

Cálculo de tiempo estimado de llegada basado en:
- Distancia entre usuario y camión (Haversine)
- Velocidad actual del camión
- Alertas visuales por cercanía

**Estados de proximidad:**
- 🔴 **Rojo:** < 200m - "¡Muy cerca!"
- 🟠 **Naranja:** < 500m - "Cerca"
- 🟡 **Amarillo:** < 1km - "Acercándose"

**Ubicación:** `src/screens/MapScreen.js`
```javascript
function getProximityStatus(distance) {
  if (distance < 0.2) return { text: '¡Muy cerca!', color: '#EF4444' };
  if (distance < 0.5) return { text: 'Cerca', color: '#F97316' };
  if (distance < 1) return { text: 'Acercándose', color: '#F59E0B' };
  return null;
}
```

### 4. **Dark Mode Automático**

- Detección automática según sistema operativo
- Paleta de colores adaptada
- Mapa con estilo oscuro personalizado
- Todos los componentes con soporte dark

**Implementación:**
```javascript
const colorScheme = useColorScheme();
const isDark = colorScheme === 'dark';

<View style={[styles.card, isDark && styles.cardDark]}>
```

### 5. **Detección de Zona del Usuario**

- Geolocalización con `expo-location`
- Detección automática de zona/barrio
- Badge "Tu zona" destacado
- Horarios específicos de la zona

**Zonas incluidas:**
- Centro
- Villa San Martín
- Grand Bourg
- Tres Cerritos
- Castañares

**Ubicación:** `src/hooks/useUserLocation.js`

---

## 📁 Estructura del Proyecto
```
colector-app/
├── src/
│   ├── screens/
│   │   ├── MapScreen.js           # Pantalla principal con mapa
│   │   └── ScheduleScreen.js      # Pantalla de horarios
│   ├── components/
│   │   ├── TruckMarker.js         # Marcador de camión (deprecated)
│   │   └── ZoneCard.js            # Card de zona (deprecated)
│   ├── services/
│   │   ├── DataService.js         # ⚡ Abstracción de datos
│   │   ├── SimulatedDataSource.js # Motor de simulación
│   │   └── RealDataSource.js      # (Futuro) Datos reales
│   ├── hooks/
│   │   ├── useTrucks.js           # Hook de camiones
│   │   ├── useUserLocation.js     # Hook de geolocalización
│   │   └── useZones.js            # Hook de zonas
│   ├── data/
│   │   ├── routes.js              # Rutas de Salta Capital
│   │   └── zones.js               # Zonas/barrios de Salta
│   ├── utils/
│   │   └── (vacío por ahora)
│   └── navigation/
│       └── AppNavigator.js        # Navegación por tabs
├── assets/
│   ├── icon.png
│   ├── splash.png
│   ├── adaptive-icon.png
│   └── favicon.png
├── App.js                         # Punto de entrada
├── app.json                       # Configuración Expo
├── package.json
├── eas.json                       # Configuración EAS Build
└── README.md                      # Este archivo
```

---

## 🚀 Instalación y Configuración

### Prerequisitos

- Node.js v18+ instalado
- Expo CLI instalado globalmente
- Celular con Expo Go (Android/iOS)
- GitHub Codespaces (recomendado) o PC local

### Instalación en GitHub Codespaces
```bash
# 1. Clonar repositorio
git clone [URL_DEL_REPO]

# 2. Entrar al directorio
cd colector-app/colector-app

# 3. Instalar dependencias
npm install

# 4. Iniciar Expo con tunnel
npx expo start --tunnel --clear
```

### Instalación Local
```bash
# 1. Clonar repositorio
git clone [URL_DEL_REPO]

# 2. Entrar al directorio
cd colector-app/colector-app

# 3. Instalar dependencias
npm install

# 4. Iniciar Expo
npx expo start
```

### Probar en Celular

1. **Instalar Expo Go** desde Google Play / App Store
2. **Abrir Expo Go** en tu celular
3. **Escanear QR** que aparece en la terminal
4. **Esperar carga** (10-20 segundos)
5. ¡App funcionando!

---

## 🏗️ Arquitectura de Datos

### Patrón de Diseño: Data Access Layer

La app está diseñada para **cambiar fácilmente de datos simulados a datos reales** sin modificar la UI.
```
┌─────────────────────────────────────┐
│   UI Layer (Screens/Components)     │
├─────────────────────────────────────┤
│   Business Logic Layer (Hooks)      │
├─────────────────────────────────────┤
│   Data Access Layer (DataService) ⚡ │ ← CAPA CRÍTICA
├─────────────────────────────────────┤
│   Data Source (Simulated/Real)      │
└─────────────────────────────────────┘
```

### Cambio de Simulación a Datos Reales

**Archivo:** `src/services/DataService.js`
```javascript
class DataService {
  constructor() {
    // 🔄 AQUÍ SE HACE EL SWITCH
    const USE_REAL_DATA = false; // Cambiar a true cuando haya API real
    
    this.dataSource = USE_REAL_DATA 
      ? new RealDataSource()      // Datos de API
      : SimulatedDataSource;       // Datos simulados
  }
}
```

### Modelos de Datos

#### Truck (Camión)
```javascript
{
  id: "truck-001",
  name: "Camión Centro-Norte",
  status: "active",
  currentLocation: {
    latitude: -24.7821,
    longitude: -65.4232,
    timestamp: "2026-03-18T10:30:00Z"
  },
  assignedRoute: "route-centro",
  progress: 45,
  speed: 25,
  completedSegments: [0, 1, 2, 3]
}
```

#### Route (Ruta)
```javascript
{
  id: "route-centro",
  name: "Ruta Centro",
  zone: "Centro",
  coordinates: [
    { latitude: -24.7821, longitude: -65.4232, order: 1 },
    { latitude: -24.7830, longitude: -65.4220, order: 2 }
    // ... más puntos
  ],
  schedule: {
    daysOfWeek: [1,2,3,4,5,6],
    startTime: "06:00",
    endTime: "14:00",
    type: "diurna"
  }
}
```

#### Zone (Zona)
```javascript
{
  id: "zone-centro",
  name: "Centro",
  bounds: {
    northeast: { lat: -24.7750, lng: -65.4050 },
    southwest: { lat: -24.7950, lng: -65.4250 }
  },
  schedules: [
    {
      day: "Lunes a Sábado",
      time: "06:00 - 14:00",
      type: "Recolección diurna"
    }
  ],
  assignedTrucks: ["truck-001"],
  color: "#3B82F6"
}
```

---

## 📱 Pantallas

### 1. MapScreen (Mapa)

**Ruta:** Tab "Mapa" (principal)

**Características:**
- Mapa centrado en Salta Capital
- Marcadores de camiones en tiempo real
- Rutas visualizadas con estados
- Botón "Mi Zona" para centrar en usuario
- Alerta de proximidad cuando camión está cerca
- Detalle de camión seleccionado (ETA, progreso, velocidad)
- Info de zona del usuario

**Archivo:** `src/screens/MapScreen.js`

**Hooks utilizados:**
- `useTrucks()` - Obtener camiones
- `useUserLocation()` - Geolocalización
- `useColorScheme()` - Dark mode

### 2. ScheduleScreen (Horarios)

**Ruta:** Tab "Horarios"

**Características:**
- Lista de todas las zonas de Salta
- Buscador de zonas
- Filtros por tipo (Todas/Diurna/Nocturna)
- Badge "Tu zona" destacado
- Cards con horarios detallados
- Pull to refresh
- Info útil sobre la recolección

**Archivo:** `src/screens/ScheduleScreen.js`

**Hooks utilizados:**
- `useZones()` - Obtener zonas
- `useUserLocation()` - Detectar zona del usuario
- `useColorScheme()` - Dark mode

---

## 🎨 Paleta de Colores

### Colores Principales
```javascript
// Primarios
'#22C55E' // Verde - Camiones activos, botones principales
'#3B82F6' // Azul - Información, zonas

// Secundarios
'#F97316' // Naranja - Alertas, camión seleccionado
'#F59E0B' // Amarillo - Advertencias
'#EF4444' // Rojo - Proximidad crítica

// Neutros (Light Mode)
'#FFFFFF' // Fondo cards
'#F9FAFB' // Fondo general
'#F3F4F6' // Bordes, divisores
'#111827' // Texto principal
'#6B7280' // Texto secundario
'#9CA3AF' // Texto deshabilitado

// Neutros (Dark Mode)
'#111827' // Fondo general
'#1F2937' // Fondo cards
'#374151' // Bordes, divisores
'#F9FAFB' // Texto principal
'#9CA3AF' // Texto secundario
```

---

## 🔄 Próximos Pasos

### Fase 1: Optimización del MVP (1-2 semanas)

- [ ] Mejorar rutas para que sigan calles reales
- [ ] Obtener Google Maps API key
- [ ] Crear build nativo con EAS
- [ ] Testing exhaustivo en diferentes dispositivos
- [ ] Screenshots para presentación

### Fase 2: Funcionalidades Adicionales (2-3 semanas)

- [ ] Panel de administrador básico
- [ ] Notificaciones push
- [ ] Onboarding de 3 pantallas
- [ ] Configuración/Settings
- [ ] Historial de recolecciones

### Fase 3: Integración de Datos Reales (1-2 meses)

- [ ] Crear backend Node.js + Express
- [ ] Base de datos PostgreSQL + PostGIS
- [ ] Implementar `RealDataSource`
- [ ] WebSocket para tiempo real
- [ ] Instalación de GPS en camiones de Agrotécnica Fueguina

### Fase 4: Lanzamiento Piloto (1 mes)

- [ ] Presentación a Municipalidad de Salta
- [ ] Presentación a Agrotécnica Fueguina
- [ ] Lanzamiento en Google Play
- [ ] Testing con 50-100 usuarios beta
- [ ] Recolección de feedback

---

## 🐛 Problemas Conocidos

### 1. Rutas no siguen calles exactas

**Descripción:** Las polylines en el mapa usan coordenadas aproximadas, no siguen el trazado exacto de las calles.

**Solución futura:** 
- Usar Google Directions API para obtener rutas reales
- O recolectar trazas GPS reales de los camiones durante una semana

**Prioridad:** Media

---

### 2. Google Maps requiere API Key para build nativo

**Descripción:** El build APK necesita una Google Maps API key válida.

**Solución:** 
1. Ir a Google Cloud Console
2. Crear proyecto "Colector"
3. Habilitar Maps SDK for Android
4. Generar API key
5. Agregar a `app.json`

**Prioridad:** Alta (para build de producción)

---

### 3. Simulación puede no reflejar horarios reales

**Descripción:** Los horarios y rutas son aproximaciones basadas en información pública.

**Solución:** Validar con Agrotécnica Fueguina los horarios y zonas exactas.

**Prioridad:** Media

---

## 📚 Documentación Adicional

### Documentos del Proyecto

1. **PRD (Product Requirements Document)**
   - Define QUÉ construimos y POR QUÉ
   - Alcance del MVP
   - Métricas de éxito

2. **TDD (Technical Design Document)**
   - Define CÓMO lo construimos
   - Arquitectura de datos
   - Plan de transición simulación→real

3. **Pitch Deck**
   - 10 slides para presentar a autoridades
   - Problema, solución, modelo de negocio
   - Presupuesto estimado ($38K USD)

### Recursos Útiles

- **Expo Documentation:** https://docs.expo.dev
- **React Navigation:** https://reactnavigation.org
- **React Native Maps:** https://github.com/react-native-maps/react-native-maps
- **Expo Location:** https://docs.expo.dev/versions/latest/sdk/location

---

## 🤝 Contribuir

### Proceso de Desarrollo

1. Crear branch desde `main`
2. Hacer cambios
3. Probar en Expo Go
4. Commit con mensaje descriptivo
5. Push y crear Pull Request

### Commits Semánticos
```
feat: Nueva funcionalidad
fix: Corrección de bug
docs: Cambios en documentación
style: Cambios de formato (no afectan lógica)
refactor: Refactorización de código
test: Añadir tests
chore: Cambios en build, dependencias
```

---

## 👨‍💻 Autor

**Abraham Ricardo Tartalos**  
Data Scientist - Salta, Argentina  
📧 [Tu email]  
💼 [LinkedIn](https://linkedin.com/in/abrahamtartalos)  
🌐 [Portfolio](https://abrahamtartalos.onrender.com)

---

## 📄 Licencia

Este proyecto es un MVP para presentación a la Municipalidad de Salta y Agrotécnica Fueguina.

---

## 🙏 Agradecimientos

- Comunidad de Expo y React Native
- Usuarios beta que probaron la app
- Municipalidad de Salta (futuro socio)
- Agrotécnica Fueguina (futuro socio)

---

**Última actualización:** Marzo 2026  
**Versión del README:** 1.0
EOF

echo "✅ README.md creado exitosamente"