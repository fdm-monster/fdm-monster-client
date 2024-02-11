import { BaseService } from "@/backend/base.service";
import { ServerApi } from "@/backend/server.api";
import { IdType } from "@/utils/id.type";

export class PrinterGroupDto<KeyType = number> {
  printerId: KeyType;
  groupId: KeyType;
}

export interface GroupDto<KeyType extends string | number = number> {
  id: KeyType;
  name: string;
}

export interface GroupWithPrintersDto<KeyType extends string | number = number>
  extends GroupDto<KeyType> {
  printers: PrinterGroupDto<KeyType>[];
}

export class PrinterGroupService extends BaseService {
  static async createGroup(name: string) {
    const path = `${ServerApi.createGroupRoute}`;
    const body = {
      name,
    };
    return (await this.postApi(path, body)) as void;
  }

  static async deleteGroup(groupId: IdType) {
    const path = `${ServerApi.deleteGroupRoute(groupId)}`;
    return (await this.deleteApi(path)) as GroupWithPrintersDto<IdType>[];
  }

  static async getGroupsWithPrinters() {
    const path = `${ServerApi.printerGroupRoute}`;
    return (await this.getApi(path)) as GroupWithPrintersDto<IdType>[];
  }

  static async addPrinterToGroup(groupId: IdType, printerId: IdType) {
    const path = `${ServerApi.addPrinterToGroupRoute(groupId)}`;
    const body = {
      printerId,
    };
    return (await this.postApi(path, body)) as GroupWithPrintersDto<IdType>[];
  }

  static async deletePrinterFromGroup(groupId: IdType, printerId: IdType) {
    const path = `${ServerApi.deletePrinterFromGroupRoute(groupId)}`;
    const body = {
      printerId,
    };
    return (await this.deleteApi(path, body)) as GroupWithPrintersDto<IdType>[];
  }
}
