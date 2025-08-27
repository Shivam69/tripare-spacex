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
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  imageContainer: {
    height: 140,
    backgroundColor: Colors.backgroundAccent,
    padding: 16,
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
    borderRadius: 8,
  },
  placeholderText: {
    fontSize: 36,
    opacity: 0.7,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  missionName: {
    flex: 1,
    fontSize: 19,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: 12,
    lineHeight: 24,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    color: Colors.textInverse,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  flightNumber: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginBottom: 12,
    fontWeight: '500',
  },
  dateContainer: {
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    paddingRight: 10,
    fontWeight: '600',
  },
  relativeTime: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default memo(LaunchCard);