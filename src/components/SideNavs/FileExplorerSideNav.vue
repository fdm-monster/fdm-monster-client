<template>
  <v-navigation-drawer
      v-model="drawerOpened"
      absolute
      loading="true"
      right
      temporary
      width="500"
      @close="closeDrawer()"
  >
    <v-list-item>
      <v-list-item-avatar>
        <v-btn
            color="primary"
            fab
            @click="openPrinterURL()"
            @click.middle="openPrinterURL()"
        >
          {{ avatarInitials() }}
        </v-btn>
      </v-list-item-avatar>
      <v-list-item-content v-if="storedSideNavPrinter">
        <v-list-item-title>
          {{ storedSideNavPrinter.printerName }}
          <strong
              v-if="storedSideNavPrinter.printerState.state === 'Operational'"
              class="float-end"
          >
            {{ storedSideNavPrinter.printerState.state }}
          </strong>
          <strong
              v-if="
              !storedSideNavPrinter.enabled ||
              !storedSideNavPrinter.apiAccessibility.accessible
            "
              class="float-end"
          >
            OFFLINE/DISABLED
          </strong>
          <strong
              v-if="
              storedSideNavPrinter.printerState.state !== 'Operational' &&
              storedSideNavPrinter.apiAccessibility.accessible
            "
              class="float-end pulsating-red"
          >
            {{ storedSideNavPrinter.printerState.state }}
          </strong>
        </v-list-item-title>
        <v-list-item-subtitle v-if="storedSideNavPrinter.currentJob">
          <span
              v-if="storedSideNavPrinter.currentJob.progress"
              class="d-flex justify-center"
          >
            Progress:
            {{ truncateProgress(storedSideNavPrinter.currentJob.progress) }}%
          </span>
          <v-progress-linear
              v-if="storedSideNavPrinter.currentJob"
              :value="truncateProgress(storedSideNavPrinter.currentJob.progress)"
              class="mt-1 mb-1"
              height="8px"
          >
          </v-progress-linear>

          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn outlined small v-bind="attrs" v-on="on">
                {{ currentJob().fileName }}
              </v-btn>
            </template>
            <span>{{ currentJob().fileName }}</span>
          </v-tooltip>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-divider></v-divider>

    <v-list
        v-drop-upload="{ printers: [storedSideNavPrinter] }"
        dense
        subheader
    >
      <v-subheader inset>Commands</v-subheader>

      <v-list-item
          :disabled="isStoppable"
          class="extra-dense-list-item"
          link
          @click.prevent.stop="togglePrinterConnection()"
      >
        <v-list-item-avatar>
          <v-icon>usb</v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
          <span v-if="isStoppable">Disconnect - stop print first</span>
          <span v-else-if="isOperational">Disconnect</span>
          <span v-else>Connect</span>
        </v-list-item-content>
      </v-list-item>

      <v-list-item
          :disabled="!isStoppable"
          class="extra-dense-list-item"
          link
          @click.prevent.stop="clickStop()"
      >
        <v-list-item-avatar>
          <v-icon>stop</v-icon>
        </v-list-item-avatar>
        <v-list-item-content
        >Stop print {{ isStoppable ? "" : "- No job" }}
        </v-list-item-content
        >
      </v-list-item>

      <v-list-item
          :disabled="!canBeCleared"
          class="extra-dense-list-item"
          link
          @click.prevent.stop="clickClearFiles()"
      >
        <v-list-item-avatar>
          <v-icon>delete</v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
          Delete files {{ canBeCleared ? "" : "- Nothing to do" }}
        </v-list-item-content>
      </v-list-item>

      <v-list-item
          class="extra-dense-list-item"
          link
          @click.prevent.stop="refreshFiles(storedSideNavPrinter)"
      >
        <v-list-item-avatar>
          <v-icon>refresh</v-icon>
        </v-list-item-avatar>
        <v-list-item-content>Refresh files</v-list-item-content>
      </v-list-item>

      <v-list-item
          class="extra-dense-list-item"
          link
          @click.prevent.stop="clickSettings()"
      >
        <v-list-item-avatar>
          <v-icon>settings</v-icon>
        </v-list-item-avatar>
        <v-list-item-content> Settings</v-list-item-content>
      </v-list-item>
    </v-list>
    <v-divider></v-divider>
    <v-list
        v-drop-upload="{ printers: [storedSideNavPrinter] }"
        dense
        subheader
    >
      <v-subheader inset>Files - drag 'n drop!</v-subheader>

      <!-- Empty file list -->
      <v-list-item v-if="!filesListed.length">
        <v-list-item-avatar>
          <v-icon>clear</v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>No files to show</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <!-- Loading file list-->
      <v-progress-linear v-if="loading" indeterminate></v-progress-linear>

      <v-list-item v-for="(file, index) in filesListed" :key="index" link>
        <v-list-item-avatar>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                  icon
                  v-bind="attrs"
                  @click="clickDownloadFile(file)"
                  v-on="on"
              >
                <v-icon>download</v-icon>
              </v-btn>
            </template>
            <span>Download GCode</span>
          </v-tooltip>
        </v-list-item-avatar>

        <v-list-item-action>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                  :disabled="isFileBeingPrinted(file)"
                  icon
                  v-bind="attrs"
                  @click="clickPrintFile(file)"
                  v-on="on"
              >
                <v-icon>play_arrow</v-icon>
              </v-btn>
            </template>
            <span>Select & Print</span>
          </v-tooltip>
        </v-list-item-action>

        <v-list-item-icon>
          <v-icon>{{ file.icon }}</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <span
                  :class="{ 'current-file-print': isFileBeingPrinted(file) }"
                  v-bind="attrs"
                  v-on="on"
              >
                {{ file.name }}
              </span>
            </template>
            <span>
              File: {{ file.name }} <br/>
              Size: {{ formatBytes(file.size) }} <br/>
              <strong>{{
                  isFileBeingPrinted(file) ? "Printing" : "Unused"
                }}</strong>
            </span>
          </v-tooltip>
          <v-list-item-title></v-list-item-title>
        </v-list-item-content>

        <v-list-item-action>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                  :disabled="isFileBeingPrinted(file)"
                  icon
                  v-bind="attrs"
                  @click="deleteFile(file)"
                  v-on="on"
              >
                <v-icon color="grey lighten-1">delete</v-icon>
              </v-btn>
            </template>
            <span> Delete file </span>
          </v-tooltip>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
