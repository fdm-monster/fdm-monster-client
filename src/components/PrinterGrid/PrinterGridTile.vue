<template>
  <v-card
    v-drop-upload="{ printers: [printer] }"
    :class="{ 'tile-selected': selected, 'tile-setup': printer }"
    :disabled="!printer"
    :style="{ 'background-color': printerStateColor }"
    class="tile"
    outlined
    tile
    @click="selectPrinter()"
  >
    <v-container v-if="printer">
      <small class="small-resized-font ml-2">
        {{ printer.printerName }}
      </small>
      <v-btn
        class="float-right"
        icon
        size="20"
        @click.prevent.stop="clickInfo()"
      >
        <v-icon>info</v-icon>
      </v-btn>
      <v-btn
        class="float-right"
        icon
        size="20"
        @click.prevent.stop="clickStop()"
      >
        <v-icon>stop</v-icon>
      </v-btn>
      <br />
      <small class="xsmall-resized-font text--secondary">
        {{ printer.printerState.state }}
      </small>
    </v-container>
    <v-progress-linear
      v-if="printer && printer.currentJob"
      :value="jobProgress(printer.currentJob)"
      absolute
      bottom
      color="green"
    >
    </v-progress-linear>
  </v-card>
</template>

<script lang="ts">
import type { Printer } from "@/models/printers/printer.model";
import type {PrinterCurrentJob, PrinterJob} from "@/models/printers/printer-current-job.model";

export default defineComponent({
  props: {
    printer: {
      type: Object as () => Printer,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  setup: () => {
    return {
      printersStore: usePrintersStore(),
    };
  },
  data: () => ({}),
  mounted() {},
  computed: {
    selected() {
      if (!this.printer) return false;
      return this.printersStore.isSelectedPrinter(this.printer?.id);
    },
    printers() {
      return this.printersStore.printers;
    },
    printerStateColor() {
      return this.printer?.printerState.colour.hex || "rgba(0,0,0,0)";
    },
    id() {
      return this.printer?.printerName;
    },
  },
  methods: {
    jobProgress(printerJob: PrinterCurrentJob | PrinterJob) {
      return (printerJob as PrinterCurrentJob)?.progress;
    },
    getTileClass() {
      return this.selected ? "tile tile-selected" : "tile";
    },
    clickInfo() {
      this.printersStore.setSideNavPrinter(this.printer);
    },
    clickStop() {
      this.printersStore.sendStopJobCommand(this.printer?.id);
    },
    selectPrinter() {
      if (!this.printer) return;
      this.printersStore.toggleSelectedPrinter(this.printer);
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

.tile-setup:hover {
  border: 1px solid red !important;
}

.tile-selected {
  border: 1px solid green !important;
}

.small-resized-font {
  font-size: clamp(10px, 1vw, 18px);
}

.xsmall-resized-font {
  font-size: clamp(8px, 1vw, 10px);
}
</style>
