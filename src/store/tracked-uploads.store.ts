import { defineStore } from "pinia";
import { TrackedUpload } from "../models/socketio-messages/socketio-message.model";
import { computed, ref } from "vue";
import { IdType } from "../utils/id.type";

export const useTrackedUploadsStore = defineStore("tracked-uploads", () => {
  const current = ref<TrackedUpload[]>([]);

  const getByPrinterId = (printerId: IdType) => {
    return computed(() =>
      current.value.reverse().find((ut) => ut.printerId === printerId.toString())
    );
  };

  function setUploads(uploads: TrackedUpload[]) {
    current.value.splice(0);
    current.value.push(...uploads);
  }

  return {
    current,
    setUploads,
    getByPrinterId,
  };
});
