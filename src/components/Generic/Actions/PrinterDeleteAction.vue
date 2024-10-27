<template>
  <v-btn class="ma-2" color="primary" fab small @click.prevent.stop="deletePrinter">
    <v-icon>delete</v-icon>
  </v-btn>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";
import { PrinterDto } from "@/models/printers/printer.model";
import { usePrinterStore } from "@/store/printer.store";

const props = defineProps<{
  printer: PrinterDto;
}>();

const printersStore = usePrinterStore();

async function deletePrinter() {
  if (!confirm("Are you sure to delete this printer?")) return;
  await printersStore.deletePrinter(props.printer.id);
}
</script>
