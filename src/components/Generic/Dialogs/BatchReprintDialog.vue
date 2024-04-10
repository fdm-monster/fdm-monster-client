<template>
  <BaseDialog
    :id="dialog.dialogId"
    max-width="1000px"
    @beforeOpened="onBeforeDialogOpened"
    @escape="closeDialog()"
    @opened="onDialogOpened"
  >
    <v-card class="pa-4">
      <v-card-title>
        <span class="text-h5"> Batch - Submit Reprint Jobs </span>
      </v-card-title>
      <v-card-text>
        <v-alert v-if="errorLoading?.length" color="error">
          {{ errorLoading }}
        </v-alert>
        <span v-if="loading"> Loading... </span>
        <div v-else>
          <v-list dense>
            <v-subheader> Reprinted Files - Select from list </v-subheader>
            <v-list-item-group v-model="selectedItems" multiple>
              <v-list-item
                v-for="(item, i) in reprintableFiles"
                :key="i"
                :value="item"
                :disabled="
                  item.connectionState !== 'Operational' ||
                  item.reprintState !== ReprintState.LastPrintReady
                "
              >
                <v-list-item-icon>
                  <v-icon v-if="item.reprintState == ReprintState.LastPrintReady">checklist</v-icon>
                  <v-icon v-if="item.reprintState == ReprintState.NoLastPrint">
                    question_mark
                  </v-icon>
                  <v-icon v-if="item.reprintState == ReprintState.PrinterNotAvailable">
                    signal_disconnected
                  </v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title v-if="item.file?.path?.length">
                    {{ item.file?.path }}
                    <v-chip v-if="item.connectionState !== 'Operational'"> Printer busy </v-chip>
                  </v-list-item-title>
                  <v-list-item-title v-else-if="item.reprintState == ReprintState.NoLastPrint">
                    No file is present to print again
                  </v-list-item-title>
                  <v-list-item-title v-else> OctoPrint cant be reached </v-list-item-title>
                  <v-list-item-subtitle>
                    Printer '{{ printerStore.printer(item.printerId)?.name ?? "Unknown printer" }}'
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </div>

        <div class="mt-3">
          <div v-if="submitting">
            <v-progress-circular class="ma-3" indeterminate color="blue"></v-progress-circular>
            Submitting
          </div>
          <div v-else-if="selectedItems.length > 0">
            {{ selectedItems.length }} reprint selected
          </div>
          <div v-else>Must select at least one file</div>
        </div>
        <br />

        <VBtn :disabled="submitting || selectedItems.length === 0" @click="submitBatchReprints()">
          Submit Batch Reprint
        </VBtn>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="dialog.closeDialog()">Close</v-btn>
      </v-card-actions>
    </v-card>
  </BaseDialog>
</template>
<script lang="ts" setup>
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { useDialog } from "@/shared/dialog.composable";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { BatchService } from "@/backend/batch.service";
import { IdType } from "@/utils/id.type";
import { ReprintFileDto, ReprintState } from "@/models/batch/reprint.dto";
import { usePrinterStore } from "@/store/printer.store";
import { errorSummary } from "@/utils/error.utils";
import { useSnackbar } from "@/shared/snackbar.composable";

const printerStore = usePrinterStore();
const inputPrinterIds = ref();
const dialog = useDialog(DialogName.BatchReprintDialog);
const loading = ref(false);
const submitting = ref(false);
const reprintableFiles = ref<ReprintFileDto[]>([]);
const selectedItems = ref<ReprintFileDto[]>([]);
const errorLoading = ref("");
const snackbar = useSnackbar();

function onBeforeDialogOpened(_: IdType[]) {
  loading.value = true;
}

async function onDialogOpened(printerIds: IdType[]) {
  inputPrinterIds.value = printerIds;
  try {
    const response = await BatchService.batchGetLastPrintedFiles(inputPrinterIds.value);
    reprintableFiles.value = response;
    selectedItems.value = response.filter(
      (r) => r.connectionState === "Operational" && r.reprintState == ReprintState.LastPrintReady
    );
  } catch (e: any) {
    errorLoading.value = e.code.toString() ?? "";
  }

  loading.value = false;
}

async function submitBatchReprints() {
  submitting.value = true;
  try {
    await BatchService.batchReprintFiles(
      selectedItems.value
        .filter((v) => v.file?.path)
        .map((v) => ({
          printerId: v.printerId,
          path: v.file?.path || "",
        }))
    );
    printerStore.clearSelectedPrinters();
    snackbar.info("Action completed", "Your reprinted jobs are starting", 5000);
    closeDialog();
  } catch (e: any) {
    errorLoading.value = errorSummary(e);
  } finally {
    submitting.value = false;
  }
}

function closeDialog() {
  dialog.closeDialog(dialog.context());
}
</script>
