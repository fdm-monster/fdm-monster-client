export interface VersionModel {
  version: string;
  isDockerContainer: boolean;
  isNode: boolean;
  os: string;
  monsterPi: string | null;
  update: {
    synced: boolean;
    updateAvailable: boolean;
    airGapped: boolean;
  };
}
