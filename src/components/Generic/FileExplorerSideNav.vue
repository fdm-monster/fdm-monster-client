<template>
  <v-navigation-drawer
    v-model="drawerOpened"
    absolute
    loading="true"
    right
    temporary
    width="700"
    @close="closeDrawer()"
  >
    <v-list-item>
      <v-list-item-avatar>
        <v-tooltip left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="primary"
              fab
              v-bind="attrs"
              @click="openPrinterURL()"
              v-on="on"
              @click.middle="openPrinterURL()"
            >
              {{ avatarInitials() }}
            </v-btn>
          </template>
          <span>Visit the OctoPrint associated to this printer</span>
        </v-tooltip>
      </v-list-item-avatar>
      <v-list-item-content v-if="storedSideNavPrinter">
        <v-list-item-title>
          {{ storedSideNavPrinter.name }}

          <strong v-if="!isEnabled || !isOnline" class="d-flex justify-center static-disabled">
            {{ isEnabled ? "Enabled" : "Disabled" }} -
            {{ !isOnline ? "Offline" : printerState?.text?.toUpperCase() }}
          </strong>
          <strong
            v-if="isEnabled && printerState?.text && isOperational && isOnline"
            class="pulsating-red d-flex justify-center"
          >
            Enabled - {{ printerState?.text }}
          </strong>
        </v-list-item-title>
        <v-list-item-subtitle v-if="currentJob">
          <span v-if="currentJob?.progress" class="d-flex justify-center">
            Progress:
            {{ truncateProgress(currentJob?.progress.completion) }}%
          </span>
          <v-progress-linear
            v-if="currentJob?.progress"
            :value="truncateProgress(currentJob.progress?.completion)"
            class="mt-1 mb-1"
            height="8px"
          >
          </v-progress-linear>

          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn outlined small v-bind="attrs" v-on="on">
                {{ currentPrintingFilePath }}
              </v-btn>
            </template>
            <span>{{ currentPrintingFilePath }}</span>
          </v-tooltip>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-alert v-if="!isEnabled || !isOnline" color="primary">
      <span v-if="!isEnabled"> Disabled OctoPrint, enable it first to get live updates </span>
      <span v-else>
        This OctoPrint seems unreachable... Will keep trying for you <v-icon>hourglass_top</v-icon>
      </span>
    </v-alert>
    <v-alert
      v-if="!storedSideNavPrinter?.enabled && !storedSideNavPrinter?.disabledReason"
      color="secondary"
    >
      This OctoPrint was disabled without reason.
    </v-alert>
    <v-alert v-if="storedSideNavPrinter?.disabledReason" color="black">
      This OctoPrint was disabled for maintenance: <br />
      <small>&nbsp;&nbsp;{{ storedSideNavPrinter?.disabledReason }} </small>
    </v-alert>
    <v-divider></v-divider>

    <v-list v-drop-upload="{ printers: [storedSideNavPrinter] }" dense subheader>
      <v-subheader inset>Manage FDM Monster instance</v-subheader>

      <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-list-item
            class="extra-dense-list-item"
            link
            v-bind="attrs"
            v-on="on"
            @click.prevent.stop="openPrinterURL()"
          >
            <v-list-item-avatar class="ml-3 mr-6 ma-5" size="20px">
              <v-img src="/img/octoprint-tentacle.svg"></v-img>
            </v-list-item-avatar>
            <v-list-item-content>
              <span>Open OctoPrint</span>
            </v-list-item-content>
          </v-list-item>
        </template>
        <span>Visit the OctoPrint associated to this printer</span>
      </v-tooltip>

      <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-list-item
            class="extra-dense-list-item"
            link
            v-bind="attrs"
            v-on="on"
            @click.prevent.stop="toggleEnabled()"
          >
            <v-list-item-avatar>
              <v-icon :color="isEnabled ? 'primary' : 'green'" dark> dns</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <span v-if="isEnabled">Disable Printer Location</span>
              <span v-else-if="!isEnabled">Enable Printer Location</span>
            </v-list-item-content>
          </v-list-item>
        </template>
        <span>Deactivate connection, without impacting print</span>
      </v-tooltip>

      <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-list-item
            class="extra-dense-list-item"
            link
            v-bind="attrs"
            v-on="on"
            @click.prevent.stop="toggleMaintenance()"
          >
            <v-list-item-avatar>
              <v-icon :color="!isUnderMaintenance ? 'primary' : 'green'" dark>
                construction
              </v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <span v-if="!isUnderMaintenance">Enable Maintenance</span>
              <span v-else-if="isUnderMaintenance">Complete Maintenance</span>
            </v-list-item-content>
          </v-list-item>
        </template>
        <span>Deactivate, set under repair, without impacting print</span>
      </v-tooltip>

      <v-divider></v-divider>
      <v-subheader inset>Commands</v-subheader>

      <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-list-item
            :disabled="!storedSideNavPrinter?.enabled || !isOnline"
            class="extra-dense-list-item"
            link
            v-bind="attrs"
            v-on="on"
            @click.prevent.stop="togglePrinterConnection()"
          >
            <v-list-item-avatar>
              <v-icon> usb</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <span v-if="isStoppable">Disconnect USB & Stop Print</span>
              <span v-else-if="isOperational">Disconnect USB</span>
              <span v-else>Connect USB</span>
            </v-list-item-content>
          </v-list-item>
        </template>
        <span>Disconnect USB, disrupting any print</span>
      </v-tooltip>

      <v-tooltip v-if="featureStore.hasFeature('pauseResumePrinterCommand')" left>
        <template v-slot:activator="{ on, attrs }">
          <v-list-item
            :disabled="!isOnline || !isPrinting"
            class="extra-dense-list-item"
            link
            v-bind="attrs"
            v-on="on"
            @click.prevent.stop="isPaused ? clickResumePrint() : clickPausePrint()"
          >
            <v-list-item-avatar>
              <v-icon v-if="!isPaused">pause</v-icon>
              <v-icon v-if="isPaused">play_circle_outline</v-icon>
            </v-list-item-avatar>
            <v-list-item-content
              >{{ isPaused ? "Resume print" : "Pause print" }}
            </v-list-item-content>
          </v-list-item>
        </template>
        <span>Send Pause or Resume command</span>
      </v-tooltip>

      <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-list-item
            :disabled="!isStoppable"
            class="extra-dense-list-item"
            link
            v-bind="attrs"
            v-on="on"
            @click.prevent.stop="clickStopPrint()"
          >
            <v-list-item-avatar>
              <v-icon>stop</v-icon>
            </v-list-item-avatar>
            <v-list-item-content> Cancel print</v-list-item-content>
          </v-list-item>
        </template>
        <span>Cancel print gracefully</span>
      </v-tooltip>

      <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-list-item
            :disabled="!canBeCleared"
            class="extra-dense-list-item"
            link
            v-bind="attrs"
            v-on="on"
            @click.prevent.stop="clickClearFiles()"
          >
            <v-list-item-avatar>
              <v-icon>delete</v-icon>
            </v-list-item-avatar>

            <v-list-item-content> Delete files</v-list-item-content>
          </v-list-item>
        </template>
        <span>Clear all files present on OctoPrint (local)</span>
      </v-tooltip>

      <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-list-item
            class="extra-dense-list-item"
            link
            v-bind="attrs"
            v-on="on"
            @click.prevent.stop="refreshFiles()"
          >
            <v-list-item-avatar>
              <v-icon>refresh</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>Refresh files</v-list-item-content>
          </v-list-item>
        </template>
        <span>Rebuild the file list on OctoPrint (local)</span>
      </v-tooltip>

      <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-list-item
            class="extra-dense-list-item"
            link
            v-bind="attrs"
            v-on="on"
            @click.prevent.stop="clickSettings()"
          >
            <v-list-item-avatar>
              <v-icon>settings</v-icon>
            </v-list-item-avatar>
            <v-list-item-content> Settings</v-list-item-content>
          </v-list-item>
        </template>
        <span>Edit the printer settings</span>
      </v-tooltip>
    </v-list>
    <v-divider></v-divider>
    <v-list v-drop-upload="{ printers: [storedSideNavPrinter] }" dense subheader>
      <v-subheader inset>Files - drag 'n drop!</v-subheader>

      <v-text-field
        v-model="fileSearch"
        class="ml-5 mr-5"
        clearable
        label="Search files..."
        prepend-icon="search"
      />

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

      <v-list-item
        v-for="(file, index) in filesListed"
        :key="index"
        dense
        link
        style="padding-top: 0"
      >
        <v-list-item-avatar>
          <v-tooltip left>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" @click="clickDownloadFile(file)" v-on="on">
                <v-icon>download</v-icon>
              </v-btn>
            </template>
            <span>Download GCode</span>
          </v-tooltip>
        </v-list-item-avatar>

        <v-list-item-action>
          <v-tooltip left>
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

        <v-list-item-content>
          <v-tooltip left>
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
              File: {{ file.name }} <br />
              Size: {{ formatBytes(file.size) }} <br />
              <strong>{{ isFileBeingPrinted(file) ? "Printing" : "Unused" }}</strong>
            </span>
          </v-tooltip>
        </v-list-item-content>

        <v-list-item-action>
          <v-tooltip left>
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

