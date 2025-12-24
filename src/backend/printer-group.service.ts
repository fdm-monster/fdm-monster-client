import { BaseService } from "@/backend/base.service";
import { ServerApi } from "@/backend/server.api";

export interface PrinterGroupDto<KeyType = number> {
  printerId: KeyType;
  groupId: KeyType;
}

export interface GroupDto<KeyType extends number = number> {
  id: KeyType;
  name: string;
}

export interface GroupWithPrintersDto<KeyType extends number = number> extends GroupDto<KeyType> {
  printers: PrinterGroupDto<KeyType>[];
}

export class PrinterGroupService extends BaseService {
  static async createGroup(name: string) {
    const path = `${ServerApi.createGroupRoute}`;
    const body = {
      name,
    };
    return (await this.post(path, body)) as void;
  }

  static async deleteGroup(groupId: number) {
    const path = `${ServerApi.deleteGroupRoute(groupId)}`;
    return (await this.delete(path)) as GroupWithPrintersDto[];
  }

  static async getGroupsWithPrinters() {
    const path = `${ServerApi.printerGroupRoute}`;
    return (await this.get(path)) as GroupWithPrintersDto[];
  }

  static async addPrinterToGroup(groupId: number, printerId: number) {
    const path = `${ServerApi.addPrinterToGroupRoute(groupId)}`;
    const body = {
      printerId,
    };
    return (await this.post(path, body)) as GroupWithPrintersDto[];
  }

  static async deletePrinterFromGroup(groupId: number, printerId: number) {
    const path = `${ServerApi.deletePrinterFromGroupRoute(groupId)}`;
    const body = {
      printerId,
    };
    return (await this.delete(path, body)) as GroupWithPrintersDto[];
  }

  static async updateGroupName(groupId: number, name: string) {
    const path = `${ServerApi.updateGroupNameRoute(groupId)}`;
    const body = {
      name,
    };
    return (await this.patch(path, body)) as GroupWithPrintersDto[];
  }
}
