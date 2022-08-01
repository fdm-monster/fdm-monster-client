<template>
  <v-btn color="secondary" @click="getFiles">
    <v-icon>refresh</v-icon>
    <span class="d-none d-lg-inline">Refresh files</span>
  </v-btn>
</template>

<script setup lang="ts">
import type { Printer } from "@/models/printers/printer.model";

const { printer } = defineProps<{ printer: Printer }>();
const printerFilesStore = usePrinterFilesStore();

async function getFiles() {
  await printerFilesStore.loadPrinterFiles({
    printerId: printer.id,
    recursive: false,
  });
}
</script>
