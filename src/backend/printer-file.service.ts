import { BaseService } from "@/backend/base.service";
import { ServerApi } from "@/backend/server.api";
import { ClearedFilesResult, FileDto } from "@/models/printers/printer-file.model";
import { PrinterDto } from "@/models/printers/printer.model";
import { useSnackbar } from "@/shared/snackbar.composable";
import { IdType } from "@/utils/id.type";
import { downloadFileByBlob } from "@/utils/download-file.util";

export class PrinterFileService extends BaseService {
  static async getFiles(printerId: IdType) {
    const path = `${ServerApi.printerFilesRoute}/${printerId}`;

    return (await this.get(path)) as FileDto[];
  }

  /**
   * A nice alternative for offline or disabled printers
   * @param printerId
   */
  static async getFileCache(printerId: IdType) {
    const path = `${ServerApi.printerFilesCacheRoute(printerId)}`;

    return (await this.get(path)) as FileDto[];
  }

  static async selectAndPrintFile(printerId: IdType, filePath: string, print = true) {
    const path = ServerApi.printerFilesSelectAndPrintRoute(printerId);
    return await this.post(path, { filePath, print });
  }

  static async uploadFile(printer: PrinterDto, file: File) {
    const path = ServerApi.printerFilesUploadRoute(printer.id);

    const formData = new FormData();
    formData.append("files[0]", file);

    return this.postUpload(path, formData, {
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

  static async clearFiles(printerId: IdType) {
    const path = `${ServerApi.printerFilesClearRoute(printerId)}`;

    return this.delete<ClearedFilesResult>(path);
  }

  static async purgeFiles() {
    const path = `${ServerApi.printerFilesPurgeRoute}`;

    return this.post(path);
  }

  static async deleteFileOrFolder(printerId: IdType, path: string) {
    const urlPath = `${ServerApi.printerFilesRoute}/${printerId}?path=${path}`;
    return this.delete(urlPath);
  }

  static async downloadFile(printerId: IdType, path: string) {
    const urlPath = `${ServerApi.printerFilesRoute}/${printerId}/download/${path}`;
    const arrayBuffer = await this.getDownload(urlPath);
    downloadFileByBlob(arrayBuffer.data, path);
  }
}
