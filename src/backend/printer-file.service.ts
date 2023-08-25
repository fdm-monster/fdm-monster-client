import { BaseService } from "@/backend/base.service";
import { ServerApi } from "@/backend/server.api";
import { FileUploadCommands } from "@/models/printers/file-upload-commands.model";
import { PrinterFileCache } from "@/models/printers/printer-file-cache.model";
import { ClearedFilesResult, PrinterFile } from "@/models/printers/printer-file.model";
import { Printer } from "@/models/printers/printer.model";
import { useSnackbar } from "../shared/snackbar.composable";

export class PrinterFileService extends BaseService {
  static async getFiles(printerId: string, recursive = false) {
    const path = `${ServerApi.printerFilesRoute}/${printerId}/?recursive=${recursive}`;

    return (await this.getApi(path)) as PrinterFileCache;
  }

  /**
   * A nice alternative for offline or disabled printers
   * @param printerId
   */
  static async getFileCache(printerId: any) {
    const path = `${ServerApi.printerFilesCacheRoute(printerId)}`;

    return (await this.getApi(path)) as PrinterFileCache;
  }

  static async batchReprintFiles(printerIds: string[]) {
    const path = ServerApi.printerFilesBatchReprintRoute;
    return await this.postApi(path, { printerIds });
  }

  static async selectAndPrintFile(printerId: string, filePath: string, print = true) {
    const path = ServerApi.printerFilesSelectAndPrintRoute(printerId);
    return await this.postApi(path, { filePath, print });
  }

  static async uploadFile(
    printer: Printer,
    file: File,
    commands: FileUploadCommands = {
      select: true,
      print: true,
    }
  ) {
    const path = ServerApi.printerFilesUploadRoute(printer.id);

    const formData = new FormData();
    if (commands.select) {
      formData.append("select", "true");
    }
    if (commands.print) {
      formData.append("print", "true");
    }
    formData.append("files[0]", file);

    return this.postUploadApi(path, formData, {
      onUploadProgress: (progress) => {
        const snackbar = useSnackbar();
        snackbar.openProgressMessage(
          "single-file-upload",
          `Uploading file ${file.name}`,
          (100 * progress.loaded) / progress.total!,
          false
        );
      },
    });
  }

  static async clearFiles(printerId: string) {
    const path = `${ServerApi.printerFilesClearRoute(printerId)}`;

    return this.deleteApi<ClearedFilesResult>(path);
  }

  static async purgeFiles() {
    const path = `${ServerApi.printerFilesPurgeRoute}`;

    return this.postApi(path);
  }

  static async deleteFileOrFolder(printerId: string, path: string) {
    const urlPath = `${ServerApi.printerFilesRoute}/${printerId}/?path=${path}`;

    return this.deleteApi(urlPath);
  }

  static downloadFile(file: PrinterFile) {
    window.location.href = file.refs.download;
  }
}
