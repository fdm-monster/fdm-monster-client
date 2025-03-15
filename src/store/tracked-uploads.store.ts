import { defineStore } from "pinia";
import { TrackedUpload } from "@/models/socketio-messages/socketio-message.model";
import { ref, computed } from "vue";

export const useTrackedUploadsStore = defineStore("tracked-uploads", () => {
  const current = ref<TrackedUpload[]>([]);

  const activeUploads = computed(() => {
    return current.value.filter((u) => !u.completed);
  });

  function setUploads(uploads: TrackedUpload[]) {
    current.value.splice(0);
    current.value.push(...uploads);
  }

  return {
    current,
    setUploads,
    activeUploads,
  };
});
