<template>
  <div>
    <HomeToolbar />

    <v-banner v-if="!gridStore.gridEditMode" v-drop-upload="{ printers: selectedPrinters }">
      <v-row style="margin-bottom: -5px">
        <v-col style="padding: 5px 0 0 15px">
          <v-chip-group class="d-inline-block">
            <v-chip v-if="selectedPrinters.length === 0" small>No selected printers</v-chip>
            <v-chip
              v-for="selectedPrinter in selectedPrinters"
              :key="selectedPrinter.id"
              close
              color="primary"
              small
              @click="openPrinter(selectedPrinter)"
              @click:close="deselectPrinter(selectedPrinter)"
            >
              {{ selectedPrinter.name }}
            </v-chip>
          </v-chip-group>
        </v-col>
        <v-col align="right" style="padding: 0">
          <v-chip-group v-if="selectedFile" class="float-end">
            <v-chip close @click:close="deselectFile()">
              {{ selectedFile.name }}
              <strong class="pl-1">{{ formatBytes(selectedFile.size) }}</strong>
            </v-chip>
          </v-chip-group>
          <br />
          <v-btn
            :disabled="!hasPrintersSelected"
            color="primary"
            x-small
            @click="batchReprintFiles()"
          >
            <v-icon class="pr-2" small>refresh</v-icon>
            Batch reprint
          </v-btn>
          <v-btn
            :color="hasPrintersSelected ? 'primary' : 'secondary'"
            class="ml-2"
            x-small
            @click="clearSelectedPrinters()"
          >
            <v-icon class="pr-2" small>delete</v-icon>
            Clear all ({{ selectedPrinters.length }})
          </v-btn>

          <v-btn class="ml-2" color="secondary" x-small @click="$refs.fileUpload?.click()">
            Select gcode file
          </v-btn>
          <v-btn
            :disabled="!selectedFile"
            class="ml-2"
            color="green"
            x-small
            @click="uploadFile(false)"
          >
            Upload only
          </v-btn>
          <v-btn
            :disabled="!selectedFile"
            class="ml-2 mr-5"
            color="green"
            x-small
            @click="uploadFile(true)"
          >
            Upload and print
          </v-btn>
          <input
            ref="fileUpload"
            :multiple="false"
            accept=".gcode"
            style="display: none"
            type="file"
            @change="filesSelected()"
          />
        </v-col>
      </v-row>
    </v-banner>

    <PrinterGrid class="ma-2" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import PrinterGrid from "@/components/PrinterGrid/PrinterGrid.vue";
import { PrinterDto } from "@/models/printers/printer.model";
import { PrintersService } from "@/backend";
import { formatBytes } from "@/utils/file-size.util";
import { convertMultiPrinterFileToQueue } from "@/utils/uploads-state.utils";
import HomeToolbar from "@/components/PrinterGrid/HomeToolbar.vue";
import { usePrinterStore } from "@/store/printer.store";
import { useUploadsStore } from "@/store/uploads.store";
import { usePrinterStateStore } from "@/store/printer-state.store";
import { useGridStore } from "@/store/grid.store";
import { useSnackbar } from "@/shared/snackbar.composable";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { useDialog } from "@/shared/dialog.composable";

const gridStore = useGridStore();
const printersStore = usePrinterStore();
const printerStateStore = usePrinterStateStore();
const uploadsStore = useUploadsStore();
const snackbar = useSnackbar();

const selectedFile = ref<File | undefined>(undefined);
const hasPrintersSelected = computed(() => printersStore.selectedPrinters.length > 0);
const selectedPrinters = computed(() => printersStore.selectedPrinters);
const fileUpload = ref<HTMLInputElement | null>(null);

const deselectFile = () => {
  if (fileUpload.value) {
    fileUpload.value.value = "";
    selectedFile.value = undefined;
  }
};

const clearSelectedPrinters = () => {
  printersStore.clearSelectedPrinters();
};

const batchReprintFiles = async () => {
  await useDialog(DialogName.BatchReprintDialog).handleAsync(
    printersStore.selectedPrinters?.map((p) => p.id)
  );
};

const uploadFile = (startPrint: boolean) => {
  const selectedPrintersValue = selectedPrinters.value;
  const accessiblePrinters = selectedPrintersValue.filter((p) =>
    printerStateStore.isApiResponding(p.id)
  );

  if (!selectedFile.value) return;

  // Checking and informing user
  const incompleteListCount = selectedPrintersValue.length - accessiblePrinters.length;
  if (incompleteListCount > 0) {
    snackbar.openInfoMessage({
      title: `${incompleteListCount} printers inaccessible`,
      subtitle: "These were skipped from uploading.",
    });
  }

  const uploads = convertMultiPrinterFileToQueue(
    accessiblePrinters,
    selectedFile.value,
    startPrint
  );
  uploadsStore.queueUploads(uploads);

  if (fileUpload.value) {
    fileUpload.value.value = "";
  }
  clearSelectedPrinters();
};

const filesSelected = () => {
  if (fileUpload.value && fileUpload.value.files) {
    selectedFile.value = fileUpload.value.files[0];
  } else {
    selectedFile.value = undefined;
  }
};

const deselectPrinter = (printer: PrinterDto) => {
  printersStore.toggleSelectedPrinter(printer);
};

const openPrinter = (printer: PrinterDto) => {
  PrintersService.openPrinterURL(printer.printerURL);
};
</script>
