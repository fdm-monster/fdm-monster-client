<template>
  <BaseDialog
    :id="dialog.dialogId"
    max-width="700px"
    @beforeOpened="onBeforeDialogOpened"
    @escape="closeDialog()"
    @opened="onDialogOpened"
  >
    <v-card class="pa-4">
      <v-card-title>
        <span class="text-h5"> Batch - Submit Reprint Jobs </span>
      </v-card-title>
      <v-alert v-if="errorLoading?.length" color="error">
        {{ errorLoading }}
      </v-alert>
      <span v-if="loading"> Loading... </span>
      <div v-else>
        <div v-for="print of reprintableFiles" :key="print.printerId">
          Printer State:
          <v-chip>{{ print.connectionState }}</v-chip>
          <br />
          Printer File: {{ print.file?.path }}
          <!--          <VImg width="150" src="img/thumbail_unknown.jpg" />-->
        </div>

        <VBtn @click="submitBatchReprints()">Submit Batch Reprint</VBtn>
      </div>
    </v-card>
  </BaseDialog>
</template>
<script lang="ts" setup>
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { useDialog } from "@/shared/dialog.composable";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { BatchService } from "@/backend/batch.service";
import { IdType } from "@/utils/id.type";
import { ReprintFileDto } from "@/models/batch/reprint.dto";
import { usePrinterStore } from "@/store/printer.store";
import { errorSummary } from "@/utils/error.utils";

const printerStore = usePrinterStore();
const inputPrinterIds = ref();
const dialog = useDialog(DialogName.BatchReprintDialog);
const loading = ref(false);
const reprintableFiles = ref<ReprintFileDto[]>([]);
const errorLoading = ref("");

onMounted(() => {
  console.debug("Mounted");
});

onBeforeUnmount(() => {
  console.debug("Unmount");
});

function onBeforeDialogOpened(_: IdType[]) {
  loading.value = true;
}

// asd
async function onDialogOpened(printerIds: IdType[]) {
  inputPrinterIds.value = printerIds;
  try {
    reprintableFiles.value = await BatchService.batchGetLastPrintedFiles(inputPrinterIds.value);
  } catch (e: any) {
    errorLoading.value = e.code.toString() ?? "";
  }
  loading.value = false;
}

async function submitBatchReprints() {
  try {
    await BatchService.batchReprintFiles(
      reprintableFiles.value
        .filter((v) => v.file?.path)
        .map((v) => ({
          printerId: v.printerId,
          path: v.file?.path || "",
        }))
    );
    printerStore.clearSelectedPrinters();
    closeDialog();
  } catch (e: any) {
    errorLoading.value = errorSummary(e);
  }
}

function closeDialog() {
  dialog.closeDialog(dialog.context());
}
</script>
