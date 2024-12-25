<template>
  <div v-drop-printer-position="{ x, y, printerSet: printer }">
    <v-card
      v-drop-upload="{ printers: [printer] }"
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
      <div class="printer-title" v-show="printer">
        {{ printer?.name ?? "&nbsp;" }}
      </div>

      <!-- Create printer - hover button-->
      <div
        v-if="!printer || gridStore.gridEditMode"
        style="position: absolute"
        :style="{
          height: largeTilesEnabled ? 'calc(120px - 20px)' : 'calc(84px - 20px)',
        }"
        class="plus-hover-icon"
      >
        <div class="d-flex flex flex-column justify-center" style="height: 100%">
          <PrinterCreateAction
            v-if="!printer"
            :floor-id="floorStore.selectedFloor?.id"
            :floor-x="x"
            :floor-y="y"
          />
          <v-btn
            v-if="printer"
            color="error"
            small
            rounded
            @click.c.capture.native.stop="selectOrClearPrinterPosition()"
          >
            <v-icon>clear</v-icon>
            Clear position
          </v-btn>
        </div>
      </div>

      <div class="printer-file-or-stream-viewer" v-if="!!printer && isOnline">
        <v-img
          v-if="!thumbnail?.length"
          style="opacity: 0.3; filter: grayscale(100%)"
          :width="tileIconThumbnailSize"
          :src="require('@/assets/logo.png')"
          alt="No thumbnail was found in GCode"
        />
        <v-img
          v-else
          :width="tileIconThumbnailSize"
          :src="'data:image/png;base64,' + (thumbnail ?? '')"
        />
      </div>
      <div class="printer-file-or-stream-viewer" v-else-if="!!printer">
        <v-icon
          :size="tileIconThumbnailSize"
          v-if="printerState?.text.includes('API')"
          color="secondary"
        >
          wifi_off
        </v-icon>
        <v-icon :size="tileIconThumbnailSize" v-if="!printer.enabled" color="secondary">
          disabled_by_default
        </v-icon>
        <v-icon
          :size="tileIconThumbnailSize"
          v-if="printerState?.text.includes('unset')"
          color="secondary"
        >
          question_mark
        </v-icon>
      </div>

      <div class="printer-menu" v-if="printer && !gridStore.gridEditMode">
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              small
              color="darkgray"
              style="border-radius: 7px"
              elevation="0"
              @click.prevent.stop="clickInfo()"
            >
              <v-icon dark>menu</v-icon>
            </v-btn>
          </template>
          <template v-slot:default>Open printer details</template>
        </v-tooltip>
      </div>

      <div
        class="printer-controls"
        v-if="printer && !gridStore.gridEditMode"
        style="overflow: clip"
        :style="{
          position: largeTilesEnabled ? 'inherit' : 'absolute',
          top: largeTilesEnabled ? 'inherit' : '30px',
        }"
      >
        <small class="file-name">{{ currentPrintingFilePath ?? "&nbsp;" }}</small>
      </div>

      <!-- Hover controls -->
      <div class="centered-controls" v-if="printer && !gridStore.gridEditMode">
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              v-if="hasPrinterControlFeature"
              :disabled="!isOnline || !isOperational"
              x-small
              :small="largeTilesEnabled"
              color="darkgray"
              style="border-radius: 7px"
              elevation="0"
              @click.prevent.stop="clickOpenPrinterControlDialog()"
            >
              <v-icon>open_with</v-icon>
            </v-btn>
          </template>
          <template v-slot:default>Move and home printer</template>
        </v-tooltip>

        <!-- Connect USB -->
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-if="!isOperational && isOnline"
              v-bind="attrs"
              v-on="on"
              x-small
              :small="largeTilesEnabled"
              color="darkgray"
              style="border-radius: 7px"
              elevation="0"
              @click.prevent.stop="clickConnectUsb()"
            >
              <v-icon>usb</v-icon>
            </v-btn>
          </template>
          <template v-slot:default>Connect USB (only for OctoPrint)</template>
        </v-tooltip>

        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              x-small
              :small="largeTilesEnabled"
              color="darkgray"
              style="border-radius: 7px"
              elevation="0"
              @click.prevent.stop="clickRefreshSocket()"
            >
              <v-icon>refresh</v-icon>
            </v-btn>
          </template>
          <template v-slot:default>Reload printer websocket and refresh all states</template>
        </v-tooltip>

        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              :disabled="!isOnline || (!isPaused && !isPrinting)"
              x-small
              :small="largeTilesEnabled"
              color="darkgray"
              style="border-radius: 7px"
              elevation="0"
              @click.prevent.stop="isPaused ? clickResumePrint() : clickPausePrint()"
            >
              <v-icon v-if="!isPaused">pause</v-icon>
              <v-icon v-if="isPaused">play_arrow</v-icon>
            </v-btn>
          </template>
          <template v-slot:default>
            {{ isPaused ? "Resume print" : "Pause print" }}
          </template>
        </v-tooltip>

        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              x-small
              :small="largeTilesEnabled"
              :disabled="!isOnline || (preferCancelOverQuickStop && !isPrinting && !isPaused)"
              color="darkgray"
              style="border-radius: 7px"
              elevation="0"
              @click.prevent.stop="preferCancelOverQuickStop ? clickStop() : clickQuickStop()"
            >
              <v-icon>{{ preferCancelOverQuickStop ? "stop" : "dangerous" }} </v-icon>
            </v-btn>
          </template>
          <template v-slot:default>{{
            preferCancelOverQuickStop
              ? "Cancel current print gracefully"
              : "Perform quick stop of printer"
          }}</template>
        </v-tooltip>

        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              x-small
              :small="largeTilesEnabled"
              color="darkgray"
              style="border-radius: 7px"
              elevation="0"
              @click.prevent.stop="clickOpenSettings()"
            >
              <v-icon>settings</v-icon>
            </v-btn>
          </template>
          <template v-slot:default>Open printer settings</template>
        </v-tooltip>
      </div>

      <!-- Progress Bar -->
      <v-progress-linear
        v-if="printer && !gridStore.gridEditMode"
        :value="currentJob?.progress?.completion"
        background-color="dark-gray"
        height="14"
        class="progress-bar"
      >
        <template v-slot:default="{ value }">
          <strong>
            {{ value?.toFixed(1) + "%" }}
          </strong>

          <v-tooltip
            close-delay="100"
            color="danger"
            open-delay="0"
            top
            :disabled="printer?.enabled"
          >
            <template v-slot:activator="{ on, attrs }">
              <span class="xsmall-resized-font text--secondary ml-sm-2" v-bind="attrs" v-on="on">
                <span v-if="printer?.disabledReason">
                  <small> MAINTENANCE</small>
                  <v-icon class="d-none d-xl-inline" color="primary" small>info</v-icon>
                </span>
                <span v-else>
                  <small
                    :style="{
                      'background-color': printerStateColor + '99',
                      'border-left': '5px solid ' + printerStateColor + 'ff',
                      padding: '5px',
                    }"
                  >
                    {{ printerState?.text?.toUpperCase() }}
                  </small>
                </span>
              </span>
            </template>

            <template #default>
              <span>
                {{ printer?.disabledReason ?? "Printer disabled" }}
              </span>
            </template>
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
import { interpretStates } from "@/shared/printer-state.constants";
import { usePrinterStateStore } from "@/store/printer-state.store";
import { PrinterDto } from "@/models/printers/printer.model";
import { useSnackbar } from "@/shared/snackbar.composable";
import { useDialog } from "@/shared/dialog.composable";
import { useFeatureStore } from "@/store/features.store";
import { PrinterJobService } from "@/backend/printer-job.service";
import { useThumbnailQuery } from "@/queries/thumbnail.query";
import PrinterCreateAction from "@/components/Generic/Actions/PrinterCreateAction.vue";

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

