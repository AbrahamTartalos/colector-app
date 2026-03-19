import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  useColorScheme
} from 'react-native';
import { useZones } from '../hooks/useZones';
import { useUserLocation } from '../hooks/useUserLocation';

export default function ScheduleScreen() {
  const { zones, loading, refresh } = useZones();
  const { zone: userZone } = useUserLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const filteredZones = zones.filter(zone => {
    const matchesSearch = zone.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    
    const hasType = zone.schedules.some(s => 
      filterType === 'diurna' 
        ? s.type.includes('diurna') 
        : s.type.includes('nocturna')
    );
    
    return matchesSearch && hasType;
  });

  async function handleRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  if (loading && zones.length === 0) {
    return (
      <View style={[styles.loadingContainer, isDark && styles.loadingContainerDark]}>
        <ActivityIndicator size="large" color="#22C55E" />
        <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
          Cargando horarios...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={[styles.header, isDark && styles.headerDark]}>
        <Text style={[styles.title, isDark && styles.titleDark]}>Horarios</Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          {zones.length} {zones.length === 1 ? 'zona' : 'zonas'} de recolección en Salta
        </Text>
      </View>

      <View style={[styles.searchSection, isDark && styles.searchSectionDark]}>
        <View style={[styles.searchContainer, isDark && styles.searchContainerDark]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, isDark && styles.searchInputDark]}
            placeholder="Buscar por zona o barrio..."
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              isDark && styles.filterChipDark,
              filterType === 'all' && (isDark ? styles.filterChipActiveDark : styles.filterChipActive)
            ]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[
              styles.filterChipText,
              isDark && styles.filterChipTextDark,
              filterType === 'all' && styles.filterChipTextActive
            ]}>
              Todas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              isDark && styles.filterChipDark,
              filterType === 'diurna' && (isDark ? styles.filterChipActiveDark : styles.filterChipActive)
            ]}
            onPress={() => setFilterType('diurna')}
          >
            <Text style={[
              styles.filterChipText,
              isDark && styles.filterChipTextDark,
              filterType === 'diurna' && styles.filterChipTextActive
            ]}>
              ☀️ Diurna
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              isDark && styles.filterChipDark,
              filterType === 'nocturna' && (isDark ? styles.filterChipActiveDark : styles.filterChipActive)
            ]}
            onPress={() => setFilterType('nocturna')}
          >
            <Text style={[
              styles.filterChipText,
              isDark && styles.filterChipTextDark,
              filterType === 'nocturna' && styles.filterChipTextActive
            ]}>
              🌙 Nocturna
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#22C55E"
            colors={['#22C55E']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {userZone && !searchQuery && filterType === 'all' && (
          <View style={styles.userZoneSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                Tu Zona
              </Text>
              <View style={[styles.badge, isDark && styles.badgeDark]}>
                <Text style={styles.badgeText}>📍</Text>
              </View>
            </View>
            <ZoneCard zone={userZone} isUserZone={true} isDark={isDark} />
          </View>
        )}

        {filteredZones.length > 0 ? (
          <View style={styles.allZonesSection}>
            {(!userZone || searchQuery || filterType !== 'all') && (
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                  {searchQuery ? 'Resultados' : filterType === 'all' ? 'Todas las Zonas' : `Servicio ${filterType === 'diurna' ? 'Diurno' : 'Nocturno'}`}
                </Text>
                <View style={[styles.resultCount, isDark && styles.resultCountDark]}>
                  <Text style={[styles.resultCountText, isDark && styles.resultCountTextDark]}>
                    {filteredZones.length}
                  </Text>
                </View>
              </View>
            )}
            
            {filteredZones.map(zone => (
              <ZoneCard
                key={zone.id}
                zone={zone}
                isUserZone={userZone?.id === zone.id}
                isDark={isDark}
              />
            ))}
          </View>
        ) : (
          <View style={[styles.emptyState, isDark && styles.emptyStateDark]}>
            <View style={[styles.emptyIconContainer, isDark && styles.emptyIconContainerDark]}>
              <Text style={styles.emptyIcon}>🔍</Text>
            </View>
            <Text style={[styles.emptyStateTitle, isDark && styles.emptyStateTitleDark]}>
              No se encontraron zonas
            </Text>
            <Text style={[styles.emptyStateText, isDark && styles.emptyStateTextDark]}>
              {searchQuery 
                ? `No hay resultados para "${searchQuery}"`
                : `No hay zonas con servicio ${filterType === 'diurna' ? 'diurno' : 'nocturno'}`
              }
            </Text>
            {(searchQuery || filterType !== 'all') && (
              <TouchableOpacity 
                style={styles.clearFiltersButton}
                onPress={() => {
                  setSearchQuery('');
                  setFilterType('all');
                }}
              >
                <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={[styles.infoCard, isDark && styles.infoCardDark]}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={[styles.infoTitle, isDark && styles.infoTitleDark]}>
              Información útil
            </Text>
          </View>
          <View style={styles.infoList}>
            <InfoItem text="Los horarios pueden variar por condiciones climáticas o feriados" isDark={isDark} />
            <InfoItem text="Recolección diurna: generalmente entre 6:00 y 15:00" isDark={isDark} />
            <InfoItem text="Recolección nocturna: generalmente entre 21:00 y 6:00" isDark={isDark} />
            <InfoItem text="Recomendamos sacar la basura 30 minutos antes del horario" isDark={isDark} />
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

function ZoneCard({ zone, isUserZone, isDark }) {
  return (
    <View style={[
      styles.zoneCard,
      isDark && styles.zoneCardDark,
      isUserZone && styles.zoneCardHighlighted
    ]}>
      <View style={styles.zoneCardHeader}>
        <View style={[styles.zoneColorBar, { backgroundColor: zone.color }]} />
        <View style={styles.zoneCardHeaderContent}>
          <View style={styles.zoneTitleRow}>
            <Text style={[styles.zoneCardTitle, isDark && styles.zoneCardTitleDark]}>
              {zone.name}
            </Text>
            {isUserZone && (
              <View style={styles.userBadge}>
                <Text style={styles.userBadgeText}>Tu zona</Text>
              </View>
            )}
          </View>
          <View style={styles.truckInfo}>
            <Text style={styles.truckInfoIcon}>🚛</Text>
            <Text style={[styles.truckInfoText, isDark && styles.truckInfoTextDark]}>
              {zone.assignedTrucks.length} {zone.assignedTrucks.length === 1 ? 'camión asignado' : 'camiones asignados'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.scheduleSection}>
        {zone.schedules.map((schedule, index) => (
          <View key={index} style={[styles.scheduleCard, isDark && styles.scheduleCardDark]}>
            <View style={[styles.scheduleTypeIcon, {
              backgroundColor: schedule.type.includes('nocturna') 
                ? (isDark ? '#1E3A8A' : '#EFF6FF')
                : (isDark ? '#854D0E' : '#FEF3C7')
            }]}>
              <Text style={styles.scheduleTypeEmoji}>
                {schedule.type.includes('nocturna') ? '🌙' : '☀️'}
              </Text>
            </View>
            <View style={styles.scheduleDetails}>
              <Text style={[styles.scheduleType, isDark && styles.scheduleTypeDark]}>
                {schedule.type}
              </Text>
              <Text style={[styles.scheduleDays, isDark && styles.scheduleDaysDark]}>
                {schedule.day}
              </Text>
              <View style={[styles.scheduleTimeRow, isDark && styles.scheduleTimeRowDark]}>
                <Text style={styles.scheduleTimeIcon}>🕐</Text>
                <Text style={[styles.scheduleTime, isDark && styles.scheduleTimeDark]}>
                  {schedule.time}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function InfoItem({ text, isDark }) {
  return (
    <View style={styles.infoItem}>
      <View style={[styles.infoBullet, isDark && styles.infoBulletDark]} />
      <Text style={[styles.infoItemText, isDark && styles.infoItemTextDark]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  containerDark: { backgroundColor: '#111827' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loadingContainerDark: { backgroundColor: '#111827' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6B7280', fontWeight: '500' },
  loadingTextDark: { color: '#9CA3AF' },
  
  header: { backgroundColor: '#FFFFFF', paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerDark: { backgroundColor: '#1F2937', borderBottomColor: '#374151' },
  title: { fontSize: 32, fontWeight: '700', color: '#111827', marginBottom: 8 },
  titleDark: { color: '#F9FAFB' },
  subtitle: { fontSize: 15, color: '#6B7280', fontWeight: '500' },
  subtitleDark: { color: '#9CA3AF' },
  
  searchSection: { backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  searchSectionDark: { backgroundColor: '#1F2937', borderBottomColor: '#374151' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 2, borderColor: '#F3F4F6' },
  searchContainerDark: { backgroundColor: '#374151', borderColor: '#4B5563' },
  searchIcon: { fontSize: 18, marginRight: 12 },
  searchInput: { flex: 1, fontSize: 16, color: '#111827', padding: 0, fontWeight: '500' },
  searchInputDark: { color: '#F9FAFB' },
  clearIcon: { fontSize: 18, color: '#9CA3AF', padding: 4 },
  filterRow: { flexDirection: 'row', marginTop: 16, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F3F4F6', borderWidth: 2, borderColor: '#F3F4F6' },
  filterChipDark: { backgroundColor: '#374151', borderColor: '#374151' },
  filterChipActive: { backgroundColor: '#F0FDF4', borderColor: '#22C55E' },
  filterChipActiveDark: { backgroundColor: '#064E3B', borderColor: '#22C55E' },
  filterChipText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  filterChipTextDark: { color: '#9CA3AF' },
  filterChipTextActive: { color: '#15803D' },
  
  scrollView: { flex: 1 },
  scrollContent: { padding: 24 },
  
  userZoneSection: { marginBottom: 32 },
  allZonesSection: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  sectionTitleDark: { color: '#F9FAFB' },
  badge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center' },
  badgeDark: { backgroundColor: '#064E3B' },
  badgeText: { fontSize: 16 },
  resultCount: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  resultCountDark: { backgroundColor: '#374151' },
  resultCountText: { fontSize: 14, fontWeight: '700', color: '#6B7280' },
  resultCountTextDark: { color: '#9CA3AF' },
  
  zoneCard: { backgroundColor: '#FFFFFF', borderRadius: 20, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, borderWidth: 2, borderColor: '#FFFFFF' },
  zoneCardDark: { backgroundColor: '#1F2937', borderColor: '#1F2937' },
  zoneCardHighlighted: { borderColor: '#22C55E', shadowColor: '#22C55E', shadowOpacity: 0.15, elevation: 4 },
  zoneCardHeader: { flexDirection: 'row', padding: 20 },
  zoneColorBar: { width: 4, borderRadius: 2, marginRight: 16 },
  zoneCardHeaderContent: { flex: 1 },
  zoneTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  zoneCardTitle: { fontSize: 18, fontWeight: '700', color: '#111827', flex: 1 },
  zoneCardTitleDark: { color: '#F9FAFB' },
  userBadge: { backgroundColor: '#22C55E', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  userBadgeText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  truckInfo: { flexDirection: 'row', alignItems: 'center' },
  truckInfoIcon: { fontSize: 14, marginRight: 6 },
  truckInfoText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  truckInfoTextDark: { color: '#9CA3AF' },
  
  scheduleSection: { paddingHorizontal: 20, paddingBottom: 20, gap: 12 },
  scheduleCard: { flexDirection: 'row', backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16, alignItems: 'flex-start' },
  scheduleCardDark: { backgroundColor: '#374151' },
  scheduleTypeIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  scheduleTypeEmoji: { fontSize: 22 },
  scheduleDetails: { flex: 1 },
  scheduleType: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 4 },
  scheduleTypeDark: { color: '#F9FAFB' },
  scheduleDays: { fontSize: 13, color: '#6B7280', fontWeight: '500', marginBottom: 8 },
  scheduleDaysDark: { color: '#9CA3AF' },
  scheduleTimeRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
  scheduleTimeRowDark: { backgroundColor: '#1F2937' },
  scheduleTimeIcon: { fontSize: 14, marginRight: 6 },
  scheduleTime: { fontSize: 14, fontWeight: '700', color: '#111827' },
  scheduleTimeDark: { color: '#F9FAFB' },
  
  emptyState: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 48, alignItems: 'center', marginTop: 32, borderWidth: 2, borderColor: '#F3F4F6', borderStyle: 'dashed' },
  emptyStateDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
  emptyIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyIconContainerDark: { backgroundColor: '#374151' },
  emptyIcon: { fontSize: 40 },
  emptyStateTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8, textAlign: 'center' },
  emptyStateTitleDark: { color: '#F9FAFB' },
  emptyStateText: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  emptyStateTextDark: { color: '#9CA3AF' },
  clearFiltersButton: { backgroundColor: '#22C55E', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  clearFiltersText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  
  infoCard: { backgroundColor: '#EFF6FF', borderRadius: 20, padding: 20, marginTop: 24, borderWidth: 1, borderColor: '#DBEAFE' },
  infoCardDark: { backgroundColor: '#1E3A8A', borderColor: '#1E40AF' },
  infoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  infoIcon: { fontSize: 24, marginRight: 12 },
  infoTitle: { fontSize: 16, fontWeight: '700', color: '#1E40AF' },
  infoTitleDark: { color: '#DBEAFE' },
  infoList: { gap: 12 },
  infoItem: { flexDirection: 'row', alignItems: 'flex-start' },
  infoBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3B82F6', marginTop: 6, marginRight: 12 },
  infoBulletDark: { backgroundColor: '#60A5FA' },
  infoItemText: { flex: 1, fontSize: 14, color: '#1E40AF', lineHeight: 20, fontWeight: '500' },
  infoItemTextDark: { color: '#DBEAFE' },
  
  bottomPadding: { height: 40 }
});
