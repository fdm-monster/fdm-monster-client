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
              width="40"
              @click="openPrinterURL()"
              v-on="on"
              @click.middle="openPrinterURL()"
              >{{ avatarInitials() }}
            </v-btn>
          </template>
          <span>Visit the {{ serviceName }} associated to this printer {{ avatarInitials() }}</span>
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
      <span v-if="!isEnabled">
        Disabled {{ serviceName }}, enable it first to get live updates
      </span>
      <span v-else>
        This {{ serviceName }} seems unreachable... Will keep trying for you
        <v-icon>hourglass_top</v-icon>
      </span>
    </v-alert>
    <v-alert
      v-if="!storedSideNavPrinter?.enabled && !storedSideNavPrinter?.disabledReason"
      color="secondary"
    >
      This OctoPrint was disabled without reason.
    </v-alert>
    <v-alert v-if="storedSideNavPrinter?.disabledReason" color="black">
      This {{ serviceName }} was disabled for maintenance: <br />
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
              <v-img v-if="isOctoPrint" :src="octoPrintIcon"></v-img>
              <span v-else-if="isMoonraker">MR</span>
              <span v-else-if="isPrusaLink">PL</span>
              <span v-else>?</span>
            </v-list-item-avatar>
            <v-list-item-content>
              <span>Open {{ serviceName }}</span>
            </v-list-item-content>
          </v-list-item>
        </template>
        <span>Visit the {{ serviceName }} associated to this printer</span>
      </v-tooltip>

      <v-tooltip v-if="isMoonraker" left>
        <template v-slot:activator="{ on, attrs }">
          <v-list-item
            class="extra-dense-list-item"
            link
            v-bind="attrs"
            v-on="on"
            @click.prevent.stop="openPrinterMainsail()"
          >
            <v-list-item-avatar class="ml-3 mr-6 ma-5" size="20px">
              <span>MA</span>
            </v-list-item-avatar>
            <v-list-item-content>
              <span>Open Mainsail</span>
            </v-list-item-content>
          </v-list-item>
        </template>
        <span>Visit Mainsail for this printer</span>
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

      <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-list-item
            class="extra-dense-list-item"
            link
            v-bind="attrs"
            v-on="on"
            @click.prevent.stop="refreshSocketState()"
          >
            <v-list-item-avatar>
              <v-icon
                :color="!isUnderMaintenance ? 'primary' : 'green'"
                class="grey-lighten-1"
                dark
              >
                autorenew
              </v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <span>Refresh State <small>- this does not affect the print!</small></span>
            </v-list-item-content>
          </v-list-item>
        </template>
        <span>
          Let FDM Monster know you are experiencing inconsistencies, reset all volatile states
        </span>
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

      <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-list-item
            :disabled="!isOnline || (!isPaused && !isPrinting)"
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
            @click.prevent.stop="clickDeleteAllFiles()"
          >
            <v-list-item-avatar>
              <v-icon>delete</v-icon>
            </v-list-item-avatar>

            <v-list-item-content> Delete files</v-list-item-content>
          </v-list-item>
        </template>
        <span>Clear all files present on {{ serviceName }} (local)</span>
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
        <span>Rebuild the file list on {{ serviceName }} (local)</span>
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
              <v-btn icon v-bind="attrs" @click="clickDownloadFile(file.path)" v-on="on">
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
                {{ file.path }}
              </span>
            </template>
            <span>
              File: {{ file.path }} <br />
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

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { generateInitials } from "@/shared/noun-adjectives.data";
import { PrinterFileService, PrintersService } from "@/backend";
import { FileDto } from "@/models/printers/printer-file.model";
import { formatBytes } from "@/utils/file-size.util";
import { usePrinterStore } from "@/store/printer.store";
import { DialogName } from "./Dialogs/dialog.constants";
import { PrinterJobService } from "@/backend/printer-job.service";
import { usePrinterStateStore } from "@/store/printer-state.store";
import { interpretStates } from "@/shared/printer-state.constants";
import { useSettingsStore } from "@/store/settings.store";
import octoPrintIcon from "@/assets/octoprint-tentacle.svg";
import {
  getServiceName,
  isMoonrakerType,
  isOctoPrintType,
  isPrusaLinkType,
} from "@/utils/printer-type.utils";
import { useQueryClient } from "@tanstack/vue-query";
import { thumbnailQueryKey } from "@/queries/thumbnail.query";
import { useDialog } from "@/shared/dialog.composable";

