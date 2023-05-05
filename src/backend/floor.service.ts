import { BaseService } from "@/backend/base.service";
import { ServerApi } from "@/backend/server.api";
import { newRandomNamePair } from "@/constants/noun-adjectives.data";
import {
  Floor,
  getDefaultCreatePrinterFloor,
  PreCreateFloor,
} from "@/models/printer-floor/printer-floor.model";

export class FloorService extends BaseService {
  static convertPrinterFloorToCreateForm(printerFloor?: Floor): PreCreateFloor {
    // Inverse transformation
    const newFormData = getDefaultCreatePrinterFloor();

    newFormData._id = printerFloor?._id;
    newFormData.name = printerFloor?.name || newRandomNamePair();
    newFormData.printers = [];

    newFormData.floor = (printerFloor?.floor || 1).toString();

    return newFormData;
  }

  static convertCreateFormToFloor(formData: PreCreateFloor) {
    const modifiedData: any = { ...formData };

    // Fix the string properties to become int
    modifiedData.floor = parseInt(modifiedData.floor);

    if (Number.isNaN(modifiedData.floor)) {
      throw new Error("Floor number did not convert to number.");
    }

    return modifiedData as Floor;
  }

  static async getFloors() {
    const path = `${ServerApi.floorRoute}/`;

    return (await this.getApi<Floor[]>(path)) as Floor[];
  }

  static async createFloor(floor: Floor) {
    const path = `${ServerApi.floorRoute}/`;

    return (await this.postApi(path, floor)) as Floor;
  }

  static async updateFloorName(floorId: string, name: string) {
    const path = `${ServerApi.updatePrinterFloorNameRoute(floorId)}/`;

    return (await this.patchApi(path, { name })) as Floor;
  }

  static async updateFloorNumber(floorId: string, floor: number) {
    const path = `${ServerApi.updatePrinterFloorNumberRoute(floorId)}/`;

    return (await this.patchApi(path, { floor })) as Floor;
  }

  static async deleteFloor(floorId: string) {
    const path = `${ServerApi.getFloorRoute(floorId)}/`;

    return await this.deleteApi(path);
  }

  static async addPrinterToFloor(
    floorId: string,
    body: { printerId: string; x: number; y: number }
  ) {
    const path = `${ServerApi.addOrRemovePrinterFromFloorRoute(floorId)}/`;

    return (await this.postApi(path, body)) as Floor;
  }

  static async deletePrinterFromFloor(floorId: string, printerId: string) {
    const path = `${ServerApi.addOrRemovePrinterFromFloorRoute(floorId)}/`;

    return (await this.deleteApi(path, { printerId })) as Floor;
  }
}
