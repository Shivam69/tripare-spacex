// SpaceX API Types

export interface Launch {
  id: string;
  name: string;
  date_utc: string;
  success: boolean | null;
  upcoming: boolean;
  details: string | null;
  links: {
    patch: {
      small: string | null;
      large: string | null;
    };
    flickr: {
      original: string[];
    };
    webcast: string | null;
  };
  launchpad: string;
  rocket: string;
  flight_number: number;
}

export interface Launchpad {
  id: string;
  name: string;
  full_name: string;
  locality: string;
  region: string;
  latitude: number;
  longitude: number;
  launch_attempts: number;
  launch_successes: number;
  rockets: string[];
  timezone: string;
  details: string;
  status: 'active' | 'inactive' | 'unknown';
}

export interface LaunchWithLaunchpad extends Launch {
  launchpadData?: Launchpad;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface LaunchStatus {
  isSuccess: boolean;
  isUpcoming: boolean;
  label: string;
  color: string;
}