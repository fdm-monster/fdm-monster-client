export interface CameraStream {
  id: string;
  printerId?: string;
  streamURL: string;
  settings: {
    flipHorizontal: boolean;
    flipVertical: boolean;
    rotateClockwise: boolean;
    aspectRatio: string;
  };
}
