import { PrinterFileService } from "@/backend";
import type { UploadsStore } from "@/models/store/uploads-store.model";
import type { QueuedUpload } from "@/models/uploads/queued-upload.model";
import { defineStore } from "pinia";

export const useUploadsStore = defineStore({
    id: 'uploads',
    state: (): UploadsStore => ({
        queuedUploads: [],
        uploadingNow: false
    }),
    getters: {
        hasPendingUploads(): boolean {
            return this.queuedUploads?.length > 0;
        },
        nextUpload(): QueuedUpload | undefined {
            if (!this.queuedUploads?.length) return undefined;
            return this.queuedUploads[0];
        }
    },
    actions: {
        async handleNextUpload() {
            // Dont upload when queue empty
            if (!this.queuedUploads?.length) return;

            this._setUploadingNow(true);
            const nextUpload = this.nextUpload;
            if (!nextUpload) return;

            const { file, printer, commands } = nextUpload;
            // We'd rather fail fast and avoid the same upload failing many times
            this._spliceNextUpload();
            await PrinterFileService.uploadFile(printer, file, commands);
            this._setUploadingNow(false);
        },
        queueUploads(newQueuedUploads: QueuedUpload[]) {
            // TODO implement this ability and check if file was already uploaded or already printing
            if (this.queuedUploads?.length > 0) return;

            this._setUploads(newQueuedUploads);
        },
        cancelUploads() {
            this._resetUploads();
        },
        // Mutator
        _setUploadingNow(uploading: boolean) {
            this.uploadingNow = uploading;
        },
        // Mutator
        _setUploads(uploads: QueuedUpload[]) {
            this.queuedUploads = uploads;
        },
        // Mutator
        _spliceNextUpload() {
            this.queuedUploads.splice(0, 1);
        },
        // Mutator
        _resetUploads() {
            this.queuedUploads = [];
        }
    }
});