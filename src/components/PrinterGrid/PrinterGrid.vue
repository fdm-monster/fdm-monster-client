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

    <div class="printer-grid-container">
      <div class="printer-grid" :style="gridStyle">
        <div
          v-for="index in totalCells"
          :key="`printer-${getX(index - 1)}-${getY(index - 1)}`"
          class="printer-cell"
        >
          <PrinterGridTile
            :printer="getPrinter(getX(index - 1), getY(index - 1))"
            :x="getX(index - 1)"
            :y="getY(index - 1)"
          />
        </div>
      </div>
    </div>

    <img
      alt="FDM Monster Background"
      class="grid-bg-img align-content-center"
      src="/img/logo.svg"
      style="opacity: 0.08; pointer-events: none"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from "vue";
import PrinterGridTile from "@/components/PrinterGrid/PrinterGridTile.vue";
import { usePrinterStore } from "@/store/printer.store";
import { PrinterDto } from "@/models/printers/printer.model";
import { useGridStore } from "@/store/grid.store";
import { dragAppId, INTENT, PrinterPlace } from "@/shared/drag.constants";
import { useSettingsStore } from "@/store/settings.store";
import { useFloorStore } from "@/store/floor.store";

const printerStore = usePrinterStore();
const floorStore = useFloorStore();
const settingsStore = useSettingsStore();
const gridStore = useGridStore();

onMounted(async () => {
  await printerStore.loadPrinters();
  await floorStore.loadFloors();
});

const props = defineProps({
  gap: {
    type: String,
    default: "4px",
  },
});

const printerMatrix = computed(() => floorStore.gridSortedPrinters);
const columns = computed(() => settingsStore.gridCols);
const rows = computed(() => settingsStore.gridRows);

const totalCells = computed(() => rows.value * columns.value);
const gridStyle = computed(() => ({
  display: "grid",
  gridTemplateColumns: `repeat(${columns.value}, 1fr)`,
  gap: props.gap,
}));

const getX = (index: number) => index % columns.value;
const getY = (index: number) => Math.floor(index / columns.value);

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

<style scoped>
.printer-grid-container {
  width: 100%;
}

.printer-grid {
  width: 100%;
}

.printer-cell {
  padding: 8px;
}

.grid-bg-img {
  position: fixed;
  height: 100vh;
  top: 50vh;
  width: 600%;
  left: -250%;
  filter: grayscale(100%);
}
</style>
