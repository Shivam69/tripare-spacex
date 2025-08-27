import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { RootStackParamList } from '../navigation/types';
import { Launchpad, UserLocation } from '../types/spacex';
import { SpaceXApi, SpaceXApiError } from '../services/spacexApi';
import {
  LocationService,
  LocationPermissionStatus,
} from '../services/locationService';
import { NavigationService } from '../services/navigationService';
import { getLaunchStatus, getMissionImage, getMissionDescription } from '../utils/launchHelpers';
import { formatLaunchDate } from '../utils/dateHelpers';
import { calculateDistance, formatDistance } from '../utils/distance';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { Colors } from '../constants/colors';

type Props = StackScreenProps<RootStackParamList, 'LaunchDetails'>;

function LaunchDetailsScreen({ route }: Props) {
  const { launch } = route.params;
  const [launchpad, setLaunchpad] = useState<Launchpad | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loadingLaunchpad, setLoadingLaunchpad] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [launchpadError, setLaunchpadError] = useState<string | null>(null);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<
    LocationPermissionStatus
  >(LocationPermissionStatus.NOT_DETERMINED);

  // Memoize expensive calculations to prevent unnecessary recalculations
  const status = useMemo(() => getLaunchStatus(launch), [launch]);
  const isIOS = useMemo(() => Platform.OS === 'ios', []);
  const missionImage = useMemo(() => getMissionImage(launch), [launch]);
  const missionDescription = useMemo(() => getMissionDescription(launch), [launch]);
  const formattedDate = useMemo(() => formatLaunchDate(launch.date_utc), [launch.date_utc]);

  const loadLaunchpad = useCallback(async () => {
    try {
      setLoadingLaunchpad(true);
      setLaunchpadError(null);

      const launchpadData = await SpaceXApi.getLaunchpad(launch.launchpad);
      setLaunchpad(launchpadData);
    } catch (err) {
      console.error('Error loading launchpad:', err);
      setLaunchpadError(
        err instanceof SpaceXApiError
          ? err.message
          : 'Failed to load launchpad information.'
      );
    } finally {
      setLoadingLaunchpad(false);
    }
  }, [launch.launchpad]);

  const requestLocation = useCallback(async () => {
    try {
      setLoadingLocation(true);

      const result = await LocationService.getCurrentLocation();
      setLocationPermissionStatus(result.status);

      if (result.location) {
        setUserLocation(result.location);
      } else if (result.error) {
        console.warn('Location error:', result.error);
      }
    } catch (err) {
      console.error('Error requesting location:', err);
    } finally {
      setLoadingLocation(false);
    }
  }, []);

  const handleLocationPermissionPrompt = useCallback(() => {
    Alert.alert(
      'Location Permission',
      'To show your location on the map and calculate distance to the launchpad, we need access to your location.',
      [
        { text: 'Not Now', style: 'cancel' },
        { text: 'Allow', onPress: requestLocation },
      ]
    );
  }, [requestLocation]);

  const handleOpenMaps = useCallback(() => {
    if (!launchpad) return;

    NavigationService.openNativeMaps(
      {
        latitude: launchpad.latitude,
        longitude: launchpad.longitude,
        label: launchpad.full_name,
      },
      userLocation || undefined
    );
  }, [launchpad, userLocation]);

  const handleOpenWebcast = useCallback(() => {
    if (launch.links.webcast) {
      Linking.openURL(launch.links.webcast);
    }
  }, [launch.links.webcast]);

  useEffect(() => {
    loadLaunchpad();
  }, [loadLaunchpad]);

  useEffect(() => {
    const checkLocationPermission = async () => {
      const status = await LocationService.checkLocationPermission();
      setLocationPermissionStatus(status);

      if (status === LocationPermissionStatus.GRANTED) {
        requestLocation();
      }
    };

    checkLocationPermission();
  }, [requestLocation]);

  // Memoize distance calculation to prevent recalculation on every render
  const distance = useMemo(() => {
    return launchpad && userLocation
      ? calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          launchpad.latitude,
          launchpad.longitude
        )
      : null;
  }, [launchpad, userLocation]);

  // Memoize success rate calculation
  const successRate = useMemo(() => {
    if (!launchpad || launchpad.launch_attempts === 0) return 0;
    return Math.round((launchpad.launch_successes / launchpad.launch_attempts) * 100);
  }, [launchpad]);

  // Memoize map initial region to prevent recalculation
  const mapInitialRegion = useMemo(() => {
    if (!launchpad) return undefined;
    return {
      latitude: launchpad.latitude,
      longitude: launchpad.longitude,
      latitudeDelta: userLocation ? 2 : 0.5,
      longitudeDelta: userLocation ? 2 : 0.5,
    };
  }, [launchpad, userLocation]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Mission Header */}
      <View style={styles.headerContainer}>
        {missionImage && (
          <Image source={{ uri: missionImage }} style={styles.missionImage} />
        )}
        <View style={styles.headerContent}>
          <Text style={styles.missionName}>{launch.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Text style={styles.statusText}>{status.label}</Text>
          </View>
        </View>
      </View>

      {/* Mission Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mission Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Flight Number:</Text>
          <Text style={styles.detailValue}>#{launch.flight_number}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Launch Date:</Text>
          <Text style={[styles.detailValue, isIOS ? styles.detailValueIOS : styles.detailValueAndroid]}>{formattedDate}</Text>
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{missionDescription}</Text>
        </View>
        {launch.links.webcast && (
          <TouchableOpacity style={styles.webcastButton} onPress={handleOpenWebcast}>
            <Text style={styles.webcastButtonText}>Watch Webcast</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Launchpad Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Launchpad</Text>
        
        {loadingLaunchpad && <LoadingState message="Loading launchpad..." />}
        
        {launchpadError && (
          <ErrorState
            message={launchpadError}
            onRetry={loadLaunchpad}
          />
        )}
        
        {launchpad && (
          <>
            <View style={styles.launchpadInfo}>
              <Text style={styles.launchpadName}>{launchpad.full_name}</Text>
              <Text style={styles.launchpadLocation}>
                {launchpad.locality}, {launchpad.region}
              </Text>
              <Text style={styles.launchpadDetails}>{launchpad.details}</Text>
              
              <View style={styles.launchpadStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{launchpad.launch_attempts}</Text>
                  <Text style={styles.statLabel}>Total Launches</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{launchpad.launch_successes}</Text>
                  <Text style={styles.statLabel}>Successful</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{successRate}%</Text>
                  <Text style={styles.statLabel}>Success Rate</Text>
                </View>
              </View>
              
              {distance && (
                <View style={styles.distanceContainer}>
                  <Text style={styles.distanceText}>
                    📍 {formatDistance(distance)} from your location
                  </Text>
                </View>
              )}
            </View>

            {/* Map */}
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={mapInitialRegion}
                showsUserLocation={!!userLocation}
                showsMyLocationButton={false}
              >
                <Marker
                  coordinate={{
                    latitude: launchpad.latitude,
                    longitude: launchpad.longitude,
                  }}
                  title={launchpad.full_name}
                  description={`${launchpad.locality}, ${launchpad.region}`}
                  pinColor={Colors.error}
                />
              </MapView>
              
              <View style={styles.mapOverlay}>
                {locationPermissionStatus !== LocationPermissionStatus.GRANTED && (
                  <TouchableOpacity
                    style={styles.locationButton}
                    onPress={handleLocationPermissionPrompt}
                    disabled={loadingLocation}
                  >
                    <Text style={styles.locationButtonText}>
                      {loadingLocation ? 'Getting Location...' : 'Show My Location'}
                    </Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity style={styles.directionsButton} onPress={handleOpenMaps}>
                  <Text style={styles.directionsButtonText}>Get Directions</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(LaunchDetailsScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    backgroundColor: Colors.backgroundAccent,
    marginBottom: 20,
    padding: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  missionImage: {
    width: '100%',
    height: 220,
    resizeMode: 'contain',
    borderRadius: 12,
  },
  headerContent: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  missionName: {
    flex: 1,
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginRight: 16,
    lineHeight: 32,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: Colors.surface,
    marginBottom: 20,
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 20,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  detailValueIOS: {
    width: '80%',
    marginLeft: '5%',
    top: 5,
  },
  detailValueAndroid: {
    width: '80%',
    marginLeft: '12%',
  },
  descriptionContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  webcastButton: {
    backgroundColor: Colors.interactive,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginTop: 20,
    alignSelf: 'flex-start',
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  webcastButtonText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  launchpadInfo: {
    marginBottom: 20,
  },
  launchpadName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  launchpadLocation: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  launchpadDetails: {
    fontSize: 16,
    lineHeight: 22,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  launchpadStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.interactive,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  distanceContainer: {
    backgroundColor: Colors.primarySoft,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  distanceText: {
    fontSize: 16,
    color: Colors.primary,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  mapContainer: {
    height: 320,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationButton: {
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationButtonText: {
    color: Colors.interactive,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  directionsButton: {
    backgroundColor: Colors.interactive,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  directionsButtonText: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});