<template>
  <div>
    <slot></slot>
    <div>
      <v-snackbar
          v-model="progressSnackbarOpened"
          absolute
          bottom
          right
          rounded="rounded"
          timeout="-1"
      >
        {{ progressInfo }}
        <div v-for="(state, index) in progressStates" :key="index" class="mb-2">
          {{ getUploadingFileName(state) }}
          <v-progress-linear
              v-if="state"
              :value="100 * state.progress.percent"
          ></v-progress-linear>
        </div>

        <template v-slot:action="{ attrs }">
          <v-btn
              color="success"
              text
              v-bind="attrs"
              @click="progressSnackbarOpened = false"
          >
            Close
          </v-btn>
        </template>
      </v-snackbar>

      <v-snackbar
          v-if="info || err"
          v-model="infoSnackbarOpened"
          absolute
          bottom
          class="mb-16"
          right
          rounded="pill"
      >
        <span v-if="err">{{ err.message }}</span>
        {{ info }}

        <template v-slot:action="{ attrs }">
          <v-btn
              :color="err ? 'error' : 'success'"
              text
              v-bind="attrs"
              @click="infoSnackbarOpened = false"
          >
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </div>
  </div>
</template>

<script lang="ts">
import {eventTypeToMessage, InfoEventType,} from "@/shared/events/alert.events";
import type {TrackedUpload, UploadStates,} from "@/models/sse-messages/printer-sse-message.model";
import type {AppContext} from "vue";

export default defineComponent({
  setup: () => {
    const {stopPropagation} = defineProps<{ stopPropagation: boolean }>();
    return {
      stopPropagation,
      uploadsStore: useUploadsStore(),
      progressSnackbarOpened: ref<boolean>(false),
      infoSnackbarOpened: ref<boolean>(false),
      info: ref<any>(),
      err: ref<any>(),
      progressInfo: ref<any>(),
      progressStates: ref<TrackedUpload[]>([]),
      context: ref<AppContext>()
    };
  },
  mounted() {
    // TODO bus
    // this.$bus.on(piniaErrorEvent, this.onStoreError);
    // this.$bus.on(infoMessageEvent, this.onInfoMessage);
    // this.$bus.on(uploadMessageEvent, this.onUploadTracker);
  },
  methods: {
    onInfoMessage(message: string) {
      this.info = message;
      this.infoSnackbarOpened = true;
    },
    onUploadTracker(type: InfoEventType, uploadProgress: UploadStates) {
      if (
          !uploadProgress.current?.length &&
          !this.uploadsStore.hasPendingUploads &&
          !this.uploadsStore.uploadingNow
      ) {
        this.progressSnackbarOpened = false;
        return;
      }

      this.progressInfo = eventTypeToMessage(type, uploadProgress.current?.length);
      this.progressStates = uploadProgress.current;
      this.progressSnackbarOpened = true;
    },
    getUploadingFileName(state: TrackedUpload) {
      if (!state.multerFile?.length) return "";
      return state.multerFile[0].originalname;
    },
    storeError(event: PromiseRejectionEvent) {
      this.err = event.reason;
      this.infoSnackbarOpened = true;
    },
    errorCaptured(_err: unknown, _context: AppContext, _info: any) {
      this.infoSnackbarOpened = true;
      this.err = _err;
      this.context = _context;
      this.info = _info;
      return this.stopPropagation;
    },
    cancelError() {
      this.err = undefined;
      this.progressStates = [];
    }
  }
});
</script>
