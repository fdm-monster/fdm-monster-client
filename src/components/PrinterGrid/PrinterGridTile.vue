<template>
  <div v-drop-printer-position="{ x, y, printerSet: printer }">
    <v-card
      v-drop-upload="{ printers: [printer] }"
      :class="{
        'tile-large': largeTilesEnabled,
        'tile-selected': selected,
        'tile-unselected': unselected,
        'tile-setup': printer,
      }"
      :disabled="!printer"
      :style="{
        'background-color':
          !gridStore.gridEditMode || !printer ? printerStateColor : 'rgba(1,1,1,0)',
      }"
      class="tile"
      outlined
      tile
      @click="selectOrUnplacePrinter()"
    >
      <div
        v-if="printer?.printerType !== undefined"
        class="printer-type-indicator"
        style="position: absolute; top: 5%; right: 5%; font-size: 14px; font-weight: bold"
      >
        {{ printer.printerType === 1 ? "KL" : "OP" }}
      </div>

      <v-icon
        v-if="printerState?.text.includes('API')"
        color="primary"
        size="70"
        style="opacity: 0.2; position: absolute; top: 5%; right: 10%"
      >
        wifi_off
      </v-icon>
      <v-icon
        v-if="printerState?.text.includes('USB')"
        color="primary"
        size="70"
        style="opacity: 0.2; position: absolute; top: 5%; right: 10%"
      >
        usb_off
      </v-icon>
      <v-container v-if="printer?.id" class="tile-inner fill-height">
        <small class="small-resized-font">
          {{ printer?.name }}
        </small>
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn class="float-right d-inline d-xl-none" icon v-bind="attrs" v-on="on">
              <v-icon>more_vert</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item :close-on-click="true" @click="clickInfo()">
              <v-icon>info</v-icon>
              &nbsp;Details
            </v-list-item>
            <v-list-item
              v-if="hasPrinterControlFeature"
              :close-on-click="true"
              @click="clickOpenPrinterControlDialog()"
            >
              <v-icon>open_with</v-icon>
              &nbsp;Control
            </v-list-item>
            <v-list-item :close-on-click="true" @click="clickOpenPrinterURL()">
              <v-icon>directions</v-icon>
              &nbsp;Visit {{ getServiceName(printer.printerType) }}
            </v-list-item>
            <v-list-item :close-on-click="true" @click="clickOpenSettings()">
              <v-icon>settings</v-icon>
              &nbsp;Edit Printer
            </v-list-item>
            <v-list-item :close-on-click="true" @click="clickQuickStop()">
              <v-icon>stop</v-icon>
              &nbsp;Quick Stop
            </v-list-item>
          </v-list>
        </v-menu>
        <div v-if="!gridStore.gridEditMode" class="float-right d-none d-xl-inline">
          <!-- Connect USB -->
          <v-btn
            v-if="
              !printerStateStore.isPrinterOperational(printer?.id) &&
              printerStateStore.isApiResponding(printer?.id)
            "
            icon
            @click.prevent.stop="clickConnectUsb()"
          >
            <v-icon>usb</v-icon>
          </v-btn>

          <!-- Printer control button -->
          <v-tooltip
            v-if="hasPrinterControlFeature && printerStateStore.isPrinterOperational(printer?.id)"
            bottom
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                elevation="4"
                icon
                size="36"
                v-bind="attrs"
                v-on="on"
                @click.prevent.stop="clickOpenPrinterControlDialog()"
              >
                <v-icon>open_with</v-icon>
              </v-btn>
            </template>
            <template v-slot:default>
              <span>Control your printer head or extruder.</span>
            </template>
          </v-tooltip>

          <!-- Quick stop button -->
          <v-tooltip v-if="printerStateStore.isPrinterOperational(printer?.id)" bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                elevation="4"
                icon
                size="36"
                v-bind="attrs"
                v-on="on"
                @click.prevent.stop="clickQuickStop()"
              >
                <v-icon>dangerous</v-icon>
              </v-btn>
            </template>
            <template v-slot:default>
              <span>Send a quick stop GCode, causing the printer to cease immediately.</span>
            </template>
          </v-tooltip>

          <!-- Refresh connectivity button -->
          <v-tooltip
            v-if="printer.enabled && printerStateStore.isPrinterNotOnline(printer.id)"
            bottom
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                elevation="4"
                icon
                size="36"
                v-bind="attrs"
                v-on="on"
                @click.prevent.stop="clickRefreshSocket()"
              >
                <v-icon>autorenew</v-icon>
              </v-btn>
            </template>
            <template v-slot:default>
              <span>Retry connecting to OctoPrint API</span>
            </template>
          </v-tooltip>
          <v-btn elevation="5" icon @click.prevent.stop="clickInfo()">
            <v-icon>menu_open</v-icon>
          </v-btn>
        </div>
        <div v-else class="float-end">
          <strong class="pl-5 pr-5" color="primary">
            <v-icon>disabled_visible</v-icon>
            Click to clear
          </strong>
        </div>
        <br />

        <v-tooltip
          :disabled="!printer?.disabledReason"
          close-delay="100"
          color="danger"
          open-delay="0"
          top
        >
          <template v-slot:activator="{ on, attrs }">
            <small
              class="xsmall-resized-font text--secondary d-lg-inline d-none"
              v-bind="attrs"
              v-on="on"
            >
              <span v-if="printer?.disabledReason">
                <small> MAINTENANCE</small>
                <v-icon class="d-none d-xl-inline" color="primary" small>info</v-icon>
              </span>
              <span v-else>
                <small>{{ printerState?.text?.toUpperCase() }}</small>
              </span>
            </small>
          </template>
          Maintenance reason: <br />
          {{ printer.disabledReason }}
        </v-tooltip>
        <small v-if="largeTilesEnabled && currentPrintingFilePath">
          <strong>File:</strong> {{ currentPrintingFilePath }}
        </small>
      </v-container>
      <v-container v-else-if="gridStore.gridEditMode">
        <v-icon size="48">add</v-icon>
        Place printer
      </v-container>
      <v-progress-linear
        v-if="currentJob?.progress"
        :value="currentJob.progress.completion"
        absolute
        bottom
        color="green"
        height="13"
      >
        <span class="xsmall-resized-font">{{
          largeTilesEnabled
            ? currentJob?.progress?.completion
              ? currentJob?.progress?.completion?.toFixed(1) + "%"
              : "-"
            : currentPrintingFilePath
        }}</span>
      </v-progress-linear>
    </v-card>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
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
import { getServiceName } from "@/utils/printer-type.utils";

