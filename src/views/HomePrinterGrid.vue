<template>
  <div>
    <v-toolbar flat>
      <v-toolbar-title>Location Map</v-toolbar-title>
      <v-spacer></v-spacer>
      <div>
        <v-switch
          v-model="autoPrint"
          disabled
          hide-details
          label="Auto-select and print"
        ></v-switch>
      </div>
      <v-btn
        class="ml-3"
        color="primary"
        type="button"
        @click="openCreatePrinterDialog()"
      >
        Create Printer
      </v-btn>
    </v-toolbar>

    <v-banner v-drop-upload="{ printers: selectedPrinters }">
      <v-row>
        <v-col>
          <v-btn color="secondary" small @click="clearSelectedPrinters()"
            >Clear selection</v-btn
          >
          <v-chip-group>
            <v-chip v-if="selectedPrinters.length === 0"
              >No printers selected</v-chip
            >
            <v-chip
              v-for="selectedPrinter in selectedPrinters"
              :key="selectedPrinter.id"
              close
              color="primary"
              @click="openPrinter(selectedPrinter)"
              @click:close="deselectPrinter(selectedPrinter)"
            >
              {{ selectedPrinter.printerName }}
            </v-chip>
          </v-chip-group>
        </v-col>
        <v-col align="right">
          <strong class="mr-2">Drop or select GCODE to print</strong>
          <br />
          <input
            ref="fileUpload"
            :multiple="false"
            accept=".gcode"
            style="display: none"
            type="file"
            @change="filesSelected()"
          />
          <v-chip-group v-if="selectedFile" class="float-end">
            <v-chip close @click:close="deselectFile()">
              {{ selectedFile.name }}
              <strong class="pl-1">{{ formatBytes(selectedFile.size) }}</strong>
            </v-chip>
          </v-chip-group>
          <br />
          <v-btn
            class="ml-2"
            color="primary"
            small
            @click="$refs.fileUpload.click()"
          >
            Select gcode file
          </v-btn>
          <v-btn
            :disabled="!selectedFile"
            class="ml-2"
            color="green"
            small
            @click="uploadFile()"
          >
            Upload gcode file
          </v-btn>
        </v-col>
      </v-row>
    </v-banner>

    <PrinterGrid class="ma-2" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { PrintersService } from "@/backend";
import type { Printer } from "@/models/printers/printer.model";
import { usePrintersStore } from "@/stores/printers";
import { useUploadsStore } from "@/stores/uploads";
import PrinterGrid from "@/components/PrinterGrid/PrinterGrid.vue";
import { convertMultiPrinterFileToQueue } from "@/utils/uploads-state.utils";

// SideNavExplorer, CreatePrinterDialog },

const printersStore = usePrintersStore();
const uploadsStore = useUploadsStore();
const viewedPrinter = undefined;
const fileUpload = ref<InstanceType<typeof HTMLInputElement>>();
let autoPrint = ref(true);
let selectedFile: File | undefined = undefined;

function selectedPrinters() {
  return printersStore.selectedPrinters;
}

async function uploadFile() {
  const accessiblePrinters = selectedPrinters().filter(
    (p) => p.apiAccessibility.accessible
  );

  if (!selectedFile) return;

  // Checking and informing user
  const incompleteListCount =
    selectedPrinters().length - accessiblePrinters.length;
  if (incompleteListCount > 0) {
    // TODO BUS
    // this.$bus.emit(
    //     infoMessageEvent,
    //     `${incompleteListCount} printers were skipped as they are not accessible or disabled (now).`
    // );
  }

  const uploads = convertMultiPrinterFileToQueue(
    accessiblePrinters,
    selectedFile
  );
  uploadsStore.queueUploads(uploads);

  fileUpload.value!.value = "";
  clearSelectedPrinters();
}

function deselectFile() {
  fileUpload.value!.value = "";
  selectedFile = undefined;
}

function filesSelected() {
  if (!fileUpload.value?.files) return (selectedFile = undefined);

  selectedFile = fileUpload.value.files[0];
}

function deselectPrinter(printer: Printer) {
  printersStore.toggleSelectedPrinter(printer);
}

function clearSelectedPrinters() {
  printersStore.resetSelectedPrinters();
}

function openPrinter(printer: Printer) {
  PrintersService.openPrinterURL(printer.printerURL);
}

function openCreatePrinterDialog() {
  printersStore.setCreateDialogOpened(true);
}
</script>
