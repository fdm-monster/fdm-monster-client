<template>
  <div v-drop-printer-position="{ x, y, printerSet: printer }">
    <v-card
      v-drop-upload="{ printers: [printer] }"
      :disabled="!printer"
      elevation="5"
      class="tile colored-tile rounded-lg"
      :class="{
        'tile-large': largeTilesEnabled,
        'tile-selected': selected,
        'tile-unselected': unselected,
        'tile-no-printer': !printer,
      }"
      @click="selectOrClearPrinterPosition()"
    >
      <div class="printer-title">{{ printer?.name ?? "&nbsp;" }}</div>

      <div class="printer-file-or-stream-viewer" v-if="!!printer && isOnline">
        <v-img
          v-if="!thumbnail?.length"
          style="opacity: 0.5; filter: grayscale(100%)"
          width="80px"
          :src="require('@/assets/logo.png')"
        />
        <v-img v-else width="80" :src="'data:image/png;base64,' + (thumbnail ?? '')" />
      </div>
      <div class="printer-file-or-stream-viewer" v-else-if="!!printer">
        <v-icon size="80" v-if="printerState?.text.includes('API')" color="secondary">
          wifi_off
        </v-icon>
        <v-icon size="80" v-if="!printer.enabled" color="secondary"> disabled_by_default </v-icon>
        <v-icon size="80" v-if="printerState?.text.includes('unset')" color="secondary">
          question_mark
        </v-icon>
      </div>

      <div class="printer-menu" v-if="printer">
        <v-btn
          small
          color="darkgray"
          style="border-radius: 7px"
          elevation="0"
          @click.prevent.stop="clickInfo()"
        >
          <v-icon dark>menu</v-icon>
        </v-btn>
      </div>

      <div class="printer-controls" v-if="printer">
        <small class="file-name">{{ currentPrintingFilePath ?? "&nbsp;" }}</small>
      </div>

      <!-- Hover controls -->
      <div class="centered-controls" v-if="printer">
        <v-btn
          :disabled="!isOnline || isPrinting"
          small
          color="darkgray"
          style="border-radius: 7px"
          elevation="0"
          @click.prevent.stop="clickOpenPrinterControlDialog()"
        >
          <v-icon>open_with</v-icon>
        </v-btn>
        <v-btn
          :disabled="!isOnline || (!isPaused && !isPrinting)"
          small
          color="darkgray"
          style="border-radius: 7px"
          elevation="0"
          @click.prevent.stop="isPaused ? clickResumePrint() : clickPausePrint()"
        >
          <v-icon v-if="!isPaused">pause</v-icon>
          <v-icon v-if="isPaused">play_arrow</v-icon>
        </v-btn>
        <v-btn
          small
          :disabled="!isOnline || (preferCancelOverQuickStop && !isPrinting)"
          color="darkgray"
          style="border-radius: 7px"
          elevation="0"
          @click.prevent.stop="preferCancelOverQuickStop ? clickStop() : clickQuickStop()"
        >
          <v-icon>{{ preferCancelOverQuickStop ? "stop" : "dangerous" }} </v-icon>
        </v-btn>
        <v-btn
          small
          color="darkgray"
          style="border-radius: 7px"
          elevation="0"
          @click.prevent.stop="clickOpenSettings()"
        >
          <v-icon>settings</v-icon>
        </v-btn>
      </div>

      <!-- Progress Bar -->
      <v-progress-linear
        v-if="printer"
        :value="currentJob?.progress?.completion"
        background-color="dark-gray"
        height="14"
        class="progress-bar"
      >
        <template v-slot:default="{ value }">
          <strong>
            {{
              largeTilesEnabled
                ? value
                  ? value?.toFixed(1) + "%"
                  : "&nbsp;"
                : currentPrintingFilePath
            }}
          </strong>

          <v-tooltip close-delay="100" color="danger" open-delay="0" top>
            <template v-slot:activator="{ on, attrs }">
              <small
                class="xsmall-resized-font text--secondary d-lg-inline d-none ml-sm-2"
                v-bind="attrs"
                v-on="on"
              >
                <span v-if="printer?.disabledReason">
                  <small> MAINTENANCE</small>
                  <v-icon class="d-none d-xl-inline" color="primary" small>info</v-icon>
                </span>
                <span v-else>
                  <small>{{
                    printerState?.text === "Operational" ? "" : printerState?.text?.toUpperCase()
                  }}</small>
                </span>
              </small>
            </template>
            Maintenance reason: <br />
            {{ printer?.disabledReason }}
          </v-tooltip>
        </template>
      </v-progress-linear>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import { computed, PropType } from "vue";
import { CustomGcodeService } from "@/backend/custom-gcode.service";
import { PrintersService } from "@/backend";
import { usePrinterStore } from "@/store/printer.store";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { useGridStore } from "@/store/grid.store";
import { FloorService } from "@/backend/floor.service";
import { useSettingsStore } from "@/store/settings.store";
import { useFloorStore } from "@/store/floor.store";
import {
  interpretStates,
  isPrinterPaused,
  isPrinterPrinting,
} from "@/shared/printer-state.constants";
import { usePrinterStateStore } from "@/store/printer-state.store";
import { PrinterDto } from "@/models/printers/printer.model";
import { useSnackbar } from "@/shared/snackbar.composable";
import { useDialog } from "@/shared/dialog.composable";
import { useFeatureStore } from "@/store/features.store";
import { PrinterJobService } from "@/backend/printer-job.service";
import { useThumbnailQuery } from "@/queries/thumbnail.query";

const defaultColor = "rgba(100,100,100,0.1)";