const defaultColor = "rgba(100,100,100,0.1)";

export default defineComponent({
  name: "PrinterGridTile",
  methods: { getServiceName },
  props: {
    printer: { type: Object as PropType<PrinterDto | undefined>, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  setup(props) {
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

    const selected = computed(() => {
      if (!printerId.value) return false;
      return printerStore.isSelectedPrinter(printerId.value);
    });

    const unselected = computed(() => {
      return printerStore.selectedPrinters?.length && !selected.value;
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

    const selectOrUnplacePrinter = async () => {
      if (!props.printer || !printerId.value) return;
      if (gridStore.gridEditMode) {
        const floorId = floorStore.selectedFloor?.id;
        if (!floorId) throw new Error("Cant clear printer, floor not selected");
        await FloorService.deletePrinterFromFloor(floorId, printerId.value);
        return;
      }
      printerStore.toggleSelectedPrinter(props.printer);
    };

    return {
      selected,
      unselected,
      largeTilesEnabled,
      printerState,
      printerStateColor,
      currentJob,
      currentPrintingFilePath,
      gridStore,
      printerStateStore,
      hasPrinterControlFeature,
      clickInfo,
      clickRefreshSocket,
      clickOpenPrinterControlDialog,
      clickOpenPrinterURL,
      clickOpenSettings,
      clickQuickStop,
      clickConnectUsb,
      selectOrUnplacePrinter,
    };
  },
});
</script>

<style>
.tile {
  min-height: 75px;
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
  user-select: none; /* Standard */
}

.tile-large {
  min-height: 200px;
}

.tile-inner {
  opacity: 0.85;
}

.tile-selected {
  outline: 2px solid rgb(2, 248, 23) !important;
  opacity: 1;
}

.tile-unselected {
  opacity: 0.65;
}

.tile-setup:hover {
  outline: 2px solid #02b102 !important;
  border-right-width: 8px;
}

.small-resized-font {
  font-size: clamp(10px, 1vw, 18px);
}

.xsmall-resized-font {
  font-size: clamp(8px, 1vw, 10px);
}
</style>
