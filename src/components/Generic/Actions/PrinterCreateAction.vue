<template>
  <v-btn
    class="ma-2"
    color="primary"
    fab
    small
    @click.c.capture.native.stop="openCreatePrinterDialog()"
  >
    <v-icon>add</v-icon>
  </v-btn>
</template>

<script lang="ts" setup>
import { useDialogsStore } from "@/store/dialog.store";
import { DialogName } from "../Dialogs/dialog.constants";

const dialogsStore = useDialogsStore();

function openCreatePrinterDialog() {
  dialogsStore.openDialogWithContext(DialogName.AddOrUpdatePrinterDialog);
}
</script>
