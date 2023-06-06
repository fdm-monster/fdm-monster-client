<template>
  <v-tooltip top>
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        v-bind="attrs"
        v-on="on"
        class="ma-2"
        color="primary"
        fab
        small
        @click.c.capture.native.stop="syncPrinterName(printer)"
      >
        <v-icon>badge</v-icon>
      </v-btn>
    </template>
    <template v-slot:default> Set OctoPrints name to the FDM Monster Name </template>
  </v-tooltip>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Printer } from "@/models/printers/printer.model";
import { PrinterSettingsService } from "@/backend/printer-settings.service";
import { infoMessageEvent } from "../../../shared/alert.events";

export default defineComponent({
  name: "SyncPrinterNameAction",
  props: {
    printer: Object as PropType<Printer>,
  },
  computed: {
    printerId() {
      return this.printer!.id;
    },
  },
  methods: {
    async syncPrinterName(printer: Printer) {
      await PrinterSettingsService.syncPrinterName(printer.id);
      this.$bus.emit(infoMessageEvent, "Synced printer name to OctoPrint");
    },
  },
});
</script>
