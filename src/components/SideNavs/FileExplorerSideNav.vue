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
          {{ avatarInitials }}
        </v-btn>
      </v-list-item-avatar>
      <v-list-item-header v-if="storedSideNavPrinter">
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
        <v-list-item-subtitle v-if="currentJob">
          <span class="d-flex justify-center">
            Progress:
            {{ truncateProgress(currentJob.progress) }}%
          </span>
          <v-progress-linear
            :value="truncateProgress(currentJob.progress)"
            class="mt-1 mb-1"
            height="8px"
          >
          </v-progress-linear>

          <v-btn outlined small>
            {{ currentJob.fileName }}
            <v-tooltip activator="parent" anchor="bottom" start>
              <span>{{ currentJob.fileName }}</span>
            </v-tooltip>
          </v-btn>
        </v-list-item-subtitle>
      </v-list-item-header>
    </v-list-item>

    <v-divider></v-divider>

    <v-list
      v-drop-upload="{ printers: [storedSideNavPrinter] }"
      dense
      subheader
    >
      <v-list-subheader :inset="true">Commands</v-list-subheader>

      <v-list-item
        :disabled="isStoppable"
        class="extra-dense-list-item"
        link
        @click.prevent.stop="togglePrinterConnection()"
      >
        <v-list-item-avatar start>
          <v-icon>usb</v-icon>
        </v-list-item-avatar>
        <v-list-item-header>
          <span v-if="isStoppable">Disconnect - stop print first</span>
          <span v-else-if="isOperational">Disconnect</span>
          <span v-else>Connect</span>
        </v-list-item-header>
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
        <v-list-item-header>
          Stop print {{ isStoppable ? "" : "- No job" }}
        </v-list-item-header>
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
        <v-list-item-header>
          Delete files {{ canBeCleared() ? "" : "- Nothing to do" }}
        </v-list-item-header>
      </v-list-item>

      <v-list-item
        class="extra-dense-list-item"
        link
        @click.prevent.stop="refreshFiles(storedSideNavPrinter)"
      >
        <v-list-item-avatar>
          <v-icon>refresh</v-icon>
        </v-list-item-avatar>
        <v-list-item-header> Refresh files</v-list-item-header>
      </v-list-item>

      <v-list-item
        class="extra-dense-list-item"
        link
        @click.prevent.stop="clickSettings()"
      >
        <v-list-item-avatar>
          <v-icon>settings</v-icon>
        </v-list-item-avatar>
        <v-list-item-header> Settings</v-list-item-header>
      </v-list-item>
    </v-list>
    <v-divider></v-divider>
    <v-list
      v-drop-upload="{ printers: [storedSideNavPrinter] }"
      density="compact"
    >
      <v-list-subheader inset>Files - drag 'n drop!</v-list-subheader>

      <!-- Empty file list -->
      <v-list-item v-if="!filesListed.length">
        <v-list-item-avatar>
          <v-icon>clear</v-icon>
        </v-list-item-avatar>
        <v-list-item-header>
          <v-list-item-title>No files to show</v-list-item-title>
        </v-list-item-header>
      </v-list-item>

      <!-- Loading file list-->
      <v-progress-linear v-if="loading" indeterminate></v-progress-linear>

      <v-list-item v-for="(file, index) in filesListed" :key="index" link>
        <v-list-item-avatar>
          <v-btn icon="download" @click="clickDownloadFile(file)">
            <v-tooltip activator="parent" anchor="bottom">
              <span>Download GCode</span>
            </v-tooltip>
          </v-btn>
        </v-list-item-avatar>

        <v-list-item-action>
          <v-btn
            :disabled="isFileBeingPrinted(file)"
            icon="play_arrow"
            @click="clickPrintFile(file)"
          >
            <v-tooltip activator="parent" anchor="bottom">
              <span>Select & Print</span>
            </v-tooltip>
          </v-btn>
        </v-list-item-action>

        <v-list-item-header>
          <span :class="{ 'current-file-print': isFileBeingPrinted(file) }">
            {{ file.name }}
            <v-tooltip activator="parent" anchor="start">
              <span>
                File: {{ file.name }} <br />
                Size: {{ formatBytes(file.size) }} <br />
                <strong>{{
                  isFileBeingPrinted(file) ? "Printing" : "Unused"
                }}</strong>
              </span>
            </v-tooltip>
          </span>
        </v-list-item-header>

        <v-list-item-action>
          <v-btn
            :disabled="isFileBeingPrinted(file)"
            icon
            @click="deleteFile(file)"
          >
            <v-icon color="grey lighten-1">delete</v-icon>
            <v-tooltip activator="parent" anchor="start">
              Delete file
            </v-tooltip>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { isPrinterStoppable } from "@/utils/printer-state.utils";
import type { PrinterFileBucket } from "@/models/printers/printer-file-bucket.model";
import type { Printer } from "@/models/printers/printer.model";
import type { PrinterFile } from "@/models/printers/printer-file.model";
import { generateInitials } from "@/shared/noun-adjectives.data";
import { PrinterFileService, PrintersService } from "@/backend";
import { formatBytes } from "@/utils/file-size.util";
import type { PrinterCurrentJob } from "@/models/printers/printer-current-job.model";

