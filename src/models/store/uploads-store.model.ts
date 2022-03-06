import type { QueuedUpload } from "../uploads/queued-upload.model";

export interface UploadsStore {
    queuedUploads: QueuedUpload[],
    uploadingNow: boolean
}