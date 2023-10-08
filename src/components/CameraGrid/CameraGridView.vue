<template>
  <div>
    <v-toolbar>
      <v-toolbar-title class="mr-4">Camera Overview</v-toolbar-title>
      <v-btn color="primary">
        <v-icon class="mr-2">add</v-icon>
        Add camera
      </v-btn>
    </v-toolbar>
    <v-row class="ma-0">
      <div
        v-for="camera in camerasWithPrinter"
        :key="camera.cameraStream._id"
        class="ma-3"
        style="border: 1px solid gray; margin: 0"
        width="300"
      >
        <v-card class="" width="300">
          <v-card-title>
            <v-icon dense v-if="camera?.printer" class="mr-2">print</v-icon>
            <v-icon dense v-else class="mr-2">camera_alt</v-icon>
            {{ camera?.printer ? camera?.printer.printerName : "Normal Camera" }}
          </v-card-title>
          <img :src="camera.cameraStream?.streamURL" width="100%" />
          <br />
          <v-btn class="mr-1" small>
            <v-icon class="mr-2">edit</v-icon>
            Update
          </v-btn>
          <v-btn small>
            <v-icon class="mr-2">delete</v-icon>
            Delete
          </v-btn>
        </v-card>
      </div>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { CameraStreamService } from "../../backend/camera-stream.service";
import { CameraStream } from "../../models/camera-streams/camera-stream";
import { usePrinterStore } from "../../store/printer.store";

const cameraStreams = ref<CameraStream[]>([]);
const printerStore = usePrinterStore();

onMounted(async () => {
  cameraStreams.value = (await CameraStreamService.listCameraStreams()) as CameraStream[];
});

const camerasWithPrinter = computed(() => {
  return cameraStreams.value.map((cameraStream) => ({
    printer: printerStore.printers.find((printer) => printer.id === cameraStream.printerId),
    cameraStream,
  }));
});
</script>
