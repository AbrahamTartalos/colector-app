import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, useColorScheme } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useTrucks } from '../hooks/useTrucks';
import { useUserLocation } from '../hooks/useUserLocation';
import DataService from '../services/DataService';

const SALTA_CENTER = {
  latitude: -24.7821,
  longitude: -65.4232,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05
};

export default function MapScreen() {
  const mapRef = useRef(null);
  const { trucks, loading, activeTrucks } = useTrucks();
  const { location, zone, hasPermission } = useUserLocation();
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [nearestTruck, setNearestTruck] = useState(null);
  const [eta, setEta] = useState(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadRoutes();
  }, []);

  useEffect(() => {
    if (location && activeTrucks.length > 0) {
      calculateNearestAndETA();
    }
  }, [location, activeTrucks]);

  async function loadRoutes() {
    const routesData = await DataService.getRoutes();
    setRoutes(routesData);
  }

  async function calculateNearestAndETA() {
    if (!location) return;
    
    const nearest = await DataService.getNearestTruck(location);
    setNearestTruck(nearest);
    
    if (nearest) {
      const etaMinutes = (nearest.distanceKm / (nearest.speed / 60)).toFixed(0);
      setEta(etaMinutes);
    }
  }

  function handleMyZone() {
    if (!hasPermission) {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tu ubicación.');
      return;
    }
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02
      }, 1000);
    }
  }

  function getProximityStatus(distance) {
    if (!distance) return null;
    const km = distance;
    
    if (km < 0.2) return { text: '¡Muy cerca!', color: '#EF4444', icon: '🔴' };
    if (km < 0.5) return { text: 'Cerca', color: '#F97316', icon: '🟠' };
    if (km < 1) return { text: 'Acercándose', color: '#F59E0B', icon: '🟡' };
    return null;
  }

  function formatETA(minutes) {
    if (minutes < 1) return 'Menos de 1 min';
    if (minutes < 60) return `~${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `~${hours}h ${mins}m`;
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, isDark && styles.loadingContainerDark]}>
        <ActivityIndicator size="large" color="#22C55E" />
        <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
          Cargando mapa...
        </Text>
      </View>
    );
  }

  const proximityStatus = nearestTruck ? getProximityStatus(nearestTruck.distanceKm) : null;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={SALTA_CENTER}
        showsUserLocation={hasPermission}
        showsMyLocationButton={false}
      >
        {/* Rutas con estados */}
        {routes.map(route => {
          const truck = activeTrucks.find(t => t.assignedRoute === route.id);
          const completedSegments = truck?.completedSegments || [];
          
          return (
            <React.Fragment key={route.id}>
              {/* Ruta pendiente (azul claro) */}
              <Polyline
                coordinates={route.coordinates.map(c => ({
                  latitude: c.latitude,
                  longitude: c.longitude
                }))}
                strokeColor={isDark ? '#60A5FA' : '#93C5FD'}
                strokeWidth={4}
                lineDashPattern={[10, 5]}
              />
              
              {/* Ruta completada (verde) */}
              {completedSegments.length > 1 && (
                <Polyline
                  coordinates={route.coordinates
                    .slice(0, completedSegments.length + 1)
                    .map(c => ({
                      latitude: c.latitude,
                      longitude: c.longitude
                    }))}
                  strokeColor="#22C55E"
                  strokeWidth={6}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* Marcadores de camiones */}
        {activeTrucks.map(truck => {
          const isNearest = nearestTruck?.id === truck.id;
          const isSelected = selectedTruck?.id === truck.id;
          
          return (
            <Marker
              key={truck.id}
              coordinate={{
                latitude: truck.currentLocation.latitude,
                longitude: truck.currentLocation.longitude
              }}
              onPress={() => setSelectedTruck(truck)}
            >
              <View style={styles.markerContainer}>
                <View style={[
                  styles.marker,
                  { backgroundColor: isSelected ? '#F97316' : isNearest && proximityStatus ? proximityStatus.color : '#22C55E' }
                ]}>
                  <Text style={styles.markerText}>🚛</Text>
                </View>
                {truck.progress > 0 && (
                  <View style={styles.progressIndicator}>
                    <View style={[styles.progressFill, { width: `${truck.progress}%` }]} />
                  </View>
                )}
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Header */}
      <View style={[styles.headerCompact, isDark && styles.headerCompactDark]}>
        <View style={[styles.headerLeft, isDark && styles.headerLeftDark]}>
          <Text style={[styles.appTitle, isDark && styles.appTitleDark]}>Colector</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.pulseDot} />
            <Text style={styles.liveText}>En vivo</Text>
          </View>
        </View>
        <View style={styles.truckCounter}>
          <Text style={styles.truckCountNumber}>{activeTrucks.length}</Text>
          <Text style={styles.truckCountLabel}>camiones</Text>
        </View>
      </View>

      {/* Botón Mi Zona */}
      <TouchableOpacity 
        style={[styles.myZoneButton, isDark && styles.myZoneButtonDark]} 
        onPress={handleMyZone}
      >
        <View style={styles.myZoneIconContainer}>
          <Text style={styles.myZoneIcon}>📍</Text>
        </View>
        <Text style={styles.myZoneText}>Mi Zona</Text>
      </TouchableOpacity>

      {/* Alerta de proximidad */}
      {proximityStatus && !selectedTruck && (
        <View style={[styles.proximityAlert, { backgroundColor: proximityStatus.color }]}>
          <Text style={styles.proximityIcon}>{proximityStatus.icon}</Text>
          <View style={styles.proximityContent}>
            <Text style={styles.proximityTitle}>{proximityStatus.text}</Text>
            <Text style={styles.proximitySubtitle}>
              {nearestTruck.name} • ETA: {formatETA(eta)}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.proximityButton}
            onPress={() => setSelectedTruck(nearestTruck)}
          >
            <Text style={styles.proximityButtonText}>Ver</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Info de zona */}
      {zone && !selectedTruck && !proximityStatus && (
        <View style={[styles.zoneCard, isDark && styles.zoneCardDark]}>
          <View style={styles.zoneHeader}>
            <View style={[styles.zoneBadge, { backgroundColor: zone.color + '20' }]}>
              <View style={[styles.zoneColorDot, { backgroundColor: zone.color }]} />
              <Text style={[styles.zoneName, { color: isDark ? '#FFFFFF' : zone.color }]}>
                {zone.name}
              </Text>
            </View>
          </View>
          <View style={styles.scheduleList}>
            {zone.schedules.map((s, i) => (
              <View key={i} style={styles.scheduleItem}>
                <View style={styles.scheduleIcon}>
                  <Text style={styles.scheduleEmoji}>
                    {s.type.includes('nocturna') ? '🌙' : '☀️'}
                  </Text>
                </View>
                <View style={styles.scheduleContent}>
                  <Text style={[styles.scheduleDay, isDark && styles.scheduleDayDark]}>
                    {s.day}
                  </Text>
                  <Text style={[styles.scheduleTime, isDark && styles.scheduleTimeDark]}>
                    {s.time}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Detalle de camión */}
      {selectedTruck && (
        <View style={[styles.truckDetailCard, isDark && styles.truckDetailCardDark]}>
          <TouchableOpacity 
            style={styles.closeBtn} 
            onPress={() => setSelectedTruck(null)}
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          
          <View style={styles.truckHeader}>
            <View style={[styles.truckIconLarge, isDark && styles.truckIconLargeDark]}>
              <Text style={styles.truckIconText}>🚛</Text>
            </View>
            <View style={styles.truckHeaderInfo}>
              <Text style={[styles.truckTitle, isDark && styles.truckTitleDark]}>
                {selectedTruck.name}
              </Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDotLarge, { 
                  backgroundColor: selectedTruck.status === 'active' ? '#22C55E' : '#9CA3AF' 
                }]} />
                <Text style={[styles.statusLabel, isDark && styles.statusLabelDark]}>
                  {selectedTruck.status === 'active' ? 'En servicio' : 'Fuera de servicio'}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.divider, isDark && styles.dividerDark]} />

          <View style={styles.metricsGrid}>
            <View style={[styles.metricItem, isDark && styles.metricItemDark]}>
              <Text style={[styles.metricLabel, isDark && styles.metricLabelDark]}>
                Progreso
              </Text>
              <Text style={[styles.metricValue, isDark && styles.metricValueDark]}>
                {selectedTruck.progress}%
              </Text>
            </View>
            <View style={[styles.metricItem, isDark && styles.metricItemDark]}>
              <Text style={[styles.metricLabel, isDark && styles.metricLabelDark]}>
                Velocidad
              </Text>
              <Text style={[styles.metricValue, isDark && styles.metricValueDark]}>
                {selectedTruck.speed} km/h
              </Text>
            </View>
            {location && selectedTruck.id === nearestTruck?.id && (
              <View style={[styles.metricItem, isDark && styles.metricItemDark]}>
                <Text style={[styles.metricLabel, isDark && styles.metricLabelDark]}>
                  ETA
                </Text>
                <Text style={[styles.metricValue, isDark && styles.metricValueDark]}>
                  {eta} min
                </Text>
              </View>
            )}
          </View>

          <View style={styles.progressBarContainer}>
            <Text style={[styles.progressLabel, isDark && styles.progressLabelDark]}>
              Ruta completada
            </Text>
            <View style={[styles.progressBarTrack, isDark && styles.progressBarTrackDark]}>
              <View style={[styles.progressBarFill, { width: `${selectedTruck.progress}%` }]} />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loadingContainerDark: { backgroundColor: '#111827' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6B7280', fontWeight: '500' },
  loadingTextDark: { color: '#9CA3AF' },
  
  headerCompact: { position: 'absolute', top: 50, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerCompactDark: {},
  headerLeft: { backgroundColor: '#FFFFFF', borderRadius: 20, paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  headerLeftDark: { backgroundColor: '#1F2937' },
  appTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginRight: 12 },
  appTitleDark: { color: '#F9FAFB' },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E', marginRight: 6 },
  liveText: { fontSize: 12, fontWeight: '600', color: '#15803D' },
  truckCounter: { backgroundColor: '#22C55E', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16, alignItems: 'center', minWidth: 80, shadowColor: '#22C55E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  truckCountNumber: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  truckCountLabel: { fontSize: 11, fontWeight: '600', color: '#FFFFFF', opacity: 0.9 },
  
  markerContainer: { alignItems: 'center', justifyContent: 'center' },
  marker: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 8 },
  markerText: { fontSize: 22 },
  progressIndicator: { width: 44, height: 4, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 2 },
  
  myZoneButton: { position: 'absolute', bottom: 100, right: 20, backgroundColor: '#FFFFFF', borderRadius: 24, paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 6, borderWidth: 2, borderColor: '#22C55E' },
  myZoneButtonDark: { backgroundColor: '#1F2937' },
  myZoneIconContainer: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  myZoneIcon: { fontSize: 16 },
  myZoneText: { color: '#22C55E', fontSize: 15, fontWeight: '700' },
  
  proximityAlert: { position: 'absolute', top: 130, left: 20, right: 20, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6 },
  proximityIcon: { fontSize: 28, marginRight: 12 },
  proximityContent: { flex: 1 },
  proximityTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
  proximitySubtitle: { fontSize: 13, color: '#FFFFFF', opacity: 0.9, fontWeight: '500' },
  proximityButton: { backgroundColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  proximityButtonText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  
  zoneCard: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 8 },
  zoneCardDark: { backgroundColor: '#1F2937' },
  zoneHeader: { marginBottom: 16 },
  zoneBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, alignSelf: 'flex-start' },
  zoneColorDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  zoneName: { fontSize: 16, fontWeight: '700' },
  scheduleList: { gap: 12 },
  scheduleItem: { flexDirection: 'row', alignItems: 'center' },
  scheduleIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  scheduleEmoji: { fontSize: 18 },
  scheduleContent: { flex: 1 },
  scheduleDay: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 2 },
  scheduleDayDark: { color: '#F9FAFB' },
  scheduleTime: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  scheduleTimeDark: { color: '#9CA3AF' },
  
  truckDetailCard: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  truckDetailCardDark: { backgroundColor: '#1F2937' },
  closeBtn: { position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  closeBtnText: { fontSize: 20, color: '#6B7280', fontWeight: '600' },
  truckHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  truckIconLarge: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  truckIconLargeDark: { backgroundColor: '#374151' },
  truckIconText: { fontSize: 28 },
  truckHeaderInfo: { flex: 1 },
  truckTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 6 },
  truckTitleDark: { color: '#F9FAFB' },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusDotLarge: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  statusLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  statusLabelDark: { color: '#9CA3AF' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 20 },
  dividerDark: { backgroundColor: '#374151' },
  metricsGrid: { flexDirection: 'row', marginBottom: 20, gap: 12 },
  metricItem: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, alignItems: 'center' },
  metricItemDark: { backgroundColor: '#374151' },
  metricLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginBottom: 6, textAlign: 'center' },
  metricLabelDark: { color: '#9CA3AF' },
  metricValue: { fontSize: 18, color: '#111827', fontWeight: '700' },
  metricValueDark: { color: '#F9FAFB' },
  progressBarContainer: { gap: 8 },
  progressLabel: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  progressLabelDark: { color: '#9CA3AF' },
  progressBarTrack: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' },
  progressBarTrackDark: { backgroundColor: '#374151' },
  progressBarFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 4 }
});
