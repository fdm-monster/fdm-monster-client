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
import { DialogName } from "../Dialogs/dialog.constants";
import { IdType } from "@/utils/id.type";
import { useDialog } from "@/shared/dialog.composable";

const props = defineProps<{
  floorId?: IdType;
  floorX?: number;
  floorY?: number;
}>();

const dialog = useDialog(DialogName.AddOrUpdatePrinterDialog);

function openCreatePrinterDialog() {
  dialog.openDialog(props);
}
</script>
