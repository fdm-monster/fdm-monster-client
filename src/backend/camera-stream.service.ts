import { BaseService } from "./base.service";
import { CameraStream, CreateCameraStreamDto } from "@/models/camera-streams/camera-stream";

export class CameraStreamService extends BaseService {
  static async listCameraStreams() {
    return await this.getApi<CameraStream[]>("api/camera-stream/");
  }

  static async createCameraStream(cameraStreamDto: CreateCameraStreamDto) {
    return await this.postApi<CameraStream>("api/camera-stream/", cameraStreamDto);
  }

  static async deleteCameraStream(cameraStreamId: string | number) {
    return await this.deleteApi(`api/camera-stream/${cameraStreamId}`);
  }
}