const queryClient = useQueryClient();
const printersStore = usePrinterStore();
const printerStateStore = usePrinterStateStore();

const fileSearch = ref<string>();
const shownFileCache = ref<FileDto[]>([]);
const drawerOpened = ref(false);
const loading = ref(true);

const storedSideNavPrinter = computed(() => printersStore.sideNavPrinter);
const printerId = computed(() => storedSideNavPrinter.value?.id);

const isOnline = computed(() =>
  printerId.value ? printerStateStore.isApiResponding(printerId.value) : false
);

const isOctoPrint = computed(() => {
  return isOctoPrintType(storedSideNavPrinter.value?.printerType);
});

const isMoonraker = computed(() => {
  return isMoonrakerType(storedSideNavPrinter.value?.printerType);
});

const isPrusaLink = computed(() => {
  return isPrusaLinkType(storedSideNavPrinter.value?.printerType);
});

const serviceName = computed(() => getServiceName(storedSideNavPrinter.value?.printerType));

const isOperational = computed(() =>
  printerId.value ? printerStateStore.isPrinterOperational(printerId.value) : false
);

const isEnabled = computed(() => {
  return storedSideNavPrinter.value?.enabled;
});

const isUnderMaintenance = computed(() => {
  return !!storedSideNavPrinter.value?.disabledReason?.length;
});

const isPrinting = computed(() => {
  return printerId.value ? printerStateStore.isPrinterPrinting(printerId.value) : false;
});

const filesListed = computed<FileDto[]>(() => {
  if (!shownFileCache.value?.length) return [];
  return (
    shownFileCache.value.filter((f) =>
      fileSearch.value?.length ? `${f.path}`.toLowerCase().includes(fileSearch.value) : true
    ) || []
  );
});

const isStoppable = computed(() => {
  if (!storedSideNavPrinter.value || !printerId.value) return false;
  return printerStateStore.isPrinterStoppable(printerId.value);
});

const isPaused = computed(() => {
  if (!storedSideNavPrinter.value || !printerId.value) return false;
  return printerStateStore.isPrinterPaused(printerId.value);
});

const canBeCleared = computed(() => {
  if (!printerId.value) {
    return false;
  }
  return shownFileCache.value?.length && printerStateStore.isApiResponding(printerId.value);
});

const currentJob = computed(() => {
  if (!printerId.value) {
    throw new Error("Printer ID not set, cannot get current job");
  }
  return printerStateStore.printerJobsById[printerId.value];
});
const currentPrintingFilePath = computed(() => {
  if (!printerId.value) {
    throw new Error("Printer ID not set, cannot get current printing file name");
  }
  return printerStateStore.printingFilePathsByPrinterId[printerId.value];
});

const printerState = computed(() => {
  if (!printerId.value || !storedSideNavPrinter.value) return null;

  const printerEvents = printerStateStore.printerEventsById[printerId.value];
  const socketState = printerStateStore.socketStatesById[printerId.value];
  const states = interpretStates(storedSideNavPrinter.value, socketState, printerEvents);

  const debugInterpretedState =
    useSettingsStore().frontendDebugSettings?.showInterpretedPrinterState;
  if (debugInterpretedState) {
    console.debug(
      "[FileExplorerSideNav] rendered for printerId",
      printerId.value,
      states?.text,
      states?.color,
      states?.rgb
    );
  }
  return states;
});

const refreshFiles = async () => {
  loading.value = true;
  const currentPrinterId = storedSideNavPrinter.value?.id;
  if (!currentPrinterId) return;
  try {
    if (printerStateStore.isApiResponding(currentPrinterId)) {
      shownFileCache.value = await printersStore.loadPrinterFiles(currentPrinterId);
    } else {
      shownFileCache.value = await PrinterFileService.getFileCache(currentPrinterId);
    }
  } finally {
    loading.value = false;
  }
};

const deleteFile = async (file: FileDto) => {
  if (!printerId.value) return;
  await printersStore.deletePrinterFile(printerId.value, file.path);
};

watch(storedSideNavPrinter, async (viewedPrinter, oldVal) => {
  drawerOpened.value = !!viewedPrinter;
  const currentPrinterId = viewedPrinter?.id;
  if (!viewedPrinter || !currentPrinterId) {
    return;
  }

  if (!shownFileCache.value || viewedPrinter.id !== oldVal?.id || !oldVal) {
    await refreshFiles();
  }
});

