import { Launch, LaunchStatus } from '../types/spacex';
import { Colors } from '../constants/colors';

export function getLaunchStatus(launch: Launch): LaunchStatus {
  if (launch.upcoming) {
    return {
      isSuccess: false,
      isUpcoming: true,
      label: 'Upcoming',
      color: Colors.statusActive,
    };
  }

  if (launch.success === true) {
    return {
      isSuccess: true,
      isUpcoming: false,
      label: 'Success',
      color: Colors.statusSuccess,
    };
  }

  if (launch.success === false) {
    return {
      isSuccess: false,
      isUpcoming: false,
      label: 'Failed',
      color: Colors.statusFailure,
    };
  }

  return {
    isSuccess: false,
    isUpcoming: false,
    label: 'Unknown',
          color: Colors.statusUpcoming,
  };
}

export function getMissionImage(launch: Launch): string | null {
  if (launch.links.patch.small) {
    return launch.links.patch.small;
  }
  
  if (launch.links.patch.large) {
    return launch.links.patch.large;
  }
  
  if (launch.links.flickr.original.length > 0) {
    return launch.links.flickr.original[0];
  }
  
  return null;
}

export function getMissionDescription(launch: Launch): string {
  if (launch.details && launch.details.trim()) {
    return launch.details;
  }
  
  return 'No mission description available.';
}