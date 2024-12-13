<template>
  <v-tooltip top>
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        class="ma-2"
        v-bind="attrs"
        v-on="on"
        fab
        small
        @click.c.capture.native.stop="openPrinterURL()"
      >
        <v-icon>directions</v-icon>
      </v-btn>
    </template>
    <template v-slot:default>Visit printer service</template>
  </v-tooltip>
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
