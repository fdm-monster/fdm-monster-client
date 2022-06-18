<template>
  <div>
    <v-row v-for="y in rows" :key="y" class="ma-1" no-gutters>
      <v-col
        v-for="x in columns"
        :key="x"
        :cols="columnWidth"
        :sm="columnWidth"
      >
        <v-row class="test-top" no-gutters>
          <v-col cols="6">
            <PrinterGridTile
              :loading="loading"
              :printer="getPrinter(x, y, 3)"
            />
          </v-col>
          <v-col cols="6">
            <PrinterGridTile
              :loading="loading"
              :printer="getPrinter(x, y, 0)"
            />
          </v-col>
        </v-row>
        <v-row class="test-bottom" no-gutters>
          <v-col cols="6">
            <PrinterGridTile
              :loading="loading"
              :printer="getPrinter(x, y, 2)"
            />
          </v-col>
          <v-col cols="6">
            <PrinterGridTile
              :loading="loading"
              :printer="getPrinter(x, y, 1)"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import {
  columnCount,
  rowCount,
  totalVuetifyColumnCount,
} from "@/shared/printer-grid.constants";
import type { PrinterGroup } from "@/models/printers/printer-group.model";

export default defineComponent({
  data: () => ({
    maxColumnUnits: totalVuetifyColumnCount, // Built-in to vuetify
    columns: columnCount, // x-value choice
    rows: rowCount, // y-value choice
  }),
  setup: () => {
    return {
      printerGroupsStore: usePrinterGroupsStore(),
      printersStore: usePrintersStore(),
      groupMatrix: ref<PrinterGroup[][]>([]),
      columnWidth: ref(3), // default value overwritten later
      loading: ref(true),
    };
  },
  async mounted() {
    this.calculateGrid();
    await this.printersStore.loadPrinters();
    await this.printerGroupsStore.loadPrinterGroups();
    this.loading = false;
    this.updateGridMatrix();

    // TODO BUS
    // this.$bus.on(sseGroups, this.onSseMessage);
  },
  computed: {
    printers() {
      return this.printersStore.printers;
    },
  },
  methods: {
    updateGridMatrix() {
      this.groupMatrix = this.printerGroupsStore.gridSortedPrinterGroups(4, 4);
    },
    calculateGrid() {
      this.columnWidth = this.maxColumnUnits / this.columns;
    },
    getPrinter(col: number, row: number, index: number) {
      const x = col - 1;
      const y = this.rows - row;

      if (!this.groupMatrix?.length || !this.groupMatrix[x]) return;
      const group = this.groupMatrix[x][y];
      if (!group) return;

      const printerInGroup = this.groupMatrix[x][y].printers?.find(
        (p) => p.location === index.toString()
      );

      if (!printerInGroup) return;

      return this.printersStore.printer(printerInGroup.printerId);
    },
    onSseMessage() {
      this.updateGridMatrix();
    },
  },
});
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
