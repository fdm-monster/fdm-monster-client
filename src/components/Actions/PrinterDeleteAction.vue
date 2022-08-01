<template>
  <v-btn color="warning" outlined @click="deletePrinter()">
    <v-icon>delete</v-icon>
    <span class="d-none d-lg-inline">Delete printer</span>
  </v-btn>
</template>

<script lang="ts" setup>
import type { Printer } from "@/models/printers/printer.model";

const printersStore = usePrintersStore();
const { printer } = defineProps<{ printer: Printer }>();

const printerId = computed(() => {
  return printer.id;
});

async function deletePrinter() {
  await printersStore.deletePrinter(printerId.value);
}
</script>
