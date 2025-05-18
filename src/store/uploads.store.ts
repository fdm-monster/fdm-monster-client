import { defineStore } from "pinia";
import { FailedQueuedUpload, QueuedUpload } from "@/models/uploads/queued-upload.model";
import { PrinterFileService } from "@/backend";
import { useSnackbar } from "@/shared/snackbar.composable";
import { useQueryClient } from "@tanstack/vue-query";
import { computed, ref } from "vue";
import { thumbnailQueryKey } from "@/queries/thumbnail.query";

export const useUploadsStore = defineStore("Uploads", () => {
  const snackbar = useSnackbar();
  const queryClient = useQueryClient();

  const queuedUploads = ref<QueuedUpload[]>([]);
  const failedUploads = ref<FailedQueuedUpload[]>([]);
  const uploadingNow = ref(false);

  const hasPendingUploads = computed(() => {
    return queuedUploads.value?.length > 0;
  });

  const isUploadingNow = computed(() => {
    return uploadingNow.value;
  });

  const nextUpload = computed(() => queuedUploads.value[0]);

  function queueUploads(uploads: QueuedUpload[]) {
    failedUploads.value = [];
    queuedUploads.value.push(...uploads);
  }

  function cancelUploads() {
    queuedUploads.value = [];
    failedUploads.value = [];
  }

  async function handleNextUpload() {
    // Dont upload when queue empty
    if (!queuedUploads.value?.length) return;
    uploadingNow.value = true;
    const { file, printer, startPrint } = nextUpload.value;
    // We'd rather fail fast and avoid the same upload failing many times
    queuedUploads.value.splice(0, 1);

    try {
      await PrinterFileService.uploadFile(printer, file, startPrint);
      await queryClient.invalidateQueries({
        queryKey: [thumbnailQueryKey, printer.id],
        exact: true,
      });
    } catch (e: any) {
      if (e.isAxiosError) {
        const failedUpload: FailedQueuedUpload = {
          file,
          printer,
          error: e,
          startPrint: false,
        };
        failedUploads.value.push(failedUpload);
        snackbar.openErrorMessage({
          title: "Upload failure",
          subtitle: `File ${file.name}Upload failed for  to printer ${printer.name}`,
        });
      } else {
        console.error(e);
        snackbar.openErrorMessage({
          title: "Upload failure",
          subtitle: "Unknown upload error occurred",
        });
      }
    }
    uploadingNow.value = false;
  }

  return {
    queuedUploads,
    failedUploads,
    uploadingNow,
    hasPendingUploads,
    isUploadingNow,
    nextUpload,
    queueUploads,
    cancelUploads,
    handleNextUpload,
  };
});
