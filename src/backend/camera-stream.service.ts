import { BaseService } from "./base.service";
import { CameraStream } from "@/models/camera-streams/camera-stream";

export class CameraStreamService extends BaseService {
  static async listCameraStreams() {
    return await this.getApi<CameraStream[]>("api/camera-stream/");
  }
}
