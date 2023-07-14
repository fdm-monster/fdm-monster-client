<template>
  <v-snackbar
    v-model="snackbarOpened"
    absolute
    bottom
    class="ma-3"
    elevation="24"
    multi-line
    right
    shaped
    timeout="-1"
  >
    <v-row>
      <v-col cols="2">
        <v-btn icon large>
          <v-icon>file_upload</v-icon>
        </v-btn>
      </v-col>
      <v-col class="d-flex align-center flex-row" cols="8">
        <div style="width: 100%">
          <span class="font-weight-bold text-button">
            {{ snackbarTitle }}
          </span>
          <div v-for="(state, index) in progressStates" :key="index" class="mb-2">
            <!--      {{ getUploadingFileName(state) }} -->
            <span> file.gcode </span>
            <v-progress-linear
              v-if="state"
              :value="state.progress.percent"
              color="success"
            ></v-progress-linear>
          </div>
        </div>
      </v-col>
      <v-col cols="1">
        <v-btn icon large @click="snackbarOpened = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-snackbar>
</template>
<script lang="ts" setup>
import { ErrorMessage, useSnackbar } from "../../../shared/snackbar.composable";
import { onMounted, ref } from "vue";
import {
  TrackedUpload,
  UploadStates,
} from "../../../models/socketio-messages/socketio-message.model";
import { eventTypeToMessage, InfoEventType } from "../../../shared/alert.events";

const snackbar = useSnackbar();
const snackbarOpened = ref(true);
const snackbarTitle = ref("");
const snackbarProgressText = ref("");
const progressStates = ref([
  {
    progress: {
      percent: 55,
    },
  },
  {
    progress: {
      percent: 25,
    },
  },
]);

onMounted(() => {
  snackbar.onErrorMessage((data: ErrorMessage) => {
    snackbarTitle.value = data.title;
    snackbarProgressText.value = data.subtitle ?? "";
    snackbarOpened.value = true;
  });
});

function getUploadingFileName(state: TrackedUpload) {
  if (!state.multerFile?.length) return "";
  return state.multerFile[0].originalname;
}

function uploadTracker(type: InfoEventType, uploadProgress: UploadStates) {
  if (
    !uploadProgress.current?.length &&
    !this.uploadsStore.hasPendingUploads &&
    !this.uploadsStore.isUploadingNow
  ) {
    this.progressSnackbarOpened = false;
    return;
  }
  this.progressInfo = eventTypeToMessage(type, uploadProgress.current?.length);
  this.progressStates = uploadProgress.current;
  this.progressSnackbarOpened = true;
}
</script>