export default defineComponent({
  setup: () => {
    return {
      shownFileBucket: ref<PrinterFileBucket>(),
      printersStore: usePrintersStore(),
      printerFilesStore: usePrinterFilesStore(),
      drawerOpened: ref(false),
      loading: ref(true),
    };
  },
  computed: {
    storedSideNavPrinter() {
      return this.printersStore.sideNavPrinter;
    },
    printerId() {
      return this.storedSideNavPrinter?.id;
    },
    isOperational() {
      return this.printersStore.isPrinterOperational(this.printerId);
    },
    filesListed() {
      return this.shownFileBucket?.files || [];
    },
    isStoppable() {
      if (!this.storedSideNavPrinter) return false;
      return isPrinterStoppable(this.storedSideNavPrinter);
    },

    currentJob() {
      return this.storedSideNavPrinter?.currentJob as PrinterCurrentJob;
    },
    avatarInitials() {
      const viewedPrinter = this.storedSideNavPrinter;
      if (viewedPrinter && this.drawerOpened) {
        return generateInitials(viewedPrinter.printerName);
      }
    },
  },
  methods: {
    canBeCleared() {
      return (
        this.shownFileBucket?.files?.length &&
        this.storedSideNavPrinter?.apiAccessibility.accessible
      );
    },
    formatBytes,
    truncateProgress(progress: number) {
      if (!progress) return "";
      return progress?.toFixed(1);
    },
    isFileBeingPrinted(file: PrinterFile) {
      if (!this.storedSideNavPrinter) return false;
      // Completed job will not disappear (yet)
      if (this.storedSideNavPrinter.printerState.state === "Operational")
        return false;
      return this.storedSideNavPrinter.currentJob?.fileName === file.name;
    },
    async togglePrinterConnection() {
      if (!this.printerId) return;

      if (this.printersStore.isPrinterOperational(this.printerId)) {
        return await PrintersService.sendPrinterDisconnectCommand(
          this.printerId
        );
      }
      await PrintersService.sendPrinterConnectCommand(this.printerId);
    },
    openPrinterURL() {
      if (!this.storedSideNavPrinter) return;
      PrintersService.openPrinterURL(this.storedSideNavPrinter.printerURL);
      this.closeDrawer();
    },
    async refreshFiles(viewedPrinter?: Printer) {
      if (!viewedPrinter) return;

      this.loading = true;
      const printerId = viewedPrinter.id;
      // Offline printer fallback
      if (viewedPrinter.apiAccessibility.accessible) {
        let fileCache = await this.printerFilesStore.loadPrinterFiles({
          printerId,
          recursive: false,
        });
        this.shownFileBucket = {
          printerId,
          ...fileCache,
        };
      } else {
        const fileCache = await PrinterFileService.getFileCache(printerId);
        this.shownFileBucket = {
          printerId,
          ...fileCache,
        };
      }
      this.loading = false;
    },
    async deleteFile(file: PrinterFile) {
      if (!this.printerId) return;

      await this.printerFilesStore.deletePrinterFile({
        printerId: this.printerId,
        fullPath: file.path,
      });
    },
    async clickStop() {
      await this.printersStore.sendStopJobCommand(this.printerId);
    },
    async clickClearFiles() {
      if (!this.printerId) return;

      this.loading = true;
      await this.printerFilesStore.clearPrinterFiles(this.printerId);

      this.loading = false;
      this.shownFileBucket = this.printerFilesStore.printerFileBucket(
        this.printerId
      );
    },
    clickSettings() {
      if (!this.storedSideNavPrinter) return;
      this.printersStore.setUpdateDialogPrinter(this.storedSideNavPrinter);
      this.closeDrawer();
    },
    async clickPrintFile(file: PrinterFile) {
      if (!this.printerId) return;
      await this.printersStore.selectAndPrintFile({
        printerId: this.printerId,
        fullPath: file.path,
      });
    },
    clickDownloadFile(file: PrinterFile) {
      PrinterFileService.downloadFile(file);
    },
    closeDrawer() {
      this.printersStore.setSideNavPrinter(undefined);
    },
  },
  watch: {
    async storedSideNavPrinter(viewedPrinter?: Printer, oldVal?: Printer) {
      this.drawerOpened = !!viewedPrinter;
      const printerId = viewedPrinter?.id;
      if (!viewedPrinter || !printerId) return;

      if (
        !this.shownFileBucket ||
        viewedPrinter.id !== this.shownFileBucket.printerId ||
        !oldVal
      ) {
        await this.refreshFiles(viewedPrinter);
      }
    },
    drawerOpened(newVal: boolean) {
      // Due to the animation delay the nav model lags behind enough for SSE to pick up and override
      if (!newVal) {
        this.printersStore.setSideNavPrinter(undefined);
      }
    },
  },
});
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
