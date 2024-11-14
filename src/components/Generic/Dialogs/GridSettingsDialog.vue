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
        <span class="text-h5">
          Grid Settings
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-bind="attrs" v-on="on" class="ma-2" fab x-small>
                <v-icon>question_mark</v-icon>
              </v-btn>
            </template>
            <template v-slot:default> Change your grid rows, columns and tile settings. </template>
          </v-tooltip>
        </span>
      </v-card-title>

      <GridSettingsList />

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
import { ref } from "vue";
import { BatchService } from "@/backend/batch.service";
import { IdType } from "@/utils/id.type";
import { ReprintFileDto, ReprintState } from "@/models/batch/reprint.dto";
import { usePrinterStore } from "@/store/printer.store";
import { errorSummary } from "@/utils/error.utils";
import { useSnackbar } from "@/shared/snackbar.composable";
import GridSettingsList from "@/components/Settings/Shared/GridSettingsList.vue";

const printerStore = usePrinterStore();
const inputPrinterIds = ref();
const dialog = useDialog(DialogName.GridSettingsDialog);
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
    errorLoading.value = e.code?.toString() ?? "";
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
