<template>
  <BaseDialog :id="dialog.dialogId" max-width="800px" @escape="closeDialog()">
    <ValidationObserver ref="validationObserver" v-slot="{ invalid }">
      <v-card>
        <v-card-title>
          <span class="text-h5">
            <v-avatar color="primary" size="56" class="mr-2">
              {{ avatarInitials }}
            </v-avatar>
            <span v-if="isUpdating"> Updating Camera </span>
            <span v-else> New Camera </span>
          </span>
        </v-card-title>

        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12>
                <v-text-field v-model="cameraStream.name" label="Name" required />
              </v-flex>
              <v-flex xs12>
                <v-text-field v-model="cameraStream.streamURL" label="Url (MJPEG)" required />
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary darken-2" @click="close">Cancel</v-btn>
          <v-btn color="primary" :disabled="invalid" @click="createCamera">
            {{ isUpdating ? "Update" : "Create" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </ValidationObserver>
  </BaseDialog>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { useDialog } from "@/shared/dialog.composable";
import { CameraStream } from "@/models/camera-streams/camera-stream";
import { ValidationObserver } from "vee-validate";
import { CameraStreamService } from "@/backend/camera-stream.service";

const dialog = useDialog(DialogName.AddOrUpdateCameraDialog);

const avatarInitials = computed(() => {
  return "C";
});

const isUpdating = computed(() => {
  return dialog.context()?.addOrUpdate === "update";
});

const cameraStream = ref<CameraStream>({
  name: "",
  streamURL: "",
});

function closeDialog() {
  dialog.closeDialog();
}

async function createCamera() {
  await CameraStreamService.createCameraStream({
    streamURL: cameraStream.value.streamURL,
    name: cameraStream.value.name,
  });
  dialog.closeDialog();
}

function close() {
  dialog.closeDialog();
}
</script>
