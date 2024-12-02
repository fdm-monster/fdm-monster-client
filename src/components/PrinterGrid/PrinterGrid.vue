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
      </v-row>
    </v-banner>

    <div class="printer-grid-container d-flex flex-row flex-wrap">
      <div class="flex-fill">
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
        <!-- Columns -->
        <div
          v-if="gridStore.gridEditMode"
          class="d-flex flex-row justify-start"
          style="gap: 10px; width: 100%"
        >
          Columns
          <v-btn
            x-small
            rounded
            :disabled="settingsStore.gridCols <= 1"
            @click="decrementGridCols()"
          >
            <v-icon>remove</v-icon>
          </v-btn>
          <v-btn
            x-small
            rounded
            :disabled="settingsStore.gridCols >= 12"
            @click="incrementGridCols()"
          >
            <v-icon>add</v-icon>
          </v-btn>
        </div>
      </div>
      <!-- Rows -->
      <div
        v-if="gridStore.gridEditMode"
        class="d-flex flex-column justify-start"
        style="gap: 10px; margin-top: 10px"
      >
        Rows
        <v-btn x-small rounded :disabled="settingsStore.gridRows <= 1" @click="decrementGridRows()">
          <v-icon>remove</v-icon>
        </v-btn>
        <v-btn
          x-small
          rounded
          :disabled="settingsStore.gridRows >= 16"
          @click="incrementGridRows()"
        >
          <v-icon>add</v-icon>
        </v-btn>
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

async function incrementGridRows() {
  if (!gridStore.gridEditMode || !settingsStore.frontendSettings) return;
  if (settingsStore.frontendSettings.gridRows >= 16) return;

  settingsStore.frontendSettings.gridRows++;
  await settingsStore.saveFrontendSettings();
}

async function incrementGridCols() {
  if (!gridStore.gridEditMode || !settingsStore.frontendSettings) return;
  if (settingsStore.frontendSettings.gridCols >= 12) return;

  settingsStore.frontendSettings.gridCols++;
  await settingsStore.saveFrontendSettings();
}

async function decrementGridRows() {
  if (!gridStore.gridEditMode || !settingsStore.frontendSettings) return;
  if (settingsStore.frontendSettings.gridRows == 1) return;
  settingsStore.frontendSettings.gridRows--;
  await settingsStore.saveFrontendSettings();
}

async function decrementGridCols() {
  if (!gridStore.gridEditMode || !settingsStore.frontendSettings) return;
  if (settingsStore.frontendSettings.gridCols == 1) return;
  settingsStore.frontendSettings.gridCols--;
  await settingsStore.saveFrontendSettings();
}
</script>

<style scoped>
.printer-grid-container {
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