<script lang="ts">
import { defineComponent } from "vue";
import { PrinterDto } from "@/models/printers/printer.model";
import { generateInitials } from "@/shared/noun-adjectives.data";
import { PrinterFileService, PrintersService } from "@/backend";
import { PrinterFileDto } from "@/models/printers/printer-file.model";
import { formatBytes } from "@/utils/file-size.util";
import { usePrinterStore } from "@/store/printer.store";
import { DialogName } from "./Dialogs/dialog.constants";
import { useDialogsStore } from "@/store/dialog.store";
import { PrinterJobService } from "@/backend/printer-job.service";
import { usePrinterStateStore } from "@/store/printer-state.store";
import { interpretStates } from "@/shared/printer-state.constants";
import { useSettingsStore } from "@/store/settings.store";
import { featureFlagsList } from "@/models/server/features.model";
import { useFeatureStore } from "@/store/features.store";

interface Data {
  fileSearch?: string;
  shownFileCache?: PrinterFileDto[];
  drawerOpened: boolean;
  loading: boolean;
}

export default defineComponent({
  name: "FileExplorerSideNav",
  components: {},
  setup: () => {
    return {
      printersStore: usePrinterStore(),
      printerStateStore: usePrinterStateStore(),
      dialogsStore: useDialogsStore(),
      featureStore: useFeatureStore(),
    };
  },
  async created() {},
  async mounted() {},
  props: {},
  data: (): Data => ({
    fileSearch: undefined,
    shownFileCache: undefined,
    drawerOpened: false,
    loading: true,
  }),
  computed: {
    storedSideNavPrinter() {
      return this.printersStore.sideNavPrinter;
    },
    printerId() {
      return this.storedSideNavPrinter?.id;
    },
    isOnline() {
      console.warn(
        this.printerId,
        this.printerId ? this.printerStateStore.isApiResponding(this.printerId) : false
      );
      return this.printerId ? this.printerStateStore.isApiResponding(this.printerId) : false;
    },
    isOperational() {
      return this.printerId ? this.printerStateStore.isPrinterOperational(this.printerId) : false;
    },
    isPrinting() {
      return this.printerId ? this.printerStateStore.isPrinterPrinting(this.printerId) : false;
    },
    isEnabled() {
      return this.storedSideNavPrinter?.enabled;
    },
    isUnderMaintenance() {
      return !!this.storedSideNavPrinter?.disabledReason?.length;
    },
    filesListed() {
      return (
        this.shownFileCache?.filter((f) =>
          this.fileSearch?.length
            ? `${f.name}${f.path}`.toLowerCase().includes(this.fileSearch)
            : true
        ) || []
      );
    },
    isStoppable() {
      if (!this.storedSideNavPrinter || !this.printerId) return false;
      return this.printerStateStore.isPrinterStoppable(this.printerId);
    },
    isPaused() {
      if (!this.storedSideNavPrinter || !this.printerId) return false;
      return this.printerStateStore.isPrinterPaused(this.printerId);
    },
    canBeCleared() {
      if (!this.printerId) {
        return false;
      }
      return this.shownFileCache?.length && this.printerStateStore.isApiResponding(this.printerId);
    },
    currentJob() {
      if (!this.printerId) {
        throw new Error("Printer ID not set, cannot get current job");
      }
      return this.printerStateStore.printerJobsById[this.printerId];
    },
    currentPrintingFilePath() {
      if (!this.printerId) {
        throw new Error("Printer ID not set, cannot get current printing file name");
      }
      return this.printerStateStore.printingFilePathsByPrinterId[this.printerId];
    },
    printerState() {
      if (!this.printerId || !this.storedSideNavPrinter) return null;

      const printerEvents = this.printerStateStore.printerEventsById[this.printerId];
      const socketState = this.printerStateStore.socketStatesById[this.printerId];
      const states = interpretStates(this.storedSideNavPrinter, socketState, printerEvents);

      const debugInterpretedState =
        useSettingsStore().frontendDebugSettings?.showInterpretedPrinterState;
      if (debugInterpretedState) {
        console.debug(
          "[FileExplorerSideNav] rendered for printerId",
          this.printerId,
          states?.text,
          states?.color,
          states?.rgb
        );
      }
      return states;
    },
  },
  methods: {
    featureFlagsList() {
      return featureFlagsList;
    },
    formatBytes: formatBytes,
    truncateProgress(progress?: number) {
      if (!progress) return "";
      return progress?.toFixed(1);
    },
    isFileBeingPrinted(file: PrinterFileDto) {
      if (!this.printerId) {
        return false;
      }

      const jobFilePath = this.printerStateStore.printingFilePathsByPrinterId[this.printerId];
      return jobFilePath === file.name;
    },
    avatarInitials() {
      const viewedPrinter = this.storedSideNavPrinter;
      if (viewedPrinter && this.drawerOpened) {
        return generateInitials(viewedPrinter.name);
      }
    },
    openPrinterURL() {
      if (!this.storedSideNavPrinter) return;
      PrintersService.openPrinterURL(this.storedSideNavPrinter.printerURL);
      this.closeDrawer();
    },
    async togglePrinterConnection() {
      if (!this.printerId) return;
      if (this.printerStateStore.isPrinterOperational(this.printerId)) {
        return await PrintersService.sendPrinterDisconnectCommand(this.printerId);
      }
      await PrintersService.sendPrinterConnectCommand(this.printerId);
    },
    async toggleEnabled() {
      if (!this.printerId) {
        throw new Error("Printer ID not set, cant toggle enabled");
      }
      if (!this.storedSideNavPrinter) {
        throw new Error("Cant toggle enabled, sidenav printer unset");
      }
      const newSetting = !this.storedSideNavPrinter.enabled;
      await PrintersService.toggleEnabled(this.printerId, newSetting);
    },
    async toggleMaintenance() {
      if (!this.printerId) {
        throw new Error("Printer ID not set, cant toggle maintenance");
      }
      if (!this.storedSideNavPrinter) {
        throw new Error("Cant toggle enabled, sidenav printer unset");
      }
      if (this.isUnderMaintenance) {
        await PrintersService.updatePrinterMaintenance(this.printerId);
        return;
      }

      this.printersStore.setMaintenanceDialogPrinter(this.storedSideNavPrinter);
      this.dialogsStore.openDialog(DialogName.PrinterMaintenanceDialog);
      this.closeDrawer();
    },
    async refreshFiles() {
      this.loading = true;
      const printerId = this.storedSideNavPrinter?.id;
      if (!printerId) return;

      // Offline printer fallback
      if (this.printerStateStore.isApiResponding(printerId)) {
        this.shownFileCache = await this.printersStore.loadPrinterFiles(printerId, false);
      } else {
        this.shownFileCache = await PrinterFileService.getFileCache(printerId);
      }
      this.loading = false;
    },
    async deleteFile(file: PrinterFileDto) {
      if (!this.printerId) return;
      await this.printersStore.deletePrinterFile(this.printerId, file.path);
    },
    async clickStopPrint() {
      if (!this.printerId) return;

      if (confirm("Are you sure to cancel the current print job?")) {
        await PrinterJobService.stopPrintJob(this.printerId);
      }
    },
    async clickPausePrint() {
      if (!this.printerId) return;

      await PrinterJobService.pausePrintJob(this.printerId);
    },
    async clickResumePrint() {
      if (!this.printerId) return;
      await PrinterJobService.resumePrintJob(this.printerId);
    },
    async clickClearFiles() {
      if (!this.printerId) return;
      this.loading = true;
      await this.printersStore.clearPrinterFiles(this.printerId);
      this.loading = false;
      this.shownFileCache = this.printersStore.printerFiles(this.printerId);
    },
    clickSettings() {
      if (!this.storedSideNavPrinter) return;
      this.printersStore.setUpdateDialogPrinter(this.storedSideNavPrinter);
      this.dialogsStore.openDialog(DialogName.AddOrUpdatePrinterDialog);
      this.closeDrawer();
    },
    async clickPrintFile(file: PrinterFileDto) {
      if (!this.printerId) return;
      await this.printerStateStore.selectAndPrintFile({
        printerId: this.printerId,
        fullPath: file.path,
      });
    },
    clickDownloadFile(file: PrinterFileDto) {
      PrinterFileService.downloadFile(file);
    },
    closeDrawer() {
      this.printersStore.setSideNavPrinter(undefined);
    },
  },
  watch: {
    async storedSideNavPrinter(viewedPrinter?: PrinterDto, oldVal?: PrinterDto) {
      this.drawerOpened = !!viewedPrinter;
      const printerId = viewedPrinter?.id;
      if (!viewedPrinter || !printerId) {
        return;
      }

      if (!this.shownFileCache || viewedPrinter.id !== oldVal?.id || !oldVal) {
        await this.refreshFiles();
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
