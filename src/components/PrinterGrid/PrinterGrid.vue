<template>
  <div>
    <v-banner v-if="gridStore.gridEditMode">
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
              style="cursor: move"
              @dragstart="onDragStart(printer, $event)"
            >
              {{ printer.name }}
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
    <img
      alt="FDM Monster Background"
      class="grid-bg-img align-content-center"
      src="/img/logo.svg"
      style="opacity: 0.08; pointer-events: none"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, defineComponent, onMounted, ref } from "vue";
import PrinterGridTile from "@/components/PrinterGrid/PrinterGridTile.vue";
import { totalVuetifyColumnCount } from "@/shared/printer-grid.constants";
import { usePrinterStore } from "@/store/printer.store";
import { PrinterDto } from "@/models/printers/printer.model";
import { useGridStore } from "@/store/grid.store";
import { dragAppId, INTENT, PrinterPlace } from "@/shared/drag.constants";
import { useSettingsStore } from "@/store/settings.store";
import { useFloorStore } from "@/store/floor.store";

const maxColumnUnits = ref(totalVuetifyColumnCount);
console.debug("Setup grid");

const printerStore = usePrinterStore();
const floorStore = useFloorStore();
const settingsStore = useSettingsStore();
const gridStore = useGridStore();

onMounted(async () => {
  await printerStore.loadPrinters();
  await floorStore.loadFloors();
});

const printerMatrix = computed(() => floorStore.gridSortedPrinters);
const columns = computed(() => settingsStore.gridCols / 2);
const columnWidth = computed(() => totalVuetifyColumnCount / columns.value);
const rows = computed(() => settingsStore.gridRows / 2);

function onDragStart(printer: PrinterDto, ev: DragEvent) {
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
}

function getPrinter(col: number, row: number) {
  const x = col;
  const y = row;
  if (!printerMatrix.value?.length || !printerMatrix.value[x]) return undefined;
  return printerMatrix.value[x][y];
}
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
