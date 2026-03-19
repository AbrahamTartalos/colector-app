// src/components/TruckMarker.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';

export default function TruckMarker({ truck, onPress }) {
  return (
    <Marker
      coordinate={{
        latitude: truck.currentLocation.latitude,
        longitude: truck.currentLocation.longitude
      }}
      onPress={() => onPress && onPress(truck)}
      tracksViewChanges={false} // Optimización de performance
    >
      <View style={styles.markerContainer}>
        <View style={[styles.marker, { 
          backgroundColor: truck.status === 'active' ? '#22C55E' : '#9CA3AF' 
        }]}>
          <Text style={styles.markerText}>🚛</Text>
        </View>
        {truck.progress > 0 && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${truck.progress}%` }]} />
          </View>
        )}
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center'
  },
  marker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  markerText: {
    fontSize: 20
  },
  progressBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 2
  }
});