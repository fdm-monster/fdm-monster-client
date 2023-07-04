export interface IRelease {
  tag_name: string;
  prerelease: boolean;
  draft: boolean;
  url: string;
  assets_url: string;
  upload_url: string;
  html_url: string;
  id: number;
  node_id: string;
  name: string;
  body: string;
  created_at: Date;
  published_at: Date;
  tarball_url: string;
  zipball_url: string;
  mentions_count: number;
  assets: any[];
  author: any;
}

export interface IClientReleases {
  minimum: IRelease;
  latest: IRelease;
  current: IRelease;
  releases: IRelease[];
}
