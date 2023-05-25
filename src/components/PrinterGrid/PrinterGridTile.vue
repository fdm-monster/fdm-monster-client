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
      <v-container v-if="printer" class="tile-inner fill-height">
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
          <v-btn icon @click.prevent.stop="clickEmergencyStop()">
            <v-icon>dangerous</v-icon>
          </v-btn>
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
          :disabled="!printer.disabledReason"
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
              <span v-if="printer.disabledReason">
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
        v-if="currentJob"
        :value="currentJob.progress"
        absolute
        bottom
        color="green"
      >
      </v-progress-linear>
    </v-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Printer } from "@/models/printers/printer.model";
import RAL_CODES from "@/constants/ral.reference.json";
import { CustomGcodeService } from "@/backend/custom-gcode.service";
import { PrintersService } from "@/backend";
import { usePrinterStore } from "../../store/printer.store";
import { useDialogsStore } from "@/store/dialog.store";
import { DialogName } from "@/components/Generic/Dialogs/dialog.constants";
import { useGridStore } from "../../store/grid.store";
import { FloorService } from "../../backend/floor.service";
import { filamentColorParse } from "../../constants/experimental.constants";
import { useSettingsStore } from "../../store/settings.store";
import { useFloorStore } from "../../store/floor.store";
import { interpretStates } from "../../shared/printer-state.constants";
import { usePrinterStateStore } from "../../store/printer-state.store";

const defaultColor = "rgba(100,100,100,0.1)";
const maintenanceColor = "black";
const defaultFilamentGradient =
  "repeating-linear-gradient(-30deg, #222, #555 5px, #444 5px, #555 6px)";

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
    selected() {
      if (!this.printer) return false;
      return this.printerStore.isSelectedPrinter(this.printer?.id);
    },
    unselected() {
      return this.printerStore.selectedPrinters?.length && !this.selected;
    },
    printers() {
      return this.printerStore.printers;
    },
    printerFilamentColorName() {
      const printerColor = this.printerFilamentColor();
      if (!printerColor) {
        return "UNKNOWN";
      }
      return `${this.printer?.lastPrintedFile.parsedColor}`;
    },
    printerFilamentColorRgba() {
      const ralCode = this.printer?.lastPrintedFile.parsedVisualizationRAL;
      if (!ralCode) {
        return defaultFilamentGradient;
      }

      const ralString = ralCode.toString();
      const foundColor = Object.values(RAL_CODES).find((r) => r.code === ralString);
      if (!foundColor) {
        return defaultFilamentGradient;
      }
      return `${foundColor.color.hex}`;
    },
    largeTilesEnabled() {
      return this.settingsStore.largeTiles;
    },
    printerState() {
      if (!this.printer?.id) return null;
      if (this.printer.disabledReason?.length) return null;

      const printerEvents = this.printerStateStore.printerEventsById[this.printer.id];
      const socketState = this.printerStateStore.socketStatesById[this.printer.id];
      const states = interpretStates(this.printer, socketState, printerEvents);
      return states;
    },
    printerStateColor() {
      const states = this.printerState;
      if (!states) return defaultColor;
      return states.rgb || defaultColor;
    },
    currentJob() {
      if (!this.printer?.id) return;
      return this.printerStateStore.printerJobsById[this.printer?.id];
    },
  },
  methods: {
    filamentColorParse() {
      return filamentColorParse;
    },
    clickInfo() {
      this.printerStore.setSideNavPrinter(this.printer);
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
      if (!this.printer) return;
      if (
        confirm("Are you sure to abort the print in Emergency Stop mode? Please reconnect after.")
      ) {
        await CustomGcodeService.postEmergencyM112Command(this.printer.id);
      }
    },
    async selectOrUnplacePrinter() {
      if (!this.printer?.id) return;

      if (this.gridStore.gridEditMode) {
        const floorId = this.floorStore.selectedFloor?._id;
        if (!floorId) throw new Error("Cant clear printer, floor not selected");
        await FloorService.deletePrinterFromFloor(floorId, this.printer.id);

        return;
      }

      this.printerStore.toggleSelectedPrinter(this.printer);
    },
    printerFilamentColor() {
      const ralCode = this.printer?.lastPrintedFile.parsedVisualizationRAL;
      if (!ralCode) {
        return undefined;
      }

      const ralString = ralCode.toString();
      return Object.values(RAL_CODES).find((r) => r.code === ralString);
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
