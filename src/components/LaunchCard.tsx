import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ViewStyle,
} from 'react-native';
import { Launch } from '../types/spacex';
import { getLaunchStatus, getMissionImage } from '../utils/launchHelpers';
import { formatLaunchDate, getRelativeTime } from '../utils/dateHelpers';
import { Colors } from '../constants/colors';

interface LaunchCardProps {
  launch: Launch;
  onPress: (launch: Launch) => void;
  style?: ViewStyle;
}

function LaunchCard({ launch, onPress, style }: LaunchCardProps) {
  const status = getLaunchStatus(launch);
  const missionImage = getMissionImage(launch);
  const formattedDate = formatLaunchDate(launch.date_utc);
  const relativeTime = getRelativeTime(launch.date_utc);

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress(launch)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {missionImage ? (
          <Image source={{ uri: missionImage }} style={styles.missionImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>🚀</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.missionName} numberOfLines={2}>
            {launch.name}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Text style={styles.statusText}>{status.label}</Text>
          </View>
        </View>

        <Text style={styles.flightNumber}>
          Flight #{launch.flight_number}
        </Text>

        <View style={styles.dateContainer}>
          <Text style={styles.date}>{formattedDate}</Text>
          <Text style={styles.relativeTime}>{relativeTime}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 120,
    backgroundColor: Colors.primary,
    padding:10
  },
  missionImage: {
    width: '100%',
    height: '100%',
    resizeMode: "contain",
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
  },
  placeholderText: {
    fontSize: 32,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  missionName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: Colors.textInverse,
    fontSize: 12,
    fontWeight: '600',
  },
  flightNumber: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    paddingRight:10,
  },
  relativeTime: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});

export default memo(LaunchCard);