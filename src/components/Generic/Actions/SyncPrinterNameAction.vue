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
import { PrinterDto } from "@/models/printers/printer.model";
import { PrinterSettingsService } from "@/backend/printer-settings.service";
import { useSnackbar } from "../../../shared/snackbar.composable";

export default defineComponent({
  name: "SyncPrinterNameAction",
  props: {
    printer: Object as PropType<PrinterDto>,
  },
  setup() {
    return {
      snackbar: useSnackbar(),
    };
  },
  computed: {
    printerId() {
      return this.printer!.id;
    },
  },
  methods: {
    async syncPrinterName(printer: PrinterDto) {
      await PrinterSettingsService.syncPrinterName(printer.id);
      this.snackbar.openInfoMessage({
        title: "Synced printer name to OctoPrint",
      });
    },
  },
});
</script>
