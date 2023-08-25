<template>
  <div>
    <img
      alt="FDM Monster Background"
      class="grid-bg-img align-content-center"
      src="/img/logo.svg"
      style="opacity: 0.08"
    />
    <v-banner v-if="gridStore.gridEditMode" style="cursor: move">
      <v-row style="margin-bottom: -5px">
        <v-col>
          <span>
            Drag {{ floorStore.floorlessPrinters.length }} unplaced printer(s) from here to place it
            on the grid.
          </span>
          <v-chip-group>
            <v-chip
              v-for="printer of floorStore.floorlessPrinters"
              :key="printer.id"
              draggable
              small
              @dragstart="onDragStart(printer, $event)"
            >
              {{ printer.printerName }}
            </v-chip>
          </v-chip-group>
        </v-col>
        <v-col>
          <div>
            Clear printers by clicking on
            <strong>
              <v-icon>disabled_visible</v-icon>
              Click to clear
            </strong>
          </div>
        </v-col>
      </v-row>
    </v-banner>
    <v-row v-for="y in rows" :key="y" class="ma-1" no-gutters>
      <v-col v-for="x in columns" :key="x" :cols="columnWidth" :sm="columnWidth">
        <v-row class="test-top" no-gutters>
          <v-col cols="6">
            <PrinterGridTile
              :printer="getPrinter(2 * (x - 1), 2 * (y - 1))"
              :x="2 * (x - 1)"
              :y="2 * (y - 1)"
            />
          </v-col>
          <v-col cols="6">
            <PrinterGridTile
              :printer="getPrinter(2 * (x - 1) + 1, 2 * (y - 1))"
              :x="2 * (x - 1) + 1"
              :y="2 * (y - 1)"
            />
          </v-col>
        </v-row>
        <v-row class="test-bottom" no-gutters>
          <v-col cols="6">
            <PrinterGridTile
              :printer="getPrinter(2 * (x - 1), 2 * (y - 1) + 1)"
              :x="2 * (x - 1)"
              :y="2 * (y - 1) + 1"
            />
          </v-col>
          <v-col cols="6">
            <PrinterGridTile
              :printer="getPrinter(2 * (x - 1) + 1, 2 * (y - 1) + 1)"
              :x="2 * (x - 1) + 1"
              :y="2 * (y - 1) + 1"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import PrinterGridTile from "@/components/PrinterGrid/PrinterGridTile.vue";
import { totalVuetifyColumnCount } from "../../shared/printer-grid.constants";
import { usePrinterStore } from "@/store/printer.store";
import { Printer } from "@/models/printers/printer.model";
import { useGridStore } from "@/store/grid.store";
import { dragAppId, INTENT, PrinterPlace } from "../../shared/drag.constants";
import { useSettingsStore } from "@/store/settings.store";
import { useFloorStore } from "@/store/floor.store";

export default defineComponent({
  components: { PrinterGridTile },
  data(): {
    maxColumnUnits: number;
  } {
    return {
      maxColumnUnits: totalVuetifyColumnCount,
    };
  },
  setup() {
    return {
      printerStore: usePrinterStore(),
      floorStore: useFloorStore(),
      settingsStore: useSettingsStore(),
      gridStore: useGridStore(),
    };
  },
  async created() {
    await this.printerStore.loadPrinters();
    await this.floorStore.loadFloors();
  },
  computed: {
    printerMatrix() {
      return this.floorStore.gridSortedPrinters;
    },
    columnWidth() {
      return totalVuetifyColumnCount / this.columns;
    },
    columns() {
      return this.settingsStore.gridCols / 2;
    },
    rows() {
      return this.settingsStore.gridRows / 2;
    },
    printers() {
      return this.printerStore.printers;
    },
    selectedFloorLevel() {
      return this.floorStore.selectedFloor?.floor;
    },
  },
  methods: {
    onDragStart(printer: Printer, ev: DragEvent) {
      if (!ev.dataTransfer) return;
      if (!printer.id) return;

      ev.dataTransfer.setData(
        "text",
        JSON.stringify({
          appId: dragAppId,
          intent: INTENT.PRINTER_PLACE,
          printerId: printer.id,
        } as PrinterPlace)
      );
    },
    getPrinter(col: number, row: number) {
      const x = col;
      const y = row;
      if (!this.printerMatrix?.length || !this.printerMatrix[x]) return undefined;
      return this.printerMatrix[x][y];
    },
    updateGridMatrix() {
      this.printerMatrix = this.floorStore.gridSortedPrinters;
    },
  },
  async mounted() {},
  beforeDestroy() {},
});
</script>

<style>
.grid-bg-img {
  position: fixed;
  height: 100vh;
  top: 50vh;
  width: 600%;
  left: -250%;
  filter: grayscale(100%);
}

.test-bottom {
  border: 1px solid transparent;
  margin: 0 20px 10px 20px !important;
}

.test-top {
  border: 1px solid transparent;
  margin: 0 20px 0 20px !important;
}
</style>
