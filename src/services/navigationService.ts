import { Platform, Alert, Linking } from 'react-native';
import { UserLocation } from '../types/spacex';

export interface NavigationCoordinates {
  latitude: number;
  longitude: number;
  label?: string;
}

export class NavigationService {
  static async openNativeMaps(
    destination: NavigationCoordinates,
    userLocation?: UserLocation
  ): Promise<void> {
    try {
      let url: string;

      if (Platform.OS === 'ios') {
        // Apple Maps URL scheme
        const params = new URLSearchParams({
          daddr: `${destination.latitude},${destination.longitude}`,
          ...(destination.label && { q: destination.label }),
          ...(userLocation && {
            saddr: `${userLocation.latitude},${userLocation.longitude}`,
          }),
        });
        url = `http://maps.apple.com/?${params}`;
      } else {
        // Google Maps URL scheme for Android
        const params = new URLSearchParams({
          daddr: `${destination.latitude},${destination.longitude}`,
          ...(destination.label && { q: destination.label }),
          ...(userLocation && {
            saddr: `${userLocation.latitude},${userLocation.longitude}`,
          }),
        });
        url = `https://www.google.com/maps/dir/?api=1&${params}`;
      }

      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        throw new Error('Unable to open maps application');
      }
    } catch (error) {
      console.error('Error opening native maps:', error);
      Alert.alert(
        'Navigation Error',
        'Unable to open maps application. Please ensure you have a maps app installed.',
        [{ text: 'OK' }]
      );
    }
  }

  static async openWebMaps(
    destination: NavigationCoordinates,
    userLocation?: UserLocation
  ): Promise<void> {
    try {
      const params = new URLSearchParams({
        daddr: `${destination.latitude},${destination.longitude}`,
        ...(destination.label && { q: destination.label }),
        ...(userLocation && {
          saddr: `${userLocation.latitude},${userLocation.longitude}`,
        }),
      });
      
      const url = `https://www.google.com/maps/dir/?api=1&${params}`;
      
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        throw new Error('Unable to open web maps');
      }
    } catch (error) {
      console.error('Error opening web maps:', error);
      Alert.alert(
        'Navigation Error',
        'Unable to open maps in browser.',
        [{ text: 'OK' }]
      );
    }
  }

  static getMapUrl(
    destination: NavigationCoordinates,
    userLocation?: UserLocation
  ): string {
    const params = new URLSearchParams({
      daddr: `${destination.latitude},${destination.longitude}`,
      ...(destination.label && { q: destination.label }),
      ...(userLocation && {
        saddr: `${userLocation.latitude},${userLocation.longitude}`,
      }),
    });
    
    return `https://www.google.com/maps/dir/?api=1&${params}`;
  }
}