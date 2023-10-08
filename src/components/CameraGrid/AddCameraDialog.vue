<template>
  <BaseDialog :id="dialog.dialogId" max-width="600px" @escape="closeDialog()">
    <v-card>
      <v-card-title>
        <span class="text-h5">
          <v-avatar color="primary" size="56">
            {{ avatarInitials }}
          </v-avatar>
          <span v-if="isUpdating"> Updating Camera </span>
          <span v-else> New Camera </span>
        </span>
      </v-card-title>
    </v-card>
  </BaseDialog>
</template>
<script lang="ts" setup>
import { useDialog } from "../../shared/dialog.composable";
import { DialogName } from "../Generic/Dialogs/dialog.constants";
import { useSnackbar } from "../../shared/snackbar.composable";
import { computed } from "vue";

const snackbars = useSnackbar();
const dialog = useDialog(DialogName.AddOrUpdateCameraDialog);

const isUpdating = computed(() => {
  return false;
});

const avatarInitials = computed(() => {
  return "C";
});

function closeDialog() {
  this.dialog.closeDialog();
}

async function submit() {
  // this.closeDialog();
}
</script>