import {formatBytes} from "@/utils/file-size.util";
import {isPrinterStoppable} from "@/utils/printer-state.utils";
import {usePrintersStore} from "@/stores/printers";
import {computed, ref, watch} from "vue";
import type {PrinterFileBucket} from "@/models/printers/printer-file-bucket.model";
import type {Printer} from "@/models/printers/printer.model";
import type {PrinterFile} from "@/models/printers/printer-file.model";
import {generateInitials} from "@/constants/noun-adjectives.data";
import {PrinterFileService, PrintersService} from "@/backend";
import {usePrinterFilesStore} from "@/stores/printer-files";

let shownFileBucket: PrinterFileBucket | undefined;
const printersStore = usePrintersStore();
const printerFilesStore = usePrinterFilesStore();
let drawerOpened = ref(false);
let loading = ref(true);

const storedSideNavPrinter = computed(() => printersStore.sideNavPrinter);
const printerId = computed(() => storedSideNavPrinter?.value?.id);
const isOperational = computed(() =>
    printersStore.isPrinterOperational(printerId.value)
);
const filesListed = computed(() => shownFileBucket?.files || []);
const isStoppable = computed(() => {
  if (!storedSideNavPrinter.value) return false;
  return isPrinterStoppable(storedSideNavPrinter.value);
});

function canBeCleared() {
  return (
      shownFileBucket?.files?.length &&
      storedSideNavPrinter?.value?.apiAccessibility.accessible
  );
}

