<template>
  <v-tooltip top>
    <template v-slot:activator="{ on, attrs }">
      <v-btn class="ma-2" fab small @click.prevent.stop="deletePrinter" v-bind="attrs" v-on="on">
        <v-icon>delete</v-icon>
      </v-btn>
    </template>
    <template v-slot:default>Delete printer</template>
  </v-tooltip>
</template>

<script lang="ts" setup>
import { PrinterDto } from "@/models/printers/printer.model";
import { usePrinterStore } from "@/store/printer.store";
import { usePrinterStateStore } from "@/store/printer-state.store";

const props = defineProps<{
  printer: PrinterDto;
}>();

const printersStore = usePrinterStore();
const printerStateStore = usePrinterStateStore();

async function deletePrinter() {
  if (!confirm("Are you sure to delete this printer?")) return;

  await printersStore.deletePrinter(props.printer.id);

  // This is a best-effort, the socket-io updates will decide eventually
  printerStateStore.deletePrinterEvents(props.printer.id);
}
</script>
