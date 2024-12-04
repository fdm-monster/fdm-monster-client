<template>
  <v-btn class="ma-2" fab small @click.c.capture.native.stop="openPrinterURL()">
    <v-icon>directions</v-icon>
  </v-btn>
</template>

<script lang="ts" setup>
import { PrinterDto } from "@/models/printers/printer.model";
import { PrintersService } from "@/backend";

const props = defineProps<{
  printer: PrinterDto;
}>();

async function openPrinterURL() {
  PrintersService.openPrinterURL(props.printer.printerURL);
}
</script>
