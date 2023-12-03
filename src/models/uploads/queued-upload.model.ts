import { PrinterDto } from "@/models/printers/printer.model";
import { FileUploadCommands } from "@/models/printers/file-upload-commands.model";

export interface QueuedUpload {
  printer: PrinterDto;
  commands: FileUploadCommands;
  file: File;
}

export interface FailedQueuedUpload extends QueuedUpload {
  error: any;
}
