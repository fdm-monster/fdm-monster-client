import { defineStore } from "pinia";
import { FailedQueuedUpload, QueuedUpload } from "@/models/uploads/queued-upload.model";
import { PrinterFileService } from "@/backend";
import { useSnackbar } from "@/shared/snackbar.composable";

export interface UploadsState {
  queuedUploads: QueuedUpload[];
  failedUploads: FailedQueuedUpload[];
  uploadingNow: boolean;
}

export const useUploadsStore = defineStore("Uploads", {
  state: (): UploadsState => ({
    queuedUploads: [],
    failedUploads: [],
    uploadingNow: false,
  }),
  getters: {
    hasPendingUploads(state) {
      return state.queuedUploads?.length > 0;
    },
    isUploadingNow(state) {
      return state.uploadingNow;
    },
    nextUpload(state) {
      return state.queuedUploads[0];
    },
  },
  actions: {
    queueUploads(uploads: QueuedUpload[]) {
      this.failedUploads = [];
      this.queuedUploads.push(...uploads);
    },
    cancelUploads() {
      this.queuedUploads = [];
      this.failedUploads = [];
    },
    async handleNextUpload() {
      const snackbar = useSnackbar();
      // Dont upload when queue empty
      if (!this.queuedUploads?.length) return;
      this.uploadingNow = true;
      const { file, printer, commands } = this.nextUpload;
      // We'd rather fail fast and avoid the same upload failing many times
      this.queuedUploads.splice(0, 1);

      try {
        await PrinterFileService.uploadFile(printer, file, commands);
      } catch (e: any) {
        if (e.isAxiosError) {
          const failedUpload: FailedQueuedUpload = {
            file,
            printer,
            commands,
            error: e,
          };
          this.failedUploads.push(failedUpload);
          snackbar.openErrorMessage({
            title: "Upload failure",
            subtitle: `File ${file.name}Upload failed for  to printer ${printer.name}`,
          });
        } else {
          snackbar.openErrorMessage({
            title: "Upload failure",
            subtitle: "Unknown upload error occurred",
          });
        }
      }
      this.uploadingNow = false;
    },
  },
});
