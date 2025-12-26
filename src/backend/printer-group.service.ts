import { BaseService } from "@/backend/base.service";
import { ServerApi } from "@/backend/server.api";

export interface PrinterGroupDto {
  printerId: number;
  groupId: number;
}

export interface GroupDto {
  id: number;
  name: string;
}

export interface GroupWithPrintersDto extends GroupDto {
  printers: PrinterGroupDto[];
}

export class PrinterGroupService extends BaseService {
  static async createGroup(name: string) {
    const path = `${ ServerApi.createGroupRoute }`;
    const body = {
      name,
    };
    return await this.post(path, body);
  }

  static async deleteGroup(groupId: number) {
    const path = `${ ServerApi.deleteGroupRoute(groupId) }`;
    return (await this.delete<GroupWithPrintersDto[]>(path));
  }

  static async getGroupsWithPrinters() {
    const path = `${ ServerApi.printerGroupRoute }`;
    return await this.get<GroupWithPrintersDto[]>(path);
  }

  static async addPrinterToGroup(groupId: number, printerId: number) {
    const path = `${ ServerApi.addPrinterToGroupRoute(groupId) }`;
    const body = {
      printerId,
    };
    return await this.post<GroupWithPrintersDto[]>(path, body);
  }

  static async deletePrinterFromGroup(groupId: number, printerId: number) {
    const path = `${ ServerApi.deletePrinterFromGroupRoute(groupId) }`;
    const body = {
      printerId,
    };
    return await this.delete< GroupWithPrintersDto[]>(path, body);
  }

  static async updateGroupName(groupId: number, name: string) {
    const path = `${ ServerApi.updateGroupNameRoute(groupId) }`;
    const body = {
      name,
    };
    return await this.patch<GroupWithPrintersDto[]>(path, body);
  }
}
