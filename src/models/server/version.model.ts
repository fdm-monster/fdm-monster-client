export interface VersionModel {
  version: string;
  isDockerContainer: boolean;
  isNodemon: boolean;
  isNode: boolean;
  isPm2: boolean;
  os: string;
  update: {
    synced: boolean;
    updateAvailable: boolean;
    includingPrerelease: boolean;
    airGapped: boolean;
  };
}