function truncateProgress(progress: number) {
  if (!progress) return "";
  return progress?.toFixed(1);
}

watch(
    storedSideNavPrinter,
    async (viewedPrinter?: Printer, oldVal?: Printer) => {
      drawerOpened.value = !!viewedPrinter;
      const printerId = viewedPrinter?.id;
      if (!viewedPrinter || !printerId) return;

      if (
          !shownFileBucket ||
          viewedPrinter.id !== shownFileBucket.printerId ||
          !oldVal
      ) {
        await refreshFiles(viewedPrinter);
      }
    }
);

watch(drawerOpened, (newVal: boolean) => {
  // Due to the animation delay the nav model lags behind enough for SSE to pick up and override
  if (!newVal) {
    printersStore.setSideNavPrinter(undefined);
  }
});

function isFileBeingPrinted(file: PrinterFile) {
  if (!storedSideNavPrinter.value) return false;
  // Completed job will not disappear (yet)
  if (storedSideNavPrinter.value.printerState.state === "Operational")
    return false;
  return storedSideNavPrinter.value.currentJob?.fileName === file.name;
}

function currentJob() {
  return storedSideNavPrinter?.value?.currentJob || {};
}

function avatarInitials() {
  const viewedPrinter = storedSideNavPrinter.value;
  if (viewedPrinter && drawerOpened) {
    return generateInitials(viewedPrinter.printerName);
  }
}

function openPrinterURL() {
  if (!storedSideNavPrinter.value) return;
  PrintersService.openPrinterURL(storedSideNavPrinter.value.printerURL);
  closeDrawer();
}

async function togglePrinterConnection() {
  if (!printerId.value) return;
  if (printersStore.isPrinterOperational(printerId.value)) {
    return await PrintersService.sendPrinterDisconnectCommand(printerId.value);
  }
  await PrintersService.sendPrinterConnectCommand(printerId.value);
}

async function refreshFiles(viewedPrinter: Printer) {
  loading.value = true;
  const printerId = viewedPrinter.id;
  // Offline printer fallback
  if (viewedPrinter.apiAccessibility.accessible) {
    let fileCache = await printerFilesStore.loadPrinterFiles({
      printerId,
      recursive: false,
    });
    shownFileBucket = {
      printerId,
      ...fileCache,
    };
  } else {
    const fileCache = await PrinterFileService.getFileCache(printerId);
    shownFileBucket = {
      printerId,
      ...fileCache,
    };
  }
  loading.value = false;
}

async function deleteFile(file: PrinterFile) {
  if (!printerId.value) return;

  await printerFilesStore.deletePrinterFile({
    printerId: printerId.value,
    fullPath: file.path,
  });
}

async function clickStop() {
  await printersStore.sendStopJobCommand(printerId.value);
}

async function clickClearFiles() {
  if (!printerId.value) return;

  loading.value = true;
  await printerFilesStore.clearPrinterFiles(printerId.value);

  loading.value = false;
  shownFileBucket = printerFilesStore.printerFileBucket(printerId.value);
}

function clickSettings() {
  if (!storedSideNavPrinter.value) return;
  printersStore.setUpdateDialogPrinter(storedSideNavPrinter.value);
  closeDrawer();
}

async function clickPrintFile(file: PrinterFile) {
  if (!printerId.value) return;
  await printersStore.selectAndPrintFile({
    printerId: printerId.value,
    fullPath: file.path,
  });
}

function clickDownloadFile(file: PrinterFile) {
  PrinterFileService.downloadFile(file);
}

function closeDrawer() {
  printersStore.setSideNavPrinter(undefined);
}
</script>

<style>
.extra-dense-list-item {
  margin-top: -7px;
}

.current-file-print {
  color: red;
}

.pulsating-red {
  background: darkred;
  margin: 10px;
  border-radius: 15px;

  box-shadow: 0 0 0 0 rgba(0, 0, 0, 1);
  transform: scale(1);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
}
</style>
