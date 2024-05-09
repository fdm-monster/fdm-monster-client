export interface FileDto {
  path: string;
  size: number;
  date: number;
}

export interface ClearedFilesResult {
  failedFiles: FileDto[];
  succeededFiles: FileDto[];
}
