export interface GithubRateLimit {
  // For us: core resource
  rate: Rate;
  // Resources like core, graphql, integration_manifest and search
  resources: Resources;
}

export interface Resources {
  core: Rate;
  graphql: Rate;
  integration_manifest: Rate;
  search: Rate;
}

export interface Rate {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
  resource: string;
}
