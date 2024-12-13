<template>
  <v-tooltip top>
    <template v-slot:activator="{ on, attrs }">
      <v-badge v-if="printer.enabled" :color="isPrinterOperational() ? 'green' : 'red'" overlap>
        <template v-slot:badge>
          <v-icon v-if="isPrinterOperational()">check</v-icon>
          <v-icon v-else>close</v-icon>
        </template>
        <v-btn
          v-bind="attrs"
          v-on="on"
          :disabled="isPrinterPrinting()"
          fab
          small
          @click.c.capture.native.stop="togglePrinterConnection()"
        >
          <v-icon>usb</v-icon>
        </v-btn>
      </v-badge>
    </template>
    <template v-slot:default>Connect USB (OctoPrint only)</template>
  </v-tooltip>
</template>

<script lang="ts" setup>
import { PrinterDto } from "@/models/printers/printer.model";
import { PrintersService } from "@/backend";
import { usePrinterStateStore } from "@/store/printer-state.store";

const props = defineProps<{
  printer: PrinterDto;
}>();

const printerStateStore = usePrinterStateStore();

function isPrinterOperational() {
  if (!props.printer.id) {
    return false;
  }
  return printerStateStore.isPrinterOperational(props.printer.id);
}

function isPrinterPrinting() {
  if (!props.printer.id) {
    return false;
  }
  return printerStateStore.isPrinterPrinting(props.printer.id);
}

async function togglePrinterConnection() {
  if (isPrinterOperational()) {
    return PrintersService.sendPrinterDisconnectCommand(props.printer.id);
  }
  await PrintersService.sendPrinterConnectCommand(props.printer.id);
}
</script>
