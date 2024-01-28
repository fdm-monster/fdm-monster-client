<template>
  <BaseDialog
    :id="dialog.dialogId"
    max-width="700px"
    @escape="closeDialog()"
    @opened="onDialogOpened"
  >
    Dialog shown
  </BaseDialog>
</template>
<script setup lang="ts">
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { useDialog } from "@/shared/dialog.composable";
import { usePrinterStore } from "@/store/printer.store";
import { ref } from "vue";

const input = ref();
const dialog = useDialog(DialogName.BatchReprintDialog);
const printerStore = usePrinterStore();

async function onDialogOpened(inputData: any) {
  input.value = inputData;
}

function closeDialog() {
  dialog.closeDialog(dialog.context());
}
</script>
