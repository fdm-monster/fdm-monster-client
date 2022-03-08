<template>
  <v-btn
      class="ma-2"
      color="primary"
      fab
      small
      @click.c.capture.native.stop="openPrinterURL(printer)"
  >
    <v-icon>directions</v-icon>
  </v-btn>
</template>

<script lang="ts" setup>
import type {Printer} from "@/models/printers/printer.model";
import {PrintersService} from "@/backend";
import {computed} from "vue";

const {printer} = defineProps<{ printer: Printer }>();

const printerId = computed(() => {
  return printer.id;
});

function openPrinterURL(printer: Printer) {
  PrintersService.openPrinterURL(printer.printerURL);
}
</script>
