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
        @click.c.capture.native.stop="syncPrinterName()"
      >
        <v-icon>badge</v-icon>
      </v-btn>
    </template>
    <template v-slot:default> Set OctoPrints name to the FDM Monster Name </template>
  </v-tooltip>
</template>

<script lang="ts" setup>
import { PrinterDto } from "@/models/printers/printer.model";
import { PrinterSettingsService } from "@/backend/printer-settings.service";
import { useSnackbar } from "@/shared/snackbar.composable";

const props = defineProps<{
  printer: PrinterDto;
}>();

const snackbar = useSnackbar();

async function syncPrinterName() {
  await PrinterSettingsService.syncPrinterName(props.printer.id);
  snackbar.openInfoMessage({
    title: "Synced printer name to OctoPrint",
  });
}
</script>
