<template>
  <div>
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
import { socketIoFloors } from "../../event-bus/socketio.events";
import PrinterGridTile from "@/components/PrinterGrid/PrinterGridTile.vue";
import {
  largeGridcolumnCount,
  largeGridRowCount,
  totalVuetifyColumnCount,
} from "@/constants/printer-grid.constants";
import { usePrintersStore } from "@/store/printers.store";
import { Printer } from "../../models/printers/printer.model";

export default defineComponent({
  components: { PrinterGridTile },
  data(): {
    maxColumnUnits: number;
    printerMatrix: (Printer | undefined)[][];
  } {
    return {
      maxColumnUnits: totalVuetifyColumnCount,
      printerMatrix: [],
    };
  },
  setup() {
    return {
      printersStore: usePrintersStore(),
    };
  },
  async created() {
    await this.printersStore.loadPrinters();
    await this.printersStore.loadFloors();

    this.updateGridMatrix();
  },
  computed: {
    columnWidth() {
      return totalVuetifyColumnCount / this.columns;
    },
    columns() {
      return largeGridcolumnCount;
    },
    rows() {
      return largeGridRowCount;
    },
    printers() {
      return this.printersStore.printers;
    },
    selectedFloorLevel() {
      return this.printersStore.selectedFloor?.floor;
    },
  },
  methods: {
    getPrinter(col: number, row: number) {
      const x = col;
      const y = row;
      if (!this.printerMatrix?.length || !this.printerMatrix[x]) return undefined;
      return this.printerMatrix[x][y];
    },
    updateGridMatrix() {
      this.printerMatrix = this.printersStore.gridSortedPrinters;
    },
    onSocketIoFloorMessage() {
      this.updateGridMatrix();
    },
  },
  async mounted() {
    this.$bus.on(socketIoFloors, this.onSocketIoFloorMessage);
  },
  beforeDestroy() {
    this.$bus.off(socketIoFloors, this.onSocketIoFloorMessage);
  },
});
</script>

<style>
.test-bottom {
  border: 1px solid transparent;
  margin: 0 20px 10px 20px !important;
}

.test-top {
  border: 1px solid transparent;
  margin: 0 20px 0 20px !important;
}
</style>
