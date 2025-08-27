import { Launch } from '../types/spacex';

export type RootStackParamList = {
  LaunchesList: undefined;
  LaunchDetails: {
    launch: Launch;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}