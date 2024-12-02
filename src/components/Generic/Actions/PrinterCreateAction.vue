<template>
  <v-btn
    class="ma-2"
    color="primary"
    rounded
    small
    @click.c.capture.native.stop="openCreatePrinterDialog()"
  >
    <v-icon>add</v-icon>
    New printer
  </v-btn>
</template>

<script lang="ts" setup>
import { useDialogsStore } from "@/store/dialog.store";
import { DialogName } from "../Dialogs/dialog.constants";
import { IdType } from "@/utils/id.type";

const props = defineProps<{
  floorId?: IdType;
  floorX?: number;
  floorY?: number;
}>();

const dialogsStore = useDialogsStore();

function openCreatePrinterDialog() {
  dialogsStore.openDialogWithContext(DialogName.AddOrUpdatePrinterDialog, props);
}
</script>
