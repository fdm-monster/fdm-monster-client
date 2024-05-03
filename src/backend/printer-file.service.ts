import { BaseService } from "@/backend/base.service";
import { ServerApi } from "@/backend/server.api";
import { FileUploadCommands } from "@/models/printers/file-upload-commands.model";
import {
  ClearedFilesResult,
  FileDto,
  MoonrakerFileDto,
  OctoPrintFileDto,
} from "@/models/printers/printer-file.model";
import { PrinterDto } from "@/models/printers/printer.model";
import { useSnackbar } from "@/shared/snackbar.composable";
import { IdType } from "@/utils/id.type";
import { getHttpClient } from "@/shared/http-client";

export class PrinterFileService extends BaseService {
  static async getFiles(printerId: IdType) {
    const path = `${ServerApi.printerFilesRoute}/${printerId}`;

    return (await this.getApi(path)) as FileDto[];
  }

  /**
   * A nice alternative for offline or disabled printers
   * @param printerId
   */
  static async getFileCache(printerId: IdType) {
    const path = `${ServerApi.printerFilesCacheRoute(printerId)}`;

    return (await this.getApi(path)) as FileDto[];
  }

  static async selectAndPrintFile(printerId: IdType, filePath: string, print = true) {
    const path = ServerApi.printerFilesSelectAndPrintRoute(printerId);
    return await this.postApi(path, { filePath, print });
  }

  static async uploadFile(
    printer: PrinterDto,
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

  static async clearFiles(printerId: IdType) {
    const path = `${ServerApi.printerFilesClearRoute(printerId)}`;

    return this.deleteApi<ClearedFilesResult>(path);
  }

  static async purgeFiles() {
    const path = `${ServerApi.printerFilesPurgeRoute}`;

    return this.postApi(path);
  }

  static async deleteFileOrFolder(printerId: IdType, path: string) {
    const urlPath = `${ServerApi.printerFilesRoute}/${printerId}/?path=${path}`;
    return this.deleteApi(urlPath);
  }

  static downloadFileDirectly(file: OctoPrintFileDto) {
    window.location.href = file.refs.download;
  }

  static async downloadFile(file: OctoPrintFileDto) {
    // const client = await getHttpClient();
    // const response = await client.request<any>({
    //   method: "POST",
    //   url: `api/server/dump-fdm-monster-logs`,
    //   responseType: "arraybuffer",
    // });
    window.location.href = file.refs.download;
  }
}
