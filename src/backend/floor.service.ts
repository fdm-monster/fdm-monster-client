import { BaseService } from "@/backend/base.service";
import { ServerApi } from "@/backend/server.api";
import { newRandomNamePair } from "@/shared/noun-adjectives.data";
import { FloorDto, getDefaultCreateFloor, PreCreateFloor } from "@/models/floors/floor.model";

export class FloorService extends BaseService {
  static convertPrinterFloorToCreateForm(printerFloor?: FloorDto): PreCreateFloor {
    // Inverse transformation
    const newFormData = getDefaultCreateFloor();

    newFormData.id = printerFloor?.id;
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

    return modifiedData as FloorDto;
  }

  static async getFloors() {
    const path = `${ServerApi.floorRoute}/`;

    return (await this.getApi<FloorDto[]>(path)) as FloorDto[];
  }

  static async createFloor(floor: FloorDto) {
    const path = `${ServerApi.floorRoute}/`;

    return (await this.postApi(path, floor)) as FloorDto;
  }

  static async updateFloorName(floorId: string, name: string) {
    const path = `${ServerApi.updatePrinterFloorNameRoute(floorId)}/`;

    return (await this.patchApi(path, { name })) as FloorDto;
  }

  static async updateFloorNumber(floorId: string, floor: number) {
    const path = `${ServerApi.updatePrinterFloorNumberRoute(floorId)}/`;

    return (await this.patchApi(path, { floor })) as FloorDto;
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

    return (await this.postApi(path, body)) as FloorDto;
  }

  static async deletePrinterFromFloor(floorId: string, printerId: string) {
    const path = `${ServerApi.addOrRemovePrinterFromFloorRoute(floorId)}/`;

    return (await this.deleteApi(path, { printerId })) as FloorDto;
  }
}
