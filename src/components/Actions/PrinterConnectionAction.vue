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
    <v-btn
        :color="printer.printerState.colour.name"
        :disabled="isPrinterPrinting()"
        fab
        small
        @click="togglePrinterConnection()"
    >
      <v-icon>usb</v-icon>
    </v-btn>
  </v-badge>
</template>

<script lang="ts" setup>
import type {Printer} from "@/models/printers/printer.model";
import {PrintersService} from "@/backend";
import {usePrintersStore} from "@/stores/printers";
import {computed} from "vue";

const printersStore = usePrintersStore();
const {printer} = defineProps<{ printer: Printer }>();

const printerId = computed(() => {
  return printer.id;
});

function isPrinterOperational() {
  return printersStore.isPrinterOperational(printerId.value);
}

function isPrinterPrinting() {
  return printersStore.isPrinterPrinting(printerId.value);
}

async function togglePrinterConnection() {
  if (isPrinterOperational()) {
    return PrintersService.sendPrinterDisconnectCommand(printerId.value);
  }

  await PrintersService.sendPrinterConnectCommand(printerId.value);
}

</script>