const props = defineProps({
  printer: { type: Object as PropType<PrinterDto | undefined>, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
});

const printerStore = usePrinterStore();
const printerStateStore = usePrinterStateStore();
const floorStore = useFloorStore();
const featureStore = useFeatureStore();
const settingsStore = useSettingsStore();
const gridStore = useGridStore();
const controlDialog = useDialog(DialogName.PrinterControlDialog);
const addOrUpdateDialog = useDialog(DialogName.AddOrUpdatePrinterDialog);
const snackbar = useSnackbar();

const { data: thumbnail } = useThumbnailQuery(props.printer?.id, settingsStore.thumbnailsEnabled);

const printerId = computed(() => props.printer?.id);

const isOnline = computed(() =>
  printerId.value ? printerStateStore.isApiResponding(printerId.value) : false
);

const isPrinting = computed(() => {
  return printerId.value ? printerStateStore.isPrinterPrinting(printerId.value) : false;
});

const isPaused = computed(() => {
  if (!printerId.value) return false;

  return printerStateStore.isPrinterPaused(printerId.value);
});

const selected = computed(() => {
  if (!printerId.value) return false;
  return printerStore.isSelectedPrinter(printerId.value);
});

const unselected = computed(() => {
  return printerStore.selectedPrinters?.length && !selected.value;
});

const preferCancelOverQuickStop = computed(() => {
  return settingsStore.preferCancelOverQuickStop;
});

const hasPrinterControlFeature = computed(() => {
  return featureStore.hasFeature("printerControlApi");
});

const largeTilesEnabled = computed(() => {
  return settingsStore.largeTiles;
});

const printerState = computed(() => {
  if (!printerId.value) return;
  const printer = printerStore.printer(printerId.value);
  if (!printer) return;

  const printerEvents = printerStateStore.printerEventsById[printerId.value];
  const socketState = printerStateStore.socketStatesById[printerId.value];
  return interpretStates(printer, socketState, printerEvents);
});

const printerStateColor = computed(() => {
  const states = printerState.value;
  if (!states) {
    return defaultColor;
  }
  return states.rgb || defaultColor;
});

const currentJob = computed(() => {
  if (!printerId.value) return;
  return printerStateStore.printerJobsById[printerId.value];
});

const currentPrintingFilePath = computed(() => {
  if (!printerId.value) return;
  return printerStateStore.printingFilePathsByPrinterId[printerId.value];
});

const clickStop = async () => {
  if (!printerId.value) return;

  if (confirm("Are you sure to cancel the current print job?")) {
    await PrinterJobService.stopPrintJob(printerId.value);
  }
};

const clickPausePrint = async () => {
  if (!printerId.value) return;

  await PrinterJobService.pausePrintJob(printerId.value);
};

const clickResumePrint = async () => {
  if (!printerId.value) return;

  await PrinterJobService.resumePrintJob(printerId.value);
};

const clickInfo = () => {
  printerStore.setSideNavPrinter(props.printer);
};

const clickRefreshSocket = async () => {
  if (!printerId.value) return;
  await PrintersService.refreshSocket(printerId.value);
  snackbar.openInfoMessage({
    title: "Refreshing OctoPrint connection state",
  });
};

const clickOpenPrinterURL = () => {
  if (!props.printer) return;
  PrintersService.openPrinterURL(props.printer.printerURL);
};

const clickOpenSettings = () => {
  printerStore.setUpdateDialogPrinter(props.printer);
  addOrUpdateDialog.openDialog();
};

const clickOpenPrinterControlDialog = async () => {
  if (!printerId.value) {
    throw new Error("PrinterId not set, cant open dialog");
  }

  await controlDialog.openDialog({ printerId });
};

const clickQuickStop = async () => {
  if (!printerId.value) return;

  if (confirm("Are you sure to abort the print in Quick Stop mode? Please reconnect after.")) {
    await CustomGcodeService.postQuickStopM112Command(printerId.value);
  }
};

const clickConnectUsb = async () => {
  if (!printerId.value) return;
  await PrintersService.sendPrinterConnectCommand(printerId.value);
};

const selectOrClearPrinterPosition = async () => {
  if (!props.printer || !printerId.value) return;
  if (gridStore.gridEditMode) {
    const floorId = floorStore.selectedFloor?.id;
    if (!floorId) throw new Error("Cant clear printer, floor not selected");
    await FloorService.deletePrinterFromFloor(floorId, printerId.value);
    return;
  }
  printerStore.toggleSelectedPrinter(props.printer);
};
</script>

<style scoped>
.tile {
  min-height: 120px;
  border: none !important;
  z-index: 1;
}

.colored-tile {
  /* background-color: #492d2d; */
  padding: 8px;
  color: #ffffff;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: background-color 0.2s;
}

.tile-selected {
  outline: 2px solid rgb(248, 2, 2);
  opacity: 1;
}

.tile-no-printer {
  background: none;
  min-height: 120px;
  border: none !important;
  outline: none;
}

.printer-title {
  font-size: 16px !important;
  font-weight: bold;
  text-align: center;
  color: #ffffff;
}

.printer-file-or-stream-viewer {
  position: absolute;
  left: 16px;
  height: calc(100% - 16px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.printer-menu {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
}

.printer-controls {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
}

.file-name {
  font-size: 14px;
  color: #bfbfbf;
}

.centered-controls {
  opacity: 0;
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 8px;
  transition: opacity 0.2s;
}

.colored-tile:hover .centered-controls {
  opacity: 1;
}

.control-icons v-btn {
  color: #ffffff;
}

.progress-bar {
  width: 100%;
  margin-top: 8px;
  background-color: #2c2c2c;
  border-radius: 7px !important;
}

.v-progress-linear__buffer,
.v-progress-linear__background {
  background-color: #333333 !important; /* Background color for progress bar */
}

.lime-green {
  background-color: #8dff5b !important; /* Bright green progress color */
}
</style>
