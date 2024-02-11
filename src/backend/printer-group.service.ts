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
  static async getGroupsWithPrinters() {
    const path = `${ServerApi.printerGroupRoute}`;
    return (await this.getApi(path)) as GroupWithPrintersDto<IdType>[];
  }
}
