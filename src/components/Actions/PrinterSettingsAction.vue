<template>
  <v-btn class="ma-2" color="primary" fab small @click="openSettings()">
    <v-icon>settings</v-icon>
  </v-btn>
</template>

<script lang="ts" setup>
import type {Printer} from "@/models/printers/printer.model";
import {computed} from "vue";

const {printer} = defineProps<{ printer: Printer }>();

const printerId = computed(() => {
  return printer.id;
});

function openSettings() {
  // TODO bus / emit
  // this.$emit("update:show", this.printer.id);
}
</script>