const printerId = computed(() => props.printer?.id);

const { data: thumbnail } = useThumbnailQuery(printerId, settingsStore.thumbnailsEnabled);

const largeTilesEnabled = computed(() => settingsStore.largeTiles);
const tileIconThumbnailSize = computed(() => (largeTilesEnabled.value ? "80px" : "40px"));

const isOnline = computed(() =>
  printerId.value ? printerStateStore.isApiResponding(printerId.value) : false
);

const isOperational = computed(() =>
  printerId.value ? printerStateStore.isPrinterOperational(printerId.value) : false
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
  if (!props.printer || !printerId.value) {
    return;
  }

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
  min-height: 84px;
  max-height: 92px;
}

.tile-large {
  min-height: 120px;
}

.colored-tile {
  padding: 8px;
  color: #ffffff;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: background-color 0.2s;
}

.tile-selected {
  outline: 2px solid var(--v-primary-base);
  opacity: 1;
}

.tile.tile-no-printer {
  background-color: #171717;
  height: 84px;
  border: 2px #3a3a3a dashed !important;
  outline: none;
}

.tile.tile-large {
  min-height: 120px;
}

.tile-no-printer:hover {
  background-color: #2a2a2a;
  cursor: not-allowed;
}

.plus-hover-icon {
  display: none;
}

.tile-no-printer:hover .plus-hover-icon {
  display: block;
}

.tile:hover .plus-hover-icon {
  display: block;
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
  height: calc(100% - 36px);
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
  margin-top: 0;
  margin-bottom: 8px;
}

.file-name {
  font-size: 14px;
  color: #bfbfbf;
  max-width: 70%;
  display: block;
  text-wrap: nowrap;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.centered-controls {
  opacity: 0;
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 8px;
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
  background-color: #2c2c2c;
  border-radius: 7px !important;
}
</style>