watch(drawerOpened, (newVal) => {
  if (!newVal) {
    printersStore.setSideNavPrinter(undefined);
  }
});

function truncateProgress(progress?: number) {
  if (!progress) return "";
  return progress?.toFixed(1);
}

function isFileBeingPrinted(file: FileDto) {
  if (!printerId.value) {
    return false;
  }

  const jobFilePath = printerStateStore.printingFilePathsByPrinterId[printerId.value];
  return jobFilePath === file.path;
}

function avatarInitials() {
  const viewedPrinter = storedSideNavPrinter.value;
  if (viewedPrinter && drawerOpened.value) {
    return generateInitials(viewedPrinter.name);
  }
}

function openPrinterURL() {
  if (!storedSideNavPrinter.value) return;
  PrintersService.openPrinterURL(storedSideNavPrinter.value.printerURL);
  closeDrawer();
}

function openPrinterMainsail() {
  if (!storedSideNavPrinter.value) return;

  const url = new URL(storedSideNavPrinter.value.printerURL);
  url.port = "8080";
  PrintersService.openPrinterURL(url.toString());
  closeDrawer();
}

async function togglePrinterConnection() {
  if (!printerId.value) return;
  if (printerStateStore.isPrinterOperational(printerId.value)) {
    return await PrintersService.sendPrinterDisconnectCommand(printerId.value);
  }
  await PrintersService.sendPrinterConnectCommand(printerId.value);
}

async function toggleEnabled() {
  if (!printerId.value) {
    throw new Error("Printer ID not set, cant toggle enabled");
  }
  if (!storedSideNavPrinter.value) {
    throw new Error("Cant toggle enabled, sidenav printer unset");
  }
  const newSetting = !storedSideNavPrinter.value.enabled;
  await PrintersService.toggleEnabled(printerId.value, newSetting);
}

async function toggleMaintenance() {
  if (!printerId.value) {
    throw new Error("Printer ID not set, cant toggle maintenance");
  }
  if (!storedSideNavPrinter.value) {
    throw new Error("Cant toggle enabled, sidenav printer unset");
  }
  if (isUnderMaintenance.value) {
    await PrintersService.updatePrinterMaintenance(printerId.value);
    return;
  }

  printersStore.setMaintenanceDialogPrinter(storedSideNavPrinter.value);
  await useDialog(DialogName.PrinterMaintenanceDialog).openDialog();
  closeDrawer();
}

async function refreshSocketState() {
  if (!printerId.value) return;
  await PrintersService.refreshSocket(printerId.value);
}

async function clickStopPrint() {
  if (!printerId.value) return;

  if (confirm("Are you sure to cancel the current print job?")) {
    await PrinterJobService.stopPrintJob(printerId.value);
  }
}

async function clickPausePrint() {
  if (!printerId.value) return;

  await PrinterJobService.pausePrintJob(printerId.value);
}

async function clickResumePrint() {
  if (!printerId.value) return;
  await PrinterJobService.resumePrintJob(printerId.value);
}

async function clickDeleteAllFiles() {
  if (!printerId.value) return;
  if (!confirm("Are you sure to delete all files for this printer?")) {
    return;
  }

  loading.value = true;
  await printersStore.deletePrinterFiles(printerId.value);
  loading.value = false;
  shownFileCache.value = printersStore.printerFiles(printerId.value);
}

async function clickSettings() {
  if (!storedSideNavPrinter.value) return;
  printersStore.setUpdateDialogPrinter(storedSideNavPrinter.value);
  await useDialog(DialogName.AddOrUpdatePrinterDialog).openDialog(storedSideNavPrinter.value);
  closeDrawer();
}

async function clickPrintFile(file: FileDto) {
  if (!printerId.value) return;
  await printerStateStore.selectAndPrintFile({
    printerId: printerId.value,
    fullPath: file.path,
  });
  await queryClient.invalidateQueries({
    queryKey: [thumbnailQueryKey, printerId.value],
    exact: true,
  });
}

function clickDownloadFile(path: string) {
  if (!printerId.value) return;
  PrinterFileService.downloadFile(printerId.value, path);
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
  font-weight: bold;
}

.pulsating-red {
  margin: 10px;
  border-radius: 15px;

  box-shadow: 0 0 0 0 rgba(0, 0, 0, 1);
}
</style>
