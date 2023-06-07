export interface IRelease {
  tag_name: string;
}

export interface IClientReleases {
  minimum: IRelease;
  latest: IRelease;
  current: IRelease;
  releases: IRelease[];
}
