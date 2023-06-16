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
      class="tile fill-height"
      outlined
      tile
      @click="selectOrUnplacePrinter()"
    >
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
      <v-container v-if="printerId" class="tile-inner fill-height">
        <small class="small-resized-font">
          {{ printer.printerName }}
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
            <v-list-item :close-on-click="true" @click="clickOpenPrinterURL()">
              <v-icon>directions</v-icon>
              &nbsp;Visit OctoPrint
            </v-list-item>
            <v-list-item :close-on-click="true" @click="clickOpenSettings()">
              <v-icon>settings</v-icon>
              &nbsp;Edit Printer
            </v-list-item>
            <v-list-item :close-on-click="true" @click="clickEmergencyStop()">
              <v-icon>stop</v-icon>
              &nbsp;Emergency stop
            </v-list-item>
          </v-list>
        </v-menu>
        <div v-if="!gridStore.gridEditMode" class="float-right d-none d-xl-inline">
          <!-- Connect USB -->
          <v-btn
            v-if="
              !printerStateStore.isPrinterOperational(printerId) &&
              printerStateStore.isApiResponding(printerId)
            "
            icon
            @click.prevent.stop="clickConnectUsb()"
          >
            <v-icon>usb</v-icon>
          </v-btn>

          <!-- Emergency stop button -->
          <v-tooltip v-if="printerStateStore.isPrinterOperational(printerId)" bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                elevation="4"
                icon
                size="36"
                v-bind="attrs"
                v-on="on"
                @click.prevent.stop="clickEmergencyStop()"
              >
                <v-icon>dangerous</v-icon>
              </v-btn>
            </template>
            <template v-slot:default>
              <span>Send an emergency stop, causing USB to be disconnected.</span>
            </template>
          </v-tooltip>

          <!-- Refresh connectivity button -->
          <v-tooltip
            v-if="printer.enabled && printerStateStore.isPrinterNotOnline(printerId)"
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
          <v-btn icon @click.prevent.stop="clickInfo()">
            <v-icon>menu_open</v-icon>
          </v-btn>
        </div>
        <strong v-else class="float-end">
          <v-icon>disabled_visible</v-icon>
          Click to clear
        </strong>
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
                <small>{{ printerState.text?.toUpperCase() }}</small>
              </span>
            </small>
          </template>
          Maintenance reason: <br />
          {{ printer.disabledReason }}
        </v-tooltip>
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
        height="10"
      >
        <span class="xsmall-resized-font">{{ currentPrintingFilePath }}</span>
      </v-progress-linear>
    </v-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { CustomGcodeService } from "@/backend/custom-gcode.service";
import { PrintersService } from "@/backend";
import { usePrinterStore } from "../../store/printer.store";
import { useDialogsStore } from "@/store/dialog.store";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { useGridStore } from "../../store/grid.store";
import { FloorService } from "../../backend/floor.service";
import { useSettingsStore } from "../../store/settings.store";
import { useFloorStore } from "../../store/floor.store";
import { interpretStates } from "../../shared/printer-state.constants";
import { usePrinterStateStore } from "../../store/printer-state.store";
import { infoMessageEvent } from "../../shared/alert.events";
import { Printer } from "../../models/printers/printer.model";

const defaultColor = "rgba(100,100,100,0.1)";

export default defineComponent({
  name: "PrinterGridTile",
  components: {},
  props: {
    printer: Object as PropType<Printer>,
    x: Number,
    y: Number,
  },
  setup() {
    return {
      printerStore: usePrinterStore(),
      printerStateStore: usePrinterStateStore(),
      floorStore: useFloorStore(),
      settingsStore: useSettingsStore(),
      gridStore: useGridStore(),
      dialogsStore: useDialogsStore(),
    };
  },
  computed: {
    printerId() {
      return this.printer?.id;
    },
    selected() {
      if (!this.printerId) return false;
      return this.printerStore.isSelectedPrinter(this.printerId);
    },
    unselected() {
      return this.printerStore.selectedPrinters?.length && !this.selected;
    },
    largeTilesEnabled() {
      return this.settingsStore.largeTiles;
    },
    printerState() {
      if (!this.printerId?.length) return;
      const printer = this.printerStore.printer(this.printerId);
      if (!printer) return;

      const printerEvents = this.printerStateStore.printerEventsById[this.printerId];
      const socketState = this.printerStateStore.socketStatesById[this.printerId];
      const states = interpretStates(printer, socketState, printerEvents);
      return states;
    },
    printerStateColor() {
      const states = this.printerState;
      if (!states) return defaultColor;
      return states.rgb || defaultColor;
    },
    currentJob() {
      if (!this.printerId?.length) return;
      return this.printerStateStore.printerJobsById[this.printerId];
    },
    currentPrintingFilePath() {
      if (!this.printerId?.length) return;
      return this.printerStateStore.printingFilePathsByPrinterId[this.printerId];
    },
  },
  methods: {
    clickInfo() {
      this.printerStore.setSideNavPrinter(this.printer);
    },
    async clickRefreshSocket() {
      if (!this.printerId?.length) return;
      await PrintersService.refreshSocket(this.printerId);
      this.$bus.emit(infoMessageEvent, "Refreshing OctoPrint connection state");
    },
    clickOpenPrinterURL() {
      if (!this.printer) return;
      PrintersService.openPrinterURL(this.printer.printerURL);
    },
    clickOpenSettings() {
      this.printerStore.setUpdateDialogPrinter(this.printer);
      this.dialogsStore.openDialog(DialogName.UpdatePrinterDialog);
    },
    async clickEmergencyStop() {
      if (!this.printerId?.length) return;
      if (
        confirm("Are you sure to abort the print in Emergency Stop mode? Please reconnect after.")
      ) {
        await CustomGcodeService.postEmergencyM112Command(this.printerId);
      }
    },
    async clickConnectUsb() {
      if (!this.printerId?.length) return;
      await PrintersService.sendPrinterConnectCommand(this.printerId);
    },
    async selectOrUnplacePrinter() {
      if (!this.printer || !this.printerId) return;
      if (this.gridStore.gridEditMode) {
        const floorId = this.floorStore.selectedFloor?._id;
        if (!floorId) throw new Error("Cant clear printer, floor not selected");
        await FloorService.deletePrinterFromFloor(floorId, this.printerId);

        return;
      }

      this.printerStore.toggleSelectedPrinter(this.printer);
    },
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

.filament-abs-border {
  position: absolute;
  right: 0;
  top: 0;
  width: 14px;
  height: 100%;
  /*background: repeating-linear-gradient(-30deg, #222, #555 5px, #444 5px, #555 6px);*/
  border: 2px solid rgba(255, 250, 250, 0.5);
}
</style>
