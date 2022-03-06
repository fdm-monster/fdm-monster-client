<template>
  <div>
    <v-row v-for="y in rows" :key="y" class="ma-1" no-gutters>
      <v-col v-for="x in columns" :key="x" :cols="columnWidth" :sm="columnWidth">
        <v-row class="test-top" no-gutters>
          <v-col cols="6">
            <PrinterGridTile :loading="loading" :printer="getPrinter(x, y, 3)"/>
          </v-col>
          <v-col cols="6">
            <PrinterGridTile :loading="loading" :printer="getPrinter(x, y, 0)"/>
          </v-col>
        </v-row>
        <v-row class="test-bottom" no-gutters>
          <v-col cols="6">
            <PrinterGridTile :loading="loading" :printer="getPrinter(x, y, 2)"/>
          </v-col>
          <v-col cols="6">
            <PrinterGridTile :loading="loading" :printer="getPrinter(x, y, 1)"/>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
import {onMounted} from "@vue/runtime-core";
import {onBeforeUnmount, ref} from "vue";
import {columnCount, rowCount, totalVuetifyColumnCount} from "@/constants/printer-grid.constants";
import type {PrinterGroup} from "@/models/printers/printer-group.model";
import {usePrintersStore} from "@/stores/printers";
import {usePrinterGroupsStore} from "@/stores/printer-groups";
import PrinterGridTile from "@/components/PrinterGrid/PrinterTile.vue";

let loading = ref(true);
const printersStore = usePrintersStore();
const printerGroupsStore = usePrinterGroupsStore();

const maxColumnUnits = totalVuetifyColumnCount; // Built-in to vuetify
const columns = columnCount; // x-value choice
const rows = rowCount; // y-value choice

let columnWidth = 3; // default value overwritten later
let groupMatrix: PrinterGroup[][] = [];

defineProps<{}>();

onMounted(async () => {
  calculateGrid();
  await printersStore.loadPrinters();
  await printerGroupsStore.loadPrinterGroups();
  loading.value = false;

  updateGridMatrix();

  // TODO BUS
  // this.$bus.on(sseGroups, this.onSseMessage);
});

onBeforeUnmount(() => {
  // TODO BUS
  // this.$bus.off(sseMessageGlobal, this.onSseMessage);
});

function printers() {
  return printersStore.printers;
}

function calculateGrid() {
  columnWidth = maxColumnUnits / columns;
}

function getPrinter(col: number, row: number, index: number) {
  const x = col - 1;
  const y = rows - row;

  if (!groupMatrix?.length || !this.groupMatrix[x]) return;
  const group = groupMatrix[x][y];
  if (!group) return;

  const printerInGroup = groupMatrix[x][y].printers?.find(
      (p) => p.location === index.toString()
  );

  if (!printerInGroup) return;

  return printersStore.printer(printerInGroup.printerId);
}

function onSseMessage() {
  updateGridMatrix();
}

function updateGridMatrix() {
  groupMatrix = printerGroupsStore.gridSortedPrinterGroups(4, 4);
}
</script>

<style lang="scss" scoped>
.test-bottom {
  border: 1px solid transparent;
  margin: 0 20px 10px 20px !important;
}

.test-top {
  border: 1px solid transparent;
  margin: 0 20px 0 20px !important;
}
</style>