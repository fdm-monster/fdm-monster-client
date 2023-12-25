import { ServerApi } from "@/backend/server.api";
import { BaseService } from "@/backend/base.service";
import { LoginDetails, PrinterDto } from "@/models/printers/printer.model";
import {
  CreatePrinter,
  getDefaultCreatePrinter,
  PreCreatePrinter,
} from "@/models/printers/crud/create-printer.model";
import { newRandomNamePair } from "@/shared/noun-adjectives.data";
import { IdType } from "@/utils/id.type";

export class PrintersService extends BaseService {
  static applyLoginDetailsPatchForm(
    patch: { printerURL: string; apiKey: string; name: string },
    formData: PreCreatePrinter
  ) {
    formData.name = patch.name || newRandomNamePair();
    formData.apiKey = patch.apiKey;
  }

  static convertPrinterToCreateForm(printer: CreatePrinter) {
    // Inverse transformation
    const newFormData = getDefaultCreatePrinter();

    newFormData.id = printer.id;
    newFormData.printerURL = printer.printerURL;
    newFormData.name = printer.name || newRandomNamePair();
    newFormData.apiKey = printer.apiKey;
    newFormData.enabled = printer.enabled;
    return newFormData;
  }

  static openPrinterURL(printerURL: string) {
    if (!printerURL) return;

    window.open(printerURL);
  }

  static async getPrinters() {
    const path = ServerApi.printerRoute;

    return (await this.getApi<PrinterDto[]>(path)) as PrinterDto[];
  }

  static async getPrinterLoginDetails(printerId: IdType) {
    const path = ServerApi.getPrinterLoginDetailsRoute(printerId);

    return (await this.getApi<LoginDetails>(path)) as LoginDetails;
  }

  static async restartOctoPrint(printerId: IdType) {
    const path = `${ServerApi.restartOctoPrintRoute(printerId)}`;
    return (await this.postApi(path)) as any;
  }

  static async refreshSocket(printerId: IdType) {
    const path = `${ServerApi.refreshSocketRoute(printerId)}`;
    return (await this.postApi(path)) as any;
  }

  static async sendPrinterConnectCommand(printerId: IdType) {
    const path = ServerApi.printerSerialConnectRoute(printerId);

    return await this.postApi(path);
  }

  static async sendPrinterDisconnectCommand(printerId: IdType) {
    const path = ServerApi.printerSerialDisconnectRoute(printerId);

    return await this.postApi(path);
  }

  static async createPrinter(printer: CreatePrinter) {
    const path = ServerApi.printerRoute;

    return (await this.postApi(path, printer)) as PrinterDto;
  }

  static async batchImportPrinters(printers: CreatePrinter[]) {
    const path = ServerApi.printerBatchRoute;

    return (await this.postApi(path, printers)) as PrinterDto[];
  }

  static async deletePrinter(printerId: IdType) {
    const path = ServerApi.getPrinterRoute(printerId);

    return await this.deleteApi(path);
  }

  static async updatePrinter(printerId: IdType, printer: CreatePrinter) {
    const path = ServerApi.getPrinterRoute(printerId);

    return (await this.patchApi(path, printer)) as PrinterDto;
  }

  static async updatePrinterMaintenance(printerId: IdType, disabledReason: string | null = null) {
    const path = ServerApi.postPrinterDisabledReasonRoute(printerId);

    return (await this.patchApi(path, { disabledReason })) as PrinterDto;
  }

  static async testConnection(printer: CreatePrinter) {
    const path = ServerApi.printerTestConnectionRoute;

    return (await this.postApi(path, printer)) as PrinterDto;
  }

  static async toggleEnabled(printerId: IdType, enabled: boolean) {
    const path = ServerApi.printerEnabledRoute(printerId);

    return await this.patchApi(path, { enabled });
  }
}
