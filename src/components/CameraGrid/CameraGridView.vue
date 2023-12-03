<template>
  <div>
    <v-toolbar>
      <v-toolbar-title class="mr-4">Camera Overview</v-toolbar-title>
      <v-btn color="primary" @click="addCamera()">
        <v-icon class="mr-2">add</v-icon>
        Add camera
      </v-btn>
    </v-toolbar>
    <v-row class="ma-0">
      <div
        v-for="camera in query.data.value"
        :key="camera.cameraStream.id"
        class="ma-4"
        style="border: 1px solid grey; margin: 0"
        width="300"
      >
        <v-card class="pb-2 pl-2 pr-2" width="300">
          <v-card-title>
            <v-icon v-if="camera.cameraStream.printerId" class="mr-2" dense>print</v-icon>
            <v-icon v-else class="mr-2" dense>camera_alt</v-icon>
            {{ camera?.cameraStream.name ?? camera?.printer?.name ?? "Camera" }}
          </v-card-title>
          <img :src="camera.cameraStream?.streamURL" width="100%" />
          <br />
          <v-btn class="mr-1" small @click="updateCamera(camera.cameraStream.id)">
            <v-icon class="mr-2">edit</v-icon>
            Update
          </v-btn>
          <v-btn small @click="deleteCamera(camera.cameraStream.id)">
            <v-icon class="mr-2">delete</v-icon>
            Delete
          </v-btn>
        </v-card>
      </div>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
import { CameraStreamService } from "@/backend/camera-stream.service";
import { useDialog } from "@/shared/dialog.composable";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { useMutation, useQuery } from "@tanstack/vue-query";
import { CameraStream, CameraWithPrinter } from "@/models/camera-streams/camera-stream";
import { PrinterDto } from "@/models/printers/printer.model";
import { usePrinterStore } from "@/store/printer.store";

const printerStore = usePrinterStore();
const dialog = useDialog(DialogName.AddOrUpdateCameraDialog);
const camerasWithPrinter = async (): Promise<CameraWithPrinter[]> => {
  const streams = await CameraStreamService.listCameraStreams();
  return streams.map((cameraStream) => ({
    printer: printerStore.printers.find((printer) => printer.id === cameraStream.printerId),
    cameraStream,
  })) as CameraWithPrinter[];
};
const query = useQuery({
  queryKey: ["cameraStream"],
  queryFn: camerasWithPrinter,
});
const deleteMutation = useMutation({
  mutationFn: (cameraId: string | number) => CameraStreamService.deleteCameraStream(cameraId),
  onSuccess: () => query.refetch(),
});

function addCamera() {
  dialog.openDialog({ addOrUpdate: "add" });
}

function updateCamera(cameraId: string | number) {
  dialog.openDialog({ addOrUpdate: "update", cameraId });
}

function deleteCamera(cameraId: string | number) {
  deleteMutation.mutateAsync(cameraId);
}
</script>
