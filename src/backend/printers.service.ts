import { ServerApi } from "@/backend/server.api";
import { BaseService } from "@/backend/base.service";
import { LoginDetails, PrinterDto } from "@/models/printers/printer.model";
import { CreatePrinter, getDefaultCreatePrinter } from "@/models/printers/create-printer.model";
import { newRandomNamePair } from "@/shared/noun-adjectives.data";

export class PrintersService extends BaseService {
  static convertPrinterToCreateForm(printer: CreatePrinter) {
    // Inverse transformation
    const newFormData = getDefaultCreatePrinter();

    newFormData.id = printer.id;
    newFormData.printerURL = printer.printerURL;
    newFormData.printerType = printer.printerType;
    newFormData.name = printer.name || newRandomNamePair();
    newFormData.apiKey = printer.apiKey;
    newFormData.username = printer.username;
    newFormData.password = printer.password;
    newFormData.enabled = printer.enabled;
    return newFormData;
  }

  static openPrinterURL(printerURL: string) {
    if (!printerURL) return;

    window.open(printerURL);
  }

  static async getPrinters() {
    const path = ServerApi.printerRoute;

    return await this.get<PrinterDto[]>(path);
  }

  static async getPrinterLoginDetails(printerId: number) {
    const path = ServerApi.getPrinterLoginDetailsRoute(printerId);

    return await this.get<LoginDetails>(path);
  }

  static async restartOctoPrint(printerId: number) {
    const path = `${ServerApi.restartOctoPrintRoute(printerId)}`;
    return (await this.post(path)) as any;
  }

  static async refreshSocket(printerId: number) {
    const path = `${ServerApi.refreshSocketRoute(printerId)}`;
    return (await this.post(path)) as any;
  }

  static async sendPrinterConnectCommand(printerId: number) {
    const path = ServerApi.printerSerialConnectRoute(printerId);

    return await this.post(path);
  }

  static async sendPrinterDisconnectCommand(printerId: number) {
    const path = ServerApi.printerSerialDisconnectRoute(printerId);

    return await this.post(path);
  }

  static async sendPrinterJogCommand(
    printerId: number,
    amounts: { x?: number; y?: number; z?: number }
  ) {
    const path = ServerApi.printerJogCommandRoute(printerId);

    return await this.post(path, amounts);
  }

  static async sendPrinterHomeCommand(printerId: number, axes: string[]) {
    const path = ServerApi.printerHomeCommandRoute(printerId);

    return await this.post(path, axes);
  }

  static async createPrinter(printer: CreatePrinter, forceSave: boolean) {
    const path = `${ServerApi.printerRoute}?forceSave=${forceSave}`;

    return await this.post<PrinterDto>(path, printer);
  }

  static async batchImportPrinters(printers: CreatePrinter[]) {
    const path = ServerApi.printerBatchRoute;

    return await this.post<PrinterDto[]>(path, printers);
  }

  static async deletePrinter(printerId: number) {
    const path = ServerApi.getPrinterRoute(printerId);

    return await this.delete(path);
  }

  static async updatePrinter(printerId: number, printer: CreatePrinter, forceSave: boolean) {
    const path = ServerApi.getPrinterRoute(printerId);
    const fullPath = `${path}?forceSave=${forceSave}`;
    return await this.patch<PrinterDto>(fullPath, printer);
  }

  static async updatePrinterMaintenance(printerId: number, disabledReason: string | null = null) {
    const path = ServerApi.postPrinterDisabledReasonRoute(printerId);

    return await this.patch<PrinterDto>(path, { disabledReason });
  }

  static async testConnection(printer: CreatePrinter) {
    const path = ServerApi.printerTestConnectionRoute;

    return await this.post<PrinterDto>(path, printer);
  }

  static async toggleEnabled(printerId: number, enabled: boolean) {
    const path = ServerApi.printerEnabledRoute(printerId);

    return await this.patch(path, { enabled });
  }
}
