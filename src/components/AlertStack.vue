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
          <v-progress-linear v-if="state" :value="100 * state.progress.percent"></v-progress-linear>
        </div>

        <template v-slot:action="{ attrs }">
          <v-btn color="success" text v-bind="attrs" @click="progressSnackbarOpened = false">
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

<script lang="ts" setup>
import {eventTypeToMessage, InfoEventType} from "@/event-bus/alert.events";
import type {TrackedUpload, UploadStates} from "@/models/sse-messages/printer-sse-message.model";
import {useUploadsStore} from "@/stores/uploads";
import {onMounted} from "@vue/runtime-core";
import {type AppContext, onBeforeUnmount, ref} from "vue";

const {stopPropagation} = defineProps<{ stopPropagation: boolean }>();
const uploadsStore = useUploadsStore();

const progressSnackbarOpened = ref<boolean>(false);
const infoSnackbarOpened = ref<boolean>(false);
const err = ref<unknown>();
const context = ref<AppContext>();
const progressStates = ref<TrackedUpload[]>([]);
const progressInfo = ref<any>();
const info = ref<any>();

function getUploadingFileName(state: TrackedUpload) {
  if (!state.multerFile?.length) return "";
  return state.multerFile[0].originalname;
}

onMounted(() => {
  // TODO bus
  // this.$bus.on(vuexErrorEvent, this.storeError);
  // this.$bus.on(infoMessageEvent, this.infoMessage);
  // this.$bus.on(uploadMessageEvent, this.uploadTracker);
});

onBeforeUnmount(() => {
  // TODO bus
  // this.$bus.off(vuexErrorEvent, this.storeError);
  // this.$bus.off(infoMessageEvent, this.infoMessage);
  // this.$bus.off(uploadMessageEvent, this.uploadTracker);
});

function infoMessage(message: string) {
  info.value = message;
  infoSnackbarOpened.value = true;
}

function uploadTracker(type: InfoEventType, uploadProgress: UploadStates) {
  if (
      !uploadProgress.current?.length &&
      !uploadsStore.hasPendingUploads &&
      !uploadsStore.uploadingNow
  ) {
    progressSnackbarOpened.value = false;
    return;
  }

  progressInfo.value = eventTypeToMessage(type, uploadProgress.current?.length);
  progressStates.value = uploadProgress.current;
  progressSnackbarOpened.value = true;
}

function storeError(event: PromiseRejectionEvent) {
  err.value = event.reason;
  infoSnackbarOpened.value = true;
}

function errorCaptured(_err: unknown, _context: AppContext, _info: any) {
  infoSnackbarOpened.value = true;
  err.value = _err;
  context.value = _context;
  info.value = _info;
  return stopPropagation;
}

function cancelError() {
  err.value = undefined;
  progressStates.value = [];
}

</script>
