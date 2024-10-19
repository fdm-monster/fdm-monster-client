<template>
  <v-badge
    v-if="printer.enabled"
    :color="isPrinterOperational(printer) ? 'green' : 'red'"
    bordered
    class="ma-2"
    overlap
  >
    <template v-slot:badge>
      <v-icon v-if="isPrinterOperational(printer)">check</v-icon>
      <v-icon v-else>close</v-icon>
    </template>
    <!--    :color="printer.printerState.colour.name"-->
    <v-btn
      :disabled="isPrinterPrinting()"
      fab
      small
      @click.c.capture.native.stop="togglePrinterConnection()"
    >
      <v-icon>usb</v-icon>
    </v-btn>
  </v-badge>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { PrinterDto } from "@/models/printers/printer.model";
import { PrintersService } from "@/backend";
import { usePrinterStore } from "@/store/printer.store";
import { usePrinterStateStore } from "@/store/printer-state.store";

export default defineComponent({
  name: "PrinterConnectionAction",
  components: {},
  setup: () => {
    return {
      printersStore: usePrinterStore(),
      printerStateStore: usePrinterStateStore(),
    };
  },
  async created() {},
  async mounted() {},
  props: {
    printer: Object as PropType<PrinterDto>,
  },
  computed: {
    printerId() {
      return this.printer!.id;
    },
  },
  methods: {
    isPrinterOperational() {
      if (!this.printerId) {
        return false;
      }
      return this.printerStateStore.isPrinterOperational(this.printerId);
    },
    isPrinterPrinting() {
      if (!this.printerId) {
        return false;
      }
      return this.printerStateStore.isPrinterPrinting(this.printerId);
    },
    async togglePrinterConnection() {
      if (this.isPrinterOperational()) {
        return PrintersService.sendPrinterDisconnectCommand(this.printerId);
      }
      await PrintersService.sendPrinterConnectCommand(this.printerId);
    },
  },
});
</script>
