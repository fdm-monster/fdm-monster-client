<template>
  <BaseDialog :id="dialog.dialogId" max-width="700px" @escape="closeDialog()">
    Dialog shown
  </BaseDialog>
</template>
<script setup>
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { useDialog } from "@/shared/dialog.composable";
import { onMounted, watch } from "vue";
import { usePrinterStore } from "@/store/printer.store";

const dialog = useDialog(DialogName.BatchReprintDialog);
const printerStore = usePrinterStore();

function closeDialog() {
  dialog.closeDialog();
}

watch(
  () => printerStore.selectedPrinters.length,
  () => {
    console.log("Selection changed");
  }
);
</script>
