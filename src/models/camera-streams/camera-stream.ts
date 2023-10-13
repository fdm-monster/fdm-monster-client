export interface CreateCameraStreamDto {
  streamURL: string;
  name?: string;
}

export interface CameraStream {
  id: string;
  printerId?: string;
  streamURL: string;
  name?: string;
}
