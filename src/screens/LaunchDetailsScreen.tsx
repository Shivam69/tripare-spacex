import React, { useState, useEffect, useCallback } from 'react';
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

export default function LaunchDetailsScreen({ route }: Props) {
  const { launch } = route.params;
  const [launchpad, setLaunchpad] = useState<Launchpad | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loadingLaunchpad, setLoadingLaunchpad] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [launchpadError, setLaunchpadError] = useState<string | null>(null);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<
    LocationPermissionStatus
  >(LocationPermissionStatus.NOT_DETERMINED);

  const status = getLaunchStatus(launch);
  const isIOS = Platform.OS === 'ios';
  const missionImage = getMissionImage(launch);
  const missionDescription = getMissionDescription(launch);
  const formattedDate = formatLaunchDate(launch.date_utc);

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

  const distance =
    launchpad && userLocation
      ? calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          launchpad.latitude,
          launchpad.longitude
        )
      : null;

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
          <Text style={[styles.detailValue,{width:isIOS ? "80%" : "100%",marginLeft:isIOS ? "15%" : 10,top:isIOS ? 5 : 0}]}>{formattedDate}</Text>
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
                  <Text style={styles.statValue}>
                    {launchpad.launch_attempts > 0
                      ? Math.round((launchpad.launch_successes / launchpad.launch_attempts) * 100)
                      : 0}%
                  </Text>
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
                initialRegion={{
                  latitude: launchpad.latitude,
                  longitude: launchpad.longitude,
                  latitudeDelta: userLocation ? 2 : 0.5,
                  longitudeDelta: userLocation ? 2 : 0.5,
                }}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    backgroundColor: Colors.primaryDark,
    marginBottom: 16,
    padding:10
  },
  missionImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  headerContent: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  missionName: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: Colors.surface,
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
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
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  webcastButtonText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: '600',
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
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  distanceContainer: {
    backgroundColor: Colors.primaryLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  distanceText: {
    fontSize: 16,
    color: Colors.primaryDark,
    textAlign: 'center',
    fontWeight: '500',
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  directionsButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  directionsButtonText: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: '600',
  },
});