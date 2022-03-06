import type { Printer } from "@/models/printers/printer.model";
import type { FileUploadCommands } from "@/models/printers/file-upload-commands.model";

export interface QueuedUpload {
  printer: Printer;
  commands: FileUploadCommands;
  file: File;
}
