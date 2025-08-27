import * as Location from 'expo-location';
import { UserLocation } from '../types/spacex';

export enum LocationPermissionStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  NOT_DETERMINED = 'undetermined',
}

export interface LocationServiceResult {
  status: LocationPermissionStatus;
  location?: UserLocation;
  error?: string;
}

export class LocationService {
  static async requestLocationPermission(): Promise<LocationPermissionStatus> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      switch (status) {
        case Location.PermissionStatus.GRANTED:
          return LocationPermissionStatus.GRANTED;
        case Location.PermissionStatus.DENIED:
          return LocationPermissionStatus.DENIED;
        default:
          return LocationPermissionStatus.NOT_DETERMINED;
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return LocationPermissionStatus.DENIED;
    }
  }

  static async getCurrentLocation(): Promise<LocationServiceResult> {
    try {
      // Check current permission status
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== Location.PermissionStatus.GRANTED) {
        // Try to request permission
        const permissionResult = await this.requestLocationPermission();
        
        if (permissionResult !== LocationPermissionStatus.GRANTED) {
          return {
            status: permissionResult,
            error: 'Location permission not granted',
          };
        }
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      return {
        status: LocationPermissionStatus.GRANTED,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy || undefined,
        },
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return {
        status: LocationPermissionStatus.DENIED,
        error: error instanceof Error ? error.message : 'Unknown location error',
      };
    }
  }

  static async checkLocationPermission(): Promise<LocationPermissionStatus> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      
      switch (status) {
        case Location.PermissionStatus.GRANTED:
          return LocationPermissionStatus.GRANTED;
        case Location.PermissionStatus.DENIED:
          return LocationPermissionStatus.DENIED;
        default:
          return LocationPermissionStatus.NOT_DETERMINED;
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      return LocationPermissionStatus.DENIED;
    }
  }
}